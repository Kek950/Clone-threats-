'use client'

import React, { useEffect, useState } from "react"
import {users} from "../../../data"
import { useParams } from "next/navigation"
import Link from "next/link"



export default function UserPage(){

    const {userId} = useParams()
    const [posts, setPoststs] = useState([])
    const user = users.find(u => u.id === userId)

    useEffect(() => {
        const savedPosts = localStorage.getItem('threads_posts')
        if(savedPosts){
            setPoststs(JSON.parse(savedPosts))
        }
    }, [])


    if(!user){
        return(
            <main className="p-8 max-w-2xl mx-auto">
                <h1 className="text2xl font-bold text-center">Пользователь не найден</h1>
                <div className="mt-6 text-center">
                    <Link href="/" className="text-blue-500 hover:underline">Назад ко всем постам</Link>
                </div>
            </main>
        )
    }


    const userPosts = posts.filter(post => post.userId === userId)
  

    return(
        <div>
            <h1>Страница пользователя</h1>
            <div className="my-4">
                <Link href="/" className="text-blue-500 hover:underline">Назад ко всем постам</Link>
            </div>

            {userPosts.length > 0 ? (
                userPosts.map(post => (
                    <div key={post.id} className="border p-4 rounded-lg mb-4 shadow-sm">
                        <p className="text-lg">{post.content}</p>
                    </div>
                ))
            ):(
                <p className="text-center text-gray-500">Постов пока нет :C</p>
            )}
            
        </div>
    )
}