import '@/app/globals.css'

export const metadata = {
    title: "Posts page",
    description: "This is my page",
    keywords: ['ABC posts', 'ABC']
}


export default function PostsLayout({children}){
    return(
        <html>
            <body>
                <div className='flex justify-center min-h-screen'>
                    <main className='w-full max-w-2xl px-4 py-8'>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}