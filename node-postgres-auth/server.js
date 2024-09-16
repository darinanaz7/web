const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const cors = require('cors'); 
const bcrypt = require('bcryptjs');


app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log('Database connection details:', {
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT
});

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  });

// Функция для создания таблицы, если её нет
const createUsersTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Таблица "users" проверена или создана');
    } catch (err) {
        console.error('Ошибка при создании таблицы "users":', err.message);
    }
};

// Проверка подключения к базе данных и создание таблицы при запуске
pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Соединение с базой данных установлено:', res.rows[0]);
        await createUsersTable();  // Создание таблицы при подключении
    }
});

module.exports = pool;

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

// Делаем папку public доступной для клиента
app.use(express.static(path.join(__dirname, 'public')));

// Обработка POST-запроса на регистрацию
app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;

    console.log(username, password);
    
    // Валидация длины имени пользователя
    if (username.length < 2) {
        return res.status(400).send('Username must be at least 2 characters long.');
    }

    // Валидация пароля
    if (password.length < 12 ||  !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).send('Password must be at least 12 characters long and include uppercase letters, lowercase letters, and numbers.');
    }

    try {
        console.log('Проверка, существует ли пользователь...');
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userExists.rows.length > 0) {
            console.log('Пользователь уже существует.');
            return res.status(400).send('User already exists. Please login.');
        }

        // Хеширование пароля перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            console.log('Добавление нового пользователя в базу данных...');
            const result = await pool.query(
                'INSERT INTO users (username, password) VALUES ($1, $2)',
                [username, hashedPassword]
            );
            console.log('Результат запроса:', result);
            res.send('Registration successful! You can now login.');
        } catch (err) {
            console.error('Ошибка при регистрации пользователя:', err.message);
            res.status(500).send('Error registering user');
        }
    } catch (err) {
        console.error('Ошибка при проверке существования пользователя:', err.message);
        res.status(500).send('Error checking user existence');
    }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Проверка, существует ли пользователь...');
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userExists.rows.length <= 0) {
            console.log('Пользователь не зарегистрирован.');
            return res.send('User already exists. Please login.');
        }

        // Проверка пароля
        const user = userExists.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) {
            return res.status(400).send('Invalid password');
        }

        res.send('Login successful!');
    } catch (err) {
        console.error('Ошибка при проверке существования пользователя:', err.message);
        res.status(500).send('Error checking user existence');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
