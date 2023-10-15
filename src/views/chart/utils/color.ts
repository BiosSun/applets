

const COLORS_10 = [
    '#1783FF',
    '#00C9C9',
    '#F0884D',
    '#D580FF',
    '#7863FF',
    '#60C42D',
    '#BD8F24',
    '#FF80CA',
    '#2491B3',
    '#17C76F',
]

const COLORS_20 = [
    '#1783FF',
    '#00C9C9',
    '#F0884D',
    '#D580FF',
    '#7863FF',
    '#60C42D',
    '#BD8F24',
    '#FF80CA',
    '#2491B3',
    '#17C76F',
    '#AABA01',
    '#BC7CFC',
    '#237CBC',
    '#2DE379',
    '#CE8032',
    '#FF7AF4',
    '#545FD3',
    '#AFE410',
    '#D8C608',
    '#FFA1E0',
]

// const colorDisk = _.memoize((total: number) => {
//     const indexes = new Array(total).fill(0).map((_, i) => i)
//     const groupLength = 3
//     const groupsCount = Math.ceil(total / groupLength) // 每三个颜色一组
//     const groups = _.chain(indexes)
//         .groupBy((index) => index % groupsCount)
//         .values()
//         .map((group, groupIndex) => {
//             for (let i = 0; i < groupIndex % groupLength; i++) {
//                 const index = group.pop()!
//                 group.unshift(index)
//             }
//             return group
//         })
//         .flatten()
//         .value()

//     return groups
// })

// function pickColor(i: number, total: number): string {
//     const groups = colorDisk(total)
//     const index = groups[i]

//     const interval = 360 / total
//     const color = new Color(`oklch(0.65 0.3 ${(interval * index + 239) % 360})`).toString()

//     console.info(color)

//     return color
// }

export function pickColor(i: number, t: number = 10): string {
    if (t <= 10) {
        return COLORS_10[i]
    } else {
        return COLORS_20[i % 20]
    }
}