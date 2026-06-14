// app/api/upload/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Указываем, куда сохранять файлы. 
// В Next.js папка 'public' - это место для статических файлов.
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const userId = formData.get('userId'); // ID пользователя для создания подпапки

        if (!file) {
            return NextResponse.json({ message: 'Нет файла для загрузки.' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ message: 'Отсутствует ID пользователя.' }, { status: 400 });
        }
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Создаем папку для пользователя, если она не существует
        const userUploadDir = path.join(UPLOADS_DIR, userId);
        await fs.mkdir(userUploadDir, { recursive: true });

        // Создаем уникальное имя файла: timestamp + оригинальное расширение
        const ext = path.extname(file.name);
        const fileName = `${Date.now()}${ext}`;
        const filePath = path.join(userUploadDir, fileName);

        // Сохраняем файл
        await fs.writeFile(filePath, buffer);

        // URL для доступа к файлу через браузер
        const publicPath = `/uploads/${userId}/${fileName}`;

        return NextResponse.json({ message: 'Файл успешно загружен', filePath: publicPath }, { status: 200 });

    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        return NextResponse.json({ message: 'Ошибка сервера при загрузке файла.' }, { status: 500 });
    }
}