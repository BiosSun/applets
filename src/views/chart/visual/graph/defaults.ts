import { Config } from './interface'
import outdent from 'outdent'

export function getDefaultConfig(): Config {
    return {
        bar: false,
        line: true,
        point: false,
        areaOpacity: 0.1,
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
        // Graph 视图的规则：
        // 1. 应当返回一个数组，其元素为对象；
        // 2. 对象中字段的值只能为字符串、数值或 null；
        // 3. 值为字符串的字段将视为维度；
        // 4. 值为数值的则视为指标（另外所有值都为 null 的字段，也会被视为指标）；
        // 5. 第一个维度用于渲染 X 轴；
        // 6. 若有某个字段的名称是 time、t 或 date，且其所有值都可以解析为一个有效的日期（\`dayjs(val).isValid()\`），
        //    则强制作为维度，并用于渲染 X 轴（且此时 X 轴将渲染为时间轴）。

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
