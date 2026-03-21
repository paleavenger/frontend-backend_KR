const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// In-memory хранилища
let users = [];
let products = [
    {
        id: nanoid(6),
        title: 'Resident Evil 9: Requiem',
        category: 'Horror',
        description: 'Новая часть культового survival-horror',
        price: 50,
        stock: 12,
        image: '/images/imgwebp.webp',
    },
    {
        id: nanoid(6),
        title: 'Elden Ring',
        category: 'RPG',
        description: 'Хардкорная RPG от FromSoftware',
        price: 40,
        stock: 7,
        image: '/images/img_1.png',
    },
    {
        id: nanoid(6),
        title: 'Cyberpunk 2077',
        category: 'RPG',
        description: 'Футуристическая open-world rpg',
        price: 35,
        stock: 20,
        image: '/images/cyberpk.jpg',
    },
    {
        id: nanoid(6),
        title: 'The Witcher 3',
        category: 'RPG',
        description: 'Продолжение истории Геральта из Ривии',
        price: 25,
        stock: 15,
        image: '/images/img_2.png',
    },
    {
        id: nanoid(6),
        title: 'GTA V',
        category: 'Action',
        description: 'Бандитская драма с полной свободой действий',
        price: 30,
        stock: 10,
        image: '/images/img_3.png',
    },
    {
        id: nanoid(6),
        title: 'Red Dead Redemption 2',
        category: 'Adventure-RPG',
        description: 'Приквел история к первой части',
        price: 45,
        stock: 5,
        image: '/images/rdr2(1).jpg',
    },
    {
        id: nanoid(6),
        title: 'God of War',
        category: 'Action-RPG',
        description: 'Продолжение приключений бога войны',
        price: 40,
        stock: 9,
        image: '/images/img_4.png',
    },
    {
        id: nanoid(6),
        title: 'Hogwarts Legacy',
        category: 'RPG',
        description: 'Вселенная Гарри Поттера',
        price: 50,
        stock: 13,
        image: '/images/img_5.png',
    },
    {
        id: nanoid(6),
        title: "Assassin's Creed Mirage",
        category: 'Stealth-Action',
        description: 'Возвращение к истокам серии',
        price: 38,
        stock: 11,
        image: '/images/img_6.png',
    },
    {
        id: nanoid(6),
        title: 'Spider-Man 2',
        category: 'Action',
        description: 'Вторая часть супергеройского экшена',
        price: 55,
        stock: 8,
        image: '/images/img_7.png',
    },
    {
        id: nanoid(6),
        title: 'METAL GEAR SOLID Δ: SNAKE EATER',
        category: 'Stealth-Action',
        description: 'Ремейк культовой игры с полностью переработанной графикой и звуком.',
        price: 100,
        stock: 8,
        image: '/images/img.png',
    },
    {
        id: nanoid(6),
        title: 'Final Fantasy VII Remake Intergrade',
        category: 'JRPG',
        description: 'Обновлённая версия культовой JRPG с переработанной боевой системой и улучшенной графикой.',
        price: 80,
        stock: 8,
        image: '/images/img_8.png',
    },
];

// Хранилище refresh-токенов
const refreshTokens = new Set();

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
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
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Поля email, first_name, last_name, password обязательны' });
    }

    if (findUserByEmail(email)) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const newUser = {
        id: nanoid(),
        email,
        first_name,
        last_name,
        password: await bcrypt.hash(password, 10),
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Поля email и password обязательны' });
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Неверный пароль' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.status(200).json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
    const header = req.headers.authorization || '';
    const [scheme, refreshToken] = header.split(' ');

    if (scheme !== 'Bearer' || !refreshToken) {
        return res.status(400).json({ error: 'Refresh-токен обязателен (Authorization: Bearer <token>)' });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find(u => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        // Ротация: старый удаляем, новый создаём
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

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

app.get('/api/products', authMiddleware, (req, res) => {
    res.status(200).json(products);
});

app.post('/api/products', authMiddleware, (req, res) => {
    const { title, category, description, price, stock, image } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Поля title, category, description, price обязательны' });
    }

    const newProduct = {
        id: nanoid(6),
        title,
        category,
        description,
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        image: image || '/images/default.jpg',
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.status(200).json(product);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const { title, category, description, price, stock, image } = req.body;
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;

    res.status(200).json(product);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    const deleted = products.splice(index, 1)[0];
    res.status(200).json({ message: 'Товар удалён', product: deleted });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
