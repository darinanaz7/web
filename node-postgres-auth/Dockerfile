FROM node:18

# Создайте директорию для приложения
WORKDIR /app

# Копируйте package.json и package-lock.json
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копируйте остальные файлы приложения
COPY . .

# Откройте порт
EXPOSE 3003

# Запустите приложение
CMD ["npm", "start"]