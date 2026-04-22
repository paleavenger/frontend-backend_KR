const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Tyur1234',
    port: 5432,
});

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()    
    )
`)

app.post('/api/users', async (req,res) => {
    const {first_name, last_name, age } = req.body;
    const result = await pool.query(
        'INSERT INTO users (first_name, last_name, age) VALUES ($1, $2, $3) RETURNING *',
        [first_name, last_name, age]
    );
    res.json(result.rows[0]);
});

app.get('/api/users', async (req,res) => {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});

app.get('/api/users/:id', async (req,res) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length == 0) return res.status(404).json({ error: 'не найден' });
    res.json(result.rows[0]);
});

app.patch('/api/users/:id', async (req,res) => {
    const {first_name, last_name, age } = req.body;
    const result = await pool.query(
        'UPDATE users SET first_name = $1, last_name = $2, age = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [first_name, last_name, age, req.params.id]
    );
    if (result.rows.length == 0) return res.status(404).json({ error: 'не найден'});
    res.json(result.rows[0]);
});

app.delete('/api/users/:id', async (req,res) => {
    const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [req.params.id]
    );
    if (result.rows.length == 0) return res.status(404).json({ error: 'не найден'});
    res.json({ message: 'Удалён', user: result.rows[0]});
});

app.listen(3000, () => console.log('http://localhost:3000'));
