// app/page.jsx
'use client';

import { useState, useEffect } from 'react'
import { users } from '../data'
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --------------------------- NEW COMPONENT ---------------------------
// Компонент-заглушка (вайрфрейм) для Lazy Loading
const PostSkeleton = () => (
    <div className='border p-4 rounded-lg mb-4 shadow-sm animate-pulse'>
        <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
        <div className='h-8 bg-gray-300 rounded w-full mb-4'></div>
        <div className='h-40 bg-gray-200 rounded w-full'></div>
    </div>
);
// ---------------------------------------------------------------------

// --------------------------- NEW COMPONENT ---------------------------
// Компонент поста с учетом возможности отображения картинки
const PostItem = ({ post, postUser, loggedInUser, editingPostId, editedContent, handleEditClick, handleSaveEdit, handleCancelEdit, setEditedContent, handleDeletePost }) => (
    <div key={post.id} className='border p-4 rounded-lg mb-4 shadow-sm relative'>
        <p className='text-gray-600 italic mb-2'>
            <Link href={`/users/${postUser.id}`} className='text-blue-500 hover:underline'>
                {postUser.username}
            </Link>
        </p>

        {post.imageUrl && (
            <img 
                src={post.imageUrl} 
                alt="Изображение поста" 
                className="w-full h-auto max-h-96 object-cover rounded-lg mb-4" 
            />
        )}

        {editingPostId === post.id ? (
            <div>
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className='border p-2 rounded-lg w-full resize-none'
                    rows="3"
                />

                <div className='mt-2 flex space-x-2'>
                    <button
                        onClick={() => handleSaveEdit(post.id)}
                        className='bg-green-500 text-white p-2 rounded-lg text-sm'>Сохранить</button>
                    <button
                        onClick={handleCancelEdit}
                        className='bg-red-500 text-white p-2 rounded-lg text-sm'>Отмена</button>
                </div>
            </div>
        ) : (
            <>
                <p className='text-lg'>{post.content}</p>
                {post.edited && (
                    <span className='absolute bottom-2 right-4 text-xs text-gray-500 italic'>
                        Edited
                    </span>
                )}
            </>
        )}

        {loggedInUser && loggedInUser.id === postUser.id && editingPostId !== post.id && (
            <div className='mt-4 flex space-x-2'>
                <button
                    onClick={() => handleEditClick(post)}
                    className='bg-yellow-500 text-white p-2 rounded-lg text-sm'
                >
                    Редактировать
                </button>

                <button
                    onClick={() => handleDeletePost(post.id)}
                    className='bg-red-500 text-white p-2 rounded-lg text-sm'
                >
                    Удалить
                </button>
            </div>
        )}
    </div>
);
// ---------------------------------------------------------------------

