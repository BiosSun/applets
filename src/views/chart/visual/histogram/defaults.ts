import { Config } from './interface'
import outdent from 'outdent'

export function getDefaultConfig(): Config {
    return {
        step: null
    }
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
        // return [
        //     { start: 0, end: 100, count: 1 },
        //     { start: 100, end: 200, count: 7 },
        //     { start: 200, end: 300, count: 10 },
        //     { start: 300, end: 400, count: 8 },
        //     { start: 400, end: 500, count: 3 },
        //     { start: 500, end: 600, count: 2 },
        //     { start: 600, end: 700, count: 0 },
        //     { start: 800, end: 900, count: 3 },
        // ];

        // 示例三：
        // 随机数据
        // ---------------------------
        return new Array(200).fill(null).map((val, index) => ({
            start: index * 100,
            end: (index + 1) * 100,
            count: _.random(0, 100),
        }));
    `
}
