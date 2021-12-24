import { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { VStack } from '@nami-ui/stack'
import Loading from './components/loading'

import styles from 'app.module.scss'

function App() {
    return (
        <VStack className={styles.view}>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/js-size">JS Size</Link>
                    </li>
                    <li>
                        <Link to="/qrcode">QRCode</Link>
                    </li>
                    <li>
                        <Link to="/url">URL</Link>
                    </li>
                    <li>
                        <Link to="/json">JSON</Link>
                    </li>
                    <li>
                        <Link to="/base64">Base64</Link>
                    </li>
                    <li>
                        <Link to="/regexp">RegExp</Link>
                    </li>
                    <li>
                        <Link to="/clock">Clock</Link>
                    </li>
                    <li>
                        <Link to="/time">Time</Link>
                    </li>
                    <li>
                        <Link to="/duration">Duration</Link>
                    </li>
                    <li>
                        <Link to="/bezier-curve">Bezier Curve</Link>
                    </li>
                    <li>
                        <Link to="/xss">XSS</Link>
                    </li>
                </ul>
            </nav>

            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </VStack>
    )
}

export default App
