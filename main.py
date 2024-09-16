import psycopg2
import json
import os
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Чтение данных из JSON файла
with open('data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Установка значений по умолчанию для переменных окружения
DB_USER = os.getenv('DB_USER', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_DATABASE = os.getenv('DB_DATABASE', 'practice')
DB_PASSWORD = os.getenv('DB_PASSWORD', '060307')
DB_PORT = os.getenv('DB_PORT', '5432')
EMAIL = os.getenv('EMAIL', '230589@astanait.edu.kz')

# Подключение к базе данных PostgreSQL
try:
    conn = psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_DATABASE
    )
    cursor = conn.cursor()

    # Функция для преобразования списка меток в строку
    def labels_to_string(labels):
        return ', '.join(labels)

    # Вставка данных в таблицу annotations
    for item in data:
        for annotation in item['annotations']:
            if annotation['completed_by']['email'] == EMAIL:
                for result in annotation['result']:
                    query = """
                        INSERT INTO annotations (x, y, width, height, rectanglelabels, image, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    values = (
                        result['value']['x'],
                        result['value']['y'],
                        result['value']['width'],
                        result['value']['height'],
                        labels_to_string(result['value']['rectanglelabels']),
                        item['data']['image'],
                        annotation['created_at']
                    )
                    cursor.execute(query, values)
    
    conn.commit()
    print("Success!")

except (Exception, psycopg2.Error) as error:
    print("Error inserting data:", error)

finally:
    if conn:
        cursor.close()
        conn.close()
