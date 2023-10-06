import { Config } from './interface'
import outdent from 'outdent'

export function getDefaultConfig(): Config {
    return outdent`
        // function render(chart: G2Chart, data: unknown, tools: { _: Lodash, dayjs: Dayjs }) {

        const { _, dayjs } = tools

        chart.data(data);

        chart.axis('x', {
            labelFormatter: (val) => dayjs(val).format('YYYY-MM-DD'),
            labelTransform: 'rotate(0)',
        })

        chart
            .legend(false)
            .interaction('tooltip', {
                position: 'right-top',
            })

        for (const field of ['p50', 'p90', 'p99']) {
            chart
                .line()
                .encode({
                    x: 'date',
                    y: field,
                    color: (d) => \`\${d.city}, \${d.gender} - \${field}\`,
                })
        }

        // }
    `
}

export function getDefaultDataCode(): string {
    return outdent`
        const { _, dayjs } = tools

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