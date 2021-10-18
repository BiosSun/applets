import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import moment from 'moment'
import 'moment/locale/zh-cn'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

moment.locale('zh-cn')
dayjs.locale('zh-cn')

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
