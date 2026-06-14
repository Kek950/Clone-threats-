import {Roboto, Montserrat, Poppins} from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin', 'cyrillic']
})

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic']
})

// const poppins = Poppins({
//   subsets: ['latin']
// })

export const metadata = {
  title: "My page",
  description: "This is my page",
}


export default function RootLayout({children}){
  return (
    <html lang="en">
      <body className={`${roboto.className} ${montserrat.className}`}>
        {children}
      </body>      
    </html>
  )
}