import { lazy } from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import toArray from 'dayjs/plugin/toArray'
import toObject from 'dayjs/plugin/toObject'
import dayOfYear from 'dayjs/plugin/dayOfYear'

import './index.scss'

import App from './App'
import * as serviceWorker from './serviceWorker'

const WelcomeView = lazy(() => import(/* webpackChunkName: "views_welcome", webpackPrefetch: true */ './views/welcome')) // prettier-ignore
const JSSizeView = lazy(() => import(/* webpackChunkName: "views_js-size", webpackPrefetch: true */ './views/js-size')) // prettier-ignore
const QRCodeView = lazy(() => import(/* webpackChunkName: "views_qrcode", webpackPrefetch: true */ './views/qrcode')) // prettier-ignore
const URLView = lazy(() => import(/* webpackChunkName: "views_url", webpackPrefetch: true */ './views/url')) // prettier-ignore
const XSSView = lazy(() => import(/* webpackChunkName: "views_xss", webpackPrefetch: true */ './views/xss')) // prettier-ignore
const JSONView = lazy(() => import(/* webpackChunkName: "views_json", webpackPrefetch: true */ './views/json')) // prettier-ignore
const TimeView = lazy(() => import(/* webpackChunkName: "views_time", webpackPrefetch: true */ './views/time')) // prettier-ignore
const DurationView = lazy(() => import(/* webpackChunkName: "views_duration", webpackPrefetch: true */ './views/duration')) // prettier-ignore
const ClockView = lazy(() => import(/* webpackChunkName: "views_clock", webpackPrefetch: true */ './views/clock')) // prettier-ignore
const Base64View = lazy(() => import(/* webpackChunkName: "views_base64", webpackPrefetch: true */ './views/base64/index.tsx')) // prettier-ignore
const BezierCurveView = lazy(() => import(/* webpackChunkName: "views_bezier-curve", webpackPrefetch: true */ './views/bezier-curve/index.tsx')) // prettier-ignore
const RegExpView = lazy(() => import(/* webpackChunkName: "views_regexp", webpackPrefetch: true */ './views/regexp/index.tsx')) // prettier-ignore

dayjs.locale('zh-cn')
dayjs.extend(weekOfYear)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(toArray)
dayjs.extend(toObject)
dayjs.extend(dayOfYear)

render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<WelcomeView />} />
                <Route path="js-size" element={<JSSizeView />} />
                <Route path="/qrcode" element={<QRCodeView />} />
                <Route path="/url" element={<URLView />} />
                <Route path="/json" element={<JSONView />} />
                <Route path="/base64" element={<Base64View />} />
                <Route path="/regexp" element={<RegExpView />} />
                <Route path="/clock" element={<ClockView />} />
                <Route path="/time" element={<TimeView />} />
                <Route path="/duration" element={<DurationView />} />
                <Route path="/bezier-curve" element={<BezierCurveView />} />
                <Route path="/xss" element={<XSSView />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
