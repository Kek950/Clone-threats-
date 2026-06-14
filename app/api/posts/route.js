// app/api/posts/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises"
import path from "path";

const dataPath = path.join(process.cwd(), 'app', 'data.json')

async function readData() {
    try{
        const file = await fs.readFile(dataPath)
        return JSON.parse(file)
    }
    catch(error){
        console.error('Ошибка чтения данных:', error)
        return{users: [], posts: []}
    }
}

async function writeData(data){
    try{
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
    } catch(error) {
        console.error('Ошибка записи данных:', error)
    }
}

// ------------------------------------

export async function GET() {
    const data = await readData()
    return NextResponse.json(data.posts)
}

export async function POST(req) {
    const newPost = await req.json()
    const data = await readData()
    
    // --------------------------- CHANGE ---------------------------
    // Новое поле imageUrl уже приходит в newPost. 
    // Нам нужно только убедиться, что edited: false.
    const postWithDefaults = {
        ...newPost,
        edited: false,
    }

    data.posts.unshift(postWithDefaults)
    await writeData(data)
    return NextResponse.json(postWithDefaults)
    // ---------------------------------------------------------------------
}

export async function DELETE(req) {
    const {id} = await req.json()
    const data = await readData()

    data.posts = data.posts.filter(post => post.id !== id)
    await writeData(data)
    return NextResponse.json({message: "Post deleted"})
}

export async function PUT(req) {
    const {id, content} = await req.json()
    const data = await readData()

    const postToUpdate = data.posts.find(post => post.id === id)
    
    if(postToUpdate){
        postToUpdate.content = content
        postToUpdate.edited = true
    }
    await writeData(data)
    return NextResponse.json(postToUpdate)
}