const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',   
    host: 'localhost',      
    database: 'web1',    
    password: '060307', 
    port: 5432,             
});

// Проверка подключения к базе данных при запуске
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Соединение с базой данных установлено:', res.rows[0]);
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

    // Валидация длины имени пользователя
    if (username.length < 2) {
        return res.send('Username must be at least 2 characters long.');
    }

    // Валидация пароля
    if (password.length < 12 ||  !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return res.send('Password must be at least 12 characters long and include uppercase letters, lowercase letters, and numbers.');
    }

    try {
        console.log('Проверка, существует ли пользователь...');
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (userExists.rows.length > 0) {
            console.log('Пользователь уже существует.');
            return res.send('User already exists. Please login.');
        }


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



// Запуск сервера
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Дополнительный запрос для проверки пользователей
pool.query('SELECT * FROM users', (err, res) => {
    if (err) {
        console.error('Ошибка выполнения запроса к базе данных:', err);
    } else {
        console.log('Текущие пользователи в базе данных:', res.rows);
    }
});