import { Config } from './interface'
import outdent from 'outdent'

export function getDefaultConfig(): Config {
    return {
        bar: false,
        line: true,
        point: false,
        areaOpacity: 0.1,
        areaGradient: 0,
        color: 'auto',
        lineWidth: 1,
        nullMode: 'null',
        stack: false,
        percent: false,
        xAxisMode: 'category',
        sort: 'default',
        sortDire: 'desc',
        legend: {
            show: true,
            min: true,
            max: true,
            last: false,
            avg: false,
            p50: false,
            p80: false,
            p90: false,
            p99: false,
            p999: false,
            p9999: false,
            total: false,
            width: '400px',
        },
    }
}

export function getDefaultDataCode(): string {
    return outdent`
        const { _, dayjs } = tools

        // 示例一：
        // ---------------------------
        // return [
        //     { x: 'Sports', y: 275 },
        //     { x: 'Strategy', y: 115 },
        //     { x: 'Action', y: 120 },
        //     { x: 'Shooter', y: 350 },
        //     { x: 'Other', y: 150 },
        // ]

        // 示例二：
        // ---------------------------
        // console.info('source', source);
        // return source;

        // 示例三：
        // ---------------------------
        const CITIES = ['Beijing', 'London', 'New York']
        const GENDERS = ['Male', 'Female'];

        const data = []

        for (let i = 0; i < 30; i++) {
            const date = dayjs('2023-01-01').add(i, 'day').valueOf()

            for (const city of CITIES) {
                for (const gender of GENDERS) {
                    data.push({
                        date,
                        city,
                        gender,
                        p50: _.random(10, 30),
                        p90: _.random(20, 100),
                        p99: _.random(80, 500)
                    });
                }
            }
        }

        return data;
    `
}
