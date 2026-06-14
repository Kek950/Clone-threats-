import { NextResponse } from "next/server";
import fs from "fs/promises"
import path from "path";

const dataPath = path.join(process.cwd(), 'app', 'data.json') // @\app\data.json

async function readData() {
    try{
        const file = await fs.readFile(dataPath)
        return JSON.parse(file)
    }
    catch(error){
        console.log(error)
        return{users: [], posts: []}
    }
}

async function writeData(data){
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2))
}

// ------------------------------------


export async function POST(req){
    const {username, password} = await req.json()
    const data = await readData()

    const existingUser = data.users.find(user => user.username === username)
    if(existingUser){
        return NextResponse.json({error: "Username already exists"}, {status: 409})
    }

    const newUser = {
        id: (data.users.length + 1).toString(),
        username,
        password
    }

    data.users.push(newUser)
    await writeData(data)
    
    const {password: _, ...userWithoutPassword} = newUser
    return NextResponse.json(userWithoutPassword)
}