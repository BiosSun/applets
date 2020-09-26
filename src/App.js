import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { VLinear } from '@biossun/nami'
import Loading from './components/loading'

import styles from 'app.module.scss'

const JSSizeView = lazy(() => import(/* webpackChunkName: "views_js-size", webpackPrefetch: true */ './views/js-size'))
const QRCodeView = lazy(() => import(/* webpackChunkName: "views_qrcode", webpackPrefetch: true */ './views/qrcode'))
const URLView = lazy(() => import(/* webpackChunkName: "views_url", webpackPrefetch: true */ './views/url'))
const XSSView = lazy(() => import(/* webpackChunkName: "views_xss", webpackPrefetch: true */ './views/xss'))
const JSONView = lazy(() => import(/* webpackChunkName: "views_json", webpackPrefetch: true */ './views/json'))
const TimeView = lazy(() => import(/* webpackChunkName: "views_json", webpackPrefetch: true */ './views/time'))
const ClockView = lazy(() => import(/* webpackChunkName: "views_json", webpackPrefetch: true */ './views/clock'))
const Base64View = lazy(() => import(/* webpackChunkName: "base64", webpackPrefetch: true */ './views/base64'))
const BezierCurveView = lazy(() => import(/* webpackChunkName: "bezier-curve", webpackPrefetch: true */ './views/bezier-curve/index.tsx'))

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
                            <Link to="/base64">Base64</Link>
                        </li>
                        <li>
                            <Link to="/clock">Clock</Link>
                        </li>
                        <li>
                            <Link to="/time">Time</Link>
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
                        <Route path="/base64">
                            <Base64View />
                        </Route>
                        <Route path="/clock">
                            <ClockView />
                        </Route>
                        <Route path="/time">
                            <TimeView />
                        </Route>
                        <Route path="/bezier-curve">
                            <BezierCurveView />
                        </Route>
                        <Route path="/xss">
                            <XSSView />
                        </Route>
                        <Route path="/">
                            <p>一套简单的在线小工具</p>
                        </Route>
                    </Switch>
                </Suspense>
            </VLinear>
        </Router>
    )
}

export default App