export default function HomePage() {
    const [loggedInUser, setLoggedInUser] = useState(false)
    const [posts, setPosts] = useState([])
    const [newPostContent, setNewPostContent] = useState('')
    // --------------------------- NEW STATE ---------------------------
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    // ---------------------------------------------------------------------
    const [loginUsername, setLoginUsername] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [isLoginVisible, setIsLoginVisible] = useState(false)
    const [editingPostId, setEditingPostId] = useState(null)
    const [editedContent, setEditedContent] = useState('')
    const router = useRouter()
    // ----------------


    // FUNCTIONS
    
    // Загружаем посты с сервера
    useEffect(() => {
        async function fetchPosts(){
            try{
                const response = await fetch('/api/posts')
                if(response.ok){
                    const data = await response.json()
                    // Имитация задержки для демонстрации Lazy Loading
                    setTimeout(() => {
                        setPosts(data)
                        setIsLoading(false)
                    }, 1000)
                }
                else{
                    console.log("Posts loading error")
                    setIsLoading(false)
                }
            }
            catch(error){
                console.log("Server error: ", error)
                setIsLoading(false)
            }
        }
        fetchPosts()
    }, [])


    // Логинимся (читаем из localStorage)
    useEffect(() => {
        const savedUser = localStorage.getItem('logged_in_user')
        if(savedUser){
            setLoggedInUser(JSON.parse(savedUser))
        }
    }, [])

    // Сохраняем в localStorage
    useEffect(() => {
        if(loggedInUser){
            localStorage.setItem('logged_in_user', JSON.stringify(loggedInUser))
        } else {
            localStorage.removeItem('logged_in_user')
        }
    }, [loggedInUser])


    const handleLogin = () => {
        const user = users.find(u => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword)
        if (user) {
            const {password, ...userWithoutPassword} = user
            setLoggedInUser(userWithoutPassword)
            setIsLoginVisible(false)
        } else {
            alert('Неверное имя пользователя или пароль')
        }
    }

    const handleLogout = () => {
        setLoggedInUser(null)
        setLoginUsername('')
        setLoginPassword('')
    }

    // --------------------------- NEW LOGIC: FILE UPLOAD ---------------------------
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file)
        } else {
            setSelectedFile(null)
            if(file) alert('Пожалуйста, выберите файл-изображение.')
        }
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()
        
        // Проверка, что есть либо контент, либо файл
        if(!newPostContent.trim() && !selectedFile || !loggedInUser) return

        let imageUrl = null;

        // 1. Загрузка файла, если он есть
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userId', loggedInUser.id);
            
            try {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData, // FormData отправляется без заголовка Content-Type
                });

                if (uploadResponse.ok) {
                    const data = await uploadResponse.json();
                    imageUrl = data.filePath; // Получаем путь к сохраненному файлу
                } else {
                    console.log("File upload error");
                    alert('Ошибка при загрузке изображения.');
                    return; // Прерываем создание поста, если загрузка не удалась
                }
            } catch (error) {
                console.log("Server error during upload: ", error);
                alert('Ошибка сервера при загрузке изображения.');
                return;
            }
        }
        
        // 2. Создание поста в базе
        const newPost = {
            id: Date.now().toString(),
            userId: loggedInUser.id,
            content: newPostContent,
            imageUrl: imageUrl, 
            edited: false
        }

        try{
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPost)
            })

            if(response.ok){
                const createdPost = await response.json()
                setPosts([createdPost, ...posts])
                setNewPostContent('')
                setSelectedFile(null)
                // Сброс поля ввода файла
                document.getElementById('file-input').value = null; 
            }else{
                console.log("Post creation error")
            }

        }
        catch(error){
            console.log("Server error: ", error)
        }

    }
    // ---------------------------------------------------------------------

    const handleDeletePost = async (postId) => {

        try{
            const response = await fetch('/api/posts', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: postId})
            })

            if(response.ok){
                const updatedPosts = posts.filter(post => post.id !== postId)
                setPosts(updatedPosts)
            }
            else{
                console.log("Post deletion error")
            }

        }catch(error){
            console.log("Server error: ", error)
        }

    }


    const handleEditClick = (post) => {
        setEditingPostId(post.id)
        setEditedContent(post.content)
    }

    const handleCancelEdit = () => {
        setEditingPostId(null)
        setEditedContent('')
    }

    const handleSaveEdit = async (postId) => {
        if (!editedContent.trim()) return

        try{
            const response = await fetch('/api/posts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: postId, content: editedContent})
            })

            if(response.ok){
                const updatedPostFromServer = await response.json() 
                const newPosts = posts.map(post => {
                    return post.id === postId ? updatedPostFromServer : post
                })
                setPosts(newPosts)
                setEditingPostId(null)
                setEditedContent('')
            }else{
                console.log("Post edit error")
            }

        }catch(error){
            console.log("Server error: ", error)
        }
    }


    if(!loggedInUser){
        return(
            <main className='p-8 max-w-2xl mx-auto'>
               <h1 className='text-3xl font-bold mb-4 text-center'>Клон Threads</h1>
               <div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-sm mx-auto'>
                    <h2 className='text-2xl font-bold mb-4 text-center'>Войти</h2>
                    <input type="text"
                        className='border p-2 rounded w-full mb-4'
                        placeholder='Введите имя'
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                    />
                    <input type="password"
                        className='border p-2 rounded w-full mb-4'
                        placeholder='Введите пароль'
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className='bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-lg w-full font-semibold'>Войти</button>
                    <div className='mt-4 text-center'>
                        <p>
                            Нет аккаунта? <Link href="/register" className='text-blue-500 hover:underline'>Зарегистрироваться</Link>
                        </p>
                    </div>
               </div>
            </main>
        )
    }

    // Показываем Skeleton Loader, пока посты загружаются
    if (isLoading) {
        return (
            <main className='p-8 max-w-2xl mx-auto'>
                <h1 className='text-3xl font-bold mb-4 text-center'>Клон Threads</h1>
                <div className='flex justify-between items-center mb-8'>
                    <div className='flex items-center space-x-4'>
                        <div className='h-6 bg-gray-200 rounded w-24'></div>
                        <div className='h-8 bg-red-500 rounded-lg w-16'></div>
                    </div>
                </div>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </main>
        )
    }

    
    return(
        <main className='p-8 max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-4 text-center'>Клон Threads</h1>

            {/* LOGIN BLOCK */}
            <div className='flex justify-between items-center mb-8'>
                {
                    loggedInUser && (
                        <div className='flex items-center space-x-4'>
                            <span className='text-lg font-semibold'>Привет, {loggedInUser.username}!</span>
                            <button onClick={handleLogout} className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm'>Выйти</button>
                        </div>
                    )
                }
            </div>

            {loggedInUser && (
                <form onSubmit={handleCreatePost} className='mb-8'>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder='Что у вас на уме?'
                        className="border p-4 rounded-lg w-full resize-none mb-2"
                    />
                    {/* --------------------------- NEW FILE INPUT --------------------------- */}
                    <div className='flex items-center space-x-2 mb-2'>
                        <label 
                            htmlFor="file-input" 
                            className='bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-lg text-sm cursor-pointer transition duration-300'
                        >
                            {selectedFile ? 'Изображение выбрано' : 'Загрузить картинку'}
                        </label>
                        <input
                            type='file'
                            id='file-input'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='hidden'
                        />
                        {selectedFile && (
                            <span className='text-sm text-gray-500 truncate max-w-[50%]'>
                                {selectedFile.name}
                            </span>
                        )}
                    </div>
                    {/* ---------------------------------------------------------------------------- */}
                    <button type='submit' className='bg-green-500 text-white p-3 rounded-lg w-full font-semibold mt-2'>
                        Опубликовать
                    </button>
                </form>
            )}

            <div>
                <h2 className='text-2xl font-bold mb-4'>Все посты:</h2>

                {posts.length > 0 ? (
                    posts.map(post => {
                        const postUser = users.find(u => u.id === post.userId)
                        if (!postUser) return null
                        
                        return(
                            <PostItem
                                key={post.id}
                                post={post}
                                postUser={postUser}
                                loggedInUser={loggedInUser}
                                editingPostId={editingPostId}
                                editedContent={editedContent}
                                handleEditClick={handleEditClick}
                                handleSaveEdit={handleSaveEdit}
                                handleCancelEdit={handleCancelEdit}
                                setEditedContent={setEditedContent}
                                handleDeletePost={handleDeletePost}
                            />
                        )
                    })
                ) : (
                    <p className='text-center text-gray-600'>Постов пока нет :/</p>
                )
                }

            </div>

        </main>
    )
}