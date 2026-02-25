const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

app.use(express.json());


app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let products = [
    {
        id: nanoid(6),
        title: "Resident Evil 9: Requiem",
        category: "Horror",
        description: "Новая часть культового survival-horror",
        price: 50,
        stock: 12,
        rating: 4.8,
        image: "/images/imgwebp.webp"
    },
    {
        id: nanoid(6),
        title: "Elden Ring",
        category: "RPG",
        description: "Хардкорная RPG от FromSoftware",
        price: 40,
        stock: 7,
        rating: 4.9,
        image: "/images/img_1.png"
    },
    {
        id: nanoid(6),
        title: "Cyberpunk 2077",
        category: "RPG",
        description: "Футуристическая open-world rpg",
        price: 35,
        stock: 20,
        rating: 4.5,
        image: "/images/cyberpk.jpg"
    },
    {
        id: nanoid(6),
        title: "The Witcher 3",
        category: "RPG",
        description: "Продолжение истории Геральта из Ривии",
        price: 25,
        stock: 15,
        rating: 5,
        image: "/images/img_2.png"
    },
    {
        id: nanoid(6),
        title: "GTA V",
        category: "Action",
        description: "Бандитская драма с полной свободой действий",
        price: 30,
        stock: 10,
        rating: 4.7,
        image: "/images/img_3.png"
    },
    {
        id: nanoid(6),
        title: "Red Dead Redemption 2",
        category: "Adventure-RPG",
        description: "Приквел история к первой части",
        price: 45,
        stock: 5,
        rating: 4.9,
        image: "/images/rdr2(1).jpg"
    },
    {
        id: nanoid(6),
        title: "God of War",
        category: "Action-RPG",
        description: "Продолжение приключений бога войны",
        price: 40,
        stock: 9,
        rating: 4.8,
        image: "/images/img_4.png"
    },
    {
        id: nanoid(6),
        title: "Hogwarts Legacy",
        category: "RPG",
        description: "Вселенная Гарри Поттера",
        price: 50,
        stock: 13,
        rating: 4.6,
        image: "/images/img_5.png"
    },
    {
        id: nanoid(6),
        title: "Assassin's Creed Mirage",
        category: "Stealth-Action",
        description: "Возвращение к истокам серии",
        price: 38,
        stock: 11,
        rating: 4.4,
        image: "/images/img_6.png"
    },
    {
        id: nanoid(6),
        title: "Spider-Man 2",
        category: "Action",
        description: "Вторая часть супергеройского экшена",
        price: 55,
        stock: 8,
        rating: 4.9,
        image: "/images/img_7.png"
    },
    {
        id: nanoid(6),
        title: "METAL GEAR SOLID Δ: SNAKE EATER",
        category: "Stealth-Action",
        description: "ремейк культовой игры с полностью переработанной графикой и звуком.",
        price: 100,
        stock: 8,
        rating: 5,
        image: "/images/img.png"
    },
    {
        id: nanoid(6),
        title: "Final Fantasy VII Remake Intergrade",
        category: "JRPG",
        description: "обновлённая версия культовой JRPG с переработанной боевой системой, улучшенной графикой и расширенным сюжетом.",
        price: 80,
        stock: 8,
        rating: 5,
        image: "/images/img_8.png"
    }
];
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *         - stock
 *         - rating
 *         - image
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара
 *           example: "a1b2c3"
 *         title:
 *           type: string
 *           description: Название игры
 *           example: "Elden Ring"
 *         category:
 *           type: string
 *           description: Категория игры
 *           example: "RPG"
 *         description:
 *           type: string
 *           description: Описание игры
 *           example: "Хардкорная RPG от FromSoftware"
 *         price:
 *           type: number
 *           description: Цена игры
 *           example: 40
 *         stock:
 *           type: number
 *           description: Количество на складе
 *           example: 10
 *         rating:
 *           type: number
 *           description: Рейтинг игры
 *           example: 4.9
 *         image:
 *           type: string
 *           description: Путь к изображению
 *           example: "/images/game.png"
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех игр
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

app.get("/api/products", (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавить новую игру
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */

app.post("/api/products", (req, res) => {
    const newProduct = { id: nanoid(6), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить данные игры
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID товара
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               price: 45
 *               stock: 20
 *     responses:
 *       200:
 *         description: Игра обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */

app.patch("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    Object.assign(product, req.body);
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить игру
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID товара
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Игра успешно удалена
 *       404:
 *         description: Товар не найден
 */

app.delete("/api/products/:id", (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});