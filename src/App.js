import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import JSSizeView from 'views/js-size'
import QRCodeView from 'views/qrcode'
import { VLinear } from '@biossun/nami'
import URLView from 'views/url'
import XSSView from 'views/xss'
import JSONView from 'views/json'

import styles from 'app.module.scss'

function App() {
    return (
        <Router>
            <VLinear className={styles.view}>
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
                            <Link to="/xss">XSS</Link>
                        </li>
                    </ul>
                </nav>

                <Switch>
                    <Route path="/js-size">
                        <JSSizeView />
                    </Route>
                    <Route path="/qrcode">
                        <QRCodeView />
                    </Route>
                    <Route path="/url">
                        <URLView />
                    </Route>
                    <Route path="/json">
                        <JSONView />
                    </Route>
                    <Route path="/xss">
                        <XSSView />
                    </Route>
                    <Route path="/">
                        <p>一套简单的在线小工具</p>
                    </Route>
                </Switch>
            </VLinear>
        </Router>
    )
}

export default App
