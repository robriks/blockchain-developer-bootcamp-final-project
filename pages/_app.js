import '../styles/globals.css'
import Link from 'next/link'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  return (
  <div className="bg-web-wash min-h-screen h-full align-content-center">
    <header className="bg-header">
      <nav className="p-6 flex mx-auto justify-between flex-wrap max-w-screen-xl">
        <p className="text-2xl font-bold leading-normal text-white">Horn Marketplace</p>
        <div className ="flex justify-items-stretch space-x-5">
          <Link href="/">
            <a className="nav-link" className={`nav-link ${router.pathname === "/" ? 'active' : ''}`}>
              Marketplace Home
            </a>
          </Link>
          <Link href="/mint-your-horn-nft">
            <a className={`nav-link ${router.pathname === "/mint-your-horn-nft" ? 'active' : ''}`}>
              Mint Your Horn NFT
            </a>
          </Link>
          <Link href="/my-horns">
            <a className={`nav-link ${router.pathname === "/my-horns" ? 'active' : ''}`}>
              Currently Owned Horns
            </a>
          </Link>
          <Link href="/your-active-sales">
            <a className={`nav-link ${router.pathname === "/your-active-sales" ? 'active' : ''}`} activeClassName="active">
            Your Active Sales
            </a>
          </Link>
          <Link href="/your-active-purchases">
            <a className={`nav-link ${router.pathname === "/your-active-purchases" ? 'active' : ''}`}>
            Your Active Purchases
            </a>
          </Link>
        </div>
      </nav>
    </header>
    <Component {...pageProps} />
  </div>
  )
}

export default MyApp
