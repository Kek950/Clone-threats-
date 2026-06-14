'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleRegister = async (e) => {
        e.preventDefault()

        if(!username || !password) {
            alert('Заполните все поля')
            return
        }

        try{
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            if(response.ok){
                const user = await response.json()
                localStorage.setItem('logged_in_user', JSON.stringify(user))
                alert('Регистрация прошла успешно')
                router.push('/')
            }
            else{
                const errorData = await response.json()
                alert(errorData.message || 'Ошибка регистрации')
            }

        }
        catch(error){
            console.log("Ошибка сервера: ", error)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center">Регистрация</h1>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm mx-auto">
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Введите имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                    />
                    <input
                        type="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                        Зарегистрироваться
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p>
                        Уже есть аккаунт? <Link href="/" className="text-blue-500 hover:underline">Войти</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}   
