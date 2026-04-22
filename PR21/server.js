const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

const app = express();
const PORT = 3000;

const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const USERS_CACHE_TTL = 60;
const PRODUCTS_CACHE_TTL = 600;

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

let users = [];
let products = [
    { id: nanoid(6), title: 'Resident Evil 9: Requiem',            category: 'Horror',         description: 'Новая часть культового survival-horror',                               price: 50,  stock: 12 },
    { id: nanoid(6), title: 'Elden Ring',                          category: 'RPG',            description: 'Хардкорная RPG от FromSoftware',                                       price: 40,  stock: 7  },
    { id: nanoid(6), title: 'Cyberpunk 2077',                      category: 'RPG',            description: 'Футуристическая open-world rpg',                                       price: 35,  stock: 20 },
    { id: nanoid(6), title: 'The Witcher 3',                       category: 'RPG',            description: 'Продолжение истории Геральта из Ривии',                                price: 25,  stock: 15 },
    { id: nanoid(6), title: 'GTA V',                               category: 'Action',         description: 'Бандитская драма с полной свободой действий',                         price: 30,  stock: 10 },
];
const refreshTokens = new Set();

// Redis
const redisClient = createClient({ url: 'redis://127.0.0.1:6379' });
async function initRedis() {
    await redisClient.connect();
}

function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cached = await redisClient.get(key);
            if (cached) {
                return res.json({ source: 'cache', data: JSON.parse(cached) });
            }
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error('Cache read error:', err);
            next();
        }
    };
}

async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error('Cache save error:', err);
    }
}

async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del('users:all');
        if (userId) await redisClient.del(`users:${userId}`);
    } catch (err) {
        console.error('Users cache invalidate error:', err);
    }
}

async function invalidateProductsCache(productId = null) {
    try {
        await redisClient.del('products:all');
        if (productId) await redisClient.del(`products:${productId}`);
    } catch (err) {
        console.error('Products cache invalidate error:', err);
    }
}

function generateAccessToken(user) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}
function generateRefreshToken(user) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}
function findUserByEmail(email) {
    return users.find(u => u.email === email) || null;
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;
    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Поля email, first_name, last_name, password обязательны' });
    }
    if (findUserByEmail(email)) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const VALID_ROLES = ['user', 'seller', 'admin'];
    const newUser = {
        id: nanoid(),
        email,
        first_name,
        last_name,
        password: await bcrypt.hash(password, 10),
        role: VALID_ROLES.includes(role) ? role : 'user',
        blocked: false,
    };
    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Поля email и password обязательны' });
    const user = findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.blocked) return res.status(403).json({ error: 'Аккаунт заблокирован' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Неверный пароль' });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);
    res.status(200).json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
    const header = req.headers.authorization || '';
    const [scheme, refreshToken] = header.split(' ');
    if (scheme !== 'Bearer' || !refreshToken) return res.status(400).json({ error: 'Refresh-токен обязателен' });
    if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);
        if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

app.get('/api/users', authMiddleware, roleMiddleware(['admin']),
    cacheMiddleware(() => 'users:all', USERS_CACHE_TTL),
    async (req, res) => {
        const data = users.map(({ password: _, ...u }) => u);
        await saveToCache(req.cacheKey, data, req.cacheTTL);
        res.status(200).json({ source: 'server', data });
    }
);

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']),
    cacheMiddleware(req => `users:${req.params.id}`, USERS_CACHE_TTL),
    async (req, res) => {
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        const { password: _, ...data } = user;
        await saveToCache(req.cacheKey, data, req.cacheTTL);
        res.status(200).json({ source: 'server', data });
    }
);

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const { first_name, last_name, role } = req.body;
    const VALID_ROLES = ['user', 'seller', 'admin'];
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (role !== undefined && VALID_ROLES.includes(role)) user.role = role;
    await invalidateUsersCache(user.id);
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    user.blocked = true;
    await invalidateUsersCache(user.id);
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Пользователь заблокирован', user: userWithoutPassword });
});

app.get('/api/products', authMiddleware, roleMiddleware(['user', 'seller', 'admin']),
    cacheMiddleware(() => 'products:all', PRODUCTS_CACHE_TTL),
    async (req, res) => {
        await saveToCache(req.cacheKey, products, req.cacheTTL);
        res.status(200).json({ source: 'server', data: products });
    }
);

app.get('/api/products/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']),
    cacheMiddleware(req => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
    async (req, res) => {
        const product = products.find(p => p.id === req.params.id);
        if (!product) return res.status(404).json({ error: 'Товар не найден' });
        await saveToCache(req.cacheKey, product, req.cacheTTL);
        res.status(200).json({ source: 'server', data: product });
    }
);

app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
    const { title, category, description, price, stock } = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Поля title, category, description, price обязательны' });
    }
    const newProduct = { id: nanoid(6), title, category, description, price: Number(price), stock: stock ? Number(stock) : 0 };
    products.push(newProduct);
    await invalidateProductsCache();
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    const { title, category, description, price, stock } = req.body;
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    await invalidateProductsCache(product.id);
    res.status(200).json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    const deleted = products.splice(index, 1)[0];
    await invalidateProductsCache(deleted.id);
    res.status(200).json({ message: 'Товар удалён', product: deleted });
});

initRedis().then(() => {
    app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
});
