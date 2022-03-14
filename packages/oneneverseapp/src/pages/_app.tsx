import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'

function oneneverse({ Component, pageProps }: AppProps) {
  return (
    <div className='container h-full max-width: 3xl'>
      <nav className='border-b border-blue-600 p-6'>
        <p className='text-4xl font-bold text-fuchsia-600'>ONENEVERSE</p>
        <div className='flex mt-4'>
          <Link href='/'>
            <a className='mr-6 text-green-500'>
              Home
            </a>
          </Link>
          <Link href='/createonv'>
            <a className='mr-6 text-green-500'>
              Sell ONV
           </a>
          </Link>
          <Link href='/ownonv'>
            <a className='mr-6 text-green-500'>
              Your ONV
            </a>
        </Link>
        <Link href='/dashboard'>
          <a className='mr-6 text-green-500'>
            Dashboard
          </a>
        </Link>
      </div>
    </nav>
    <Component {...pageProps} />
  </div>
  )
}
export default oneneverse
