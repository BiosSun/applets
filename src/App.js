import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import JSSizeView from 'views/js-size'
import QRCodeView from 'views/qrcode'
import URLView from 'views/url'

import styles from 'app.module.scss'

function App() {
    return (
        <Router>
            <div>
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
                    </ul>
                </nav>
            </div>

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
                <Route path="/">
                    <p>一套简单的在线小工具</p>
                </Route>
            </Switch>
        </Router>
    )
}

export default App
