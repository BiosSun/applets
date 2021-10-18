import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import * as serviceWorker from './serviceWorker'
import moment from 'moment'
import 'moment/locale/zh-cn'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import toArray from 'dayjs/plugin/toArray'
import toObject from 'dayjs/plugin/toObject'
import dayOfYear from 'dayjs/plugin/dayOfYear'

moment.locale('zh-cn')
dayjs.locale('zh-cn')
dayjs.extend(weekOfYear)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(toArray)
dayjs.extend(toObject)
dayjs.extend(dayOfYear)

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
