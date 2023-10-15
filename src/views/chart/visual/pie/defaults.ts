import { Config } from './interface'
import outdent from 'outdent'

export function getDefaultConfig(): Config {
    return {}
}

export function getDefaultDataCode(): string {
    return outdent`
        const { _, dayjs } = tools

        // 示例一：
        // 上传本地数据
        // ---------------------------
        // console.info('source', source);
        // return source;

        // 示例二：
        // 简单对象
        // ---------------------------
        return {
            Sports: 275,
            Strategy: 115,
            Action: 120,
            Shooter: 350,
            Other: 150,
        }
    `
}

// // 示例三：
// // 复杂数据
// // ---------------------------
// const CITIES = ['Beijing', 'London', 'New York']
// const GENDERS = ['Male', 'Female'];
//
// const data = []
//
// for (let i = 0; i < 30; i++) {
//     const date = dayjs('2023-01-01').add(i, 'day').valueOf()
//
//     for (const city of CITIES) {
//         for (const gender of GENDERS) {
//             data.push({
//                 date,
//                 city,
//                 gender,
//                 p50: _.random(10, 30),
//                 p90: _.random(20, 100),
//                 p99: _.random(80, 500)
//             });
//         }
//     }
// }
//
// return data;
