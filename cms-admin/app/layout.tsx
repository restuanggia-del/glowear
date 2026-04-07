import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], 
  variable: '--font-poppins', // Ini variabel kuncinya
})

export const metadata: Metadata = {
  title: 'Glowear',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      {/* WAJIB tambahkan 'font-sans' agar Tailwind menggunakan font ini sebagai default */}
      <body className={`${poppins.variable} font-sans bg-slate-50`}>
        {children}
      </body>
    </html>
  )
}