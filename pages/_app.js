import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
  <div>
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">Horn Marketplace</p>
      <div className ="flex mt-4">
        <Link href="/">
          <a className="mr-6 text-green-500">
            Marketplace Home
          </a>
        </Link>
        <Link href="/mint-your-horn-nft">
         <a className="mr-6 text-green-500">
           Mint Your Horn NFT
         </a>
        </Link>
        <Link href="/my-horns">
          <a className="mr-6 text-green-500">
            Currently Owned Horns
          </a>
        </Link>
        <Link href="/transactions-in-progress">
          <a className="mr-6 text-green-500">
          Transactions In Progress
          </a>
        </Link>
      </div>
    </nav>
    <Component {...pageProps} />
  </div>
  )
}

export default MyApp
