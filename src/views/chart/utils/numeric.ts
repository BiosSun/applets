const numberFormat = Intl.NumberFormat('zh-Hans-CN', {
    style: 'decimal',
    maximumFractionDigits: 4,
})

export function numeric(num: number) {
    return numberFormat.format(num)
}
