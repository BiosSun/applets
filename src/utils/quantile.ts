
/**
 * 计算分位数
 */
export function quantile(nums: number[], level: number): number {
    if (nums.length === 0) {
        throw new Error('Array must not be empty')
    }

    if (level < 0 || level > 1) {
        throw new Error('Level must be between 0 and 1')
    }
    nums = [...nums]
    nums.sort((a, b) => a - b)

    const index = level * (nums.length - 1)
    const lower = Math.floor(index)
    const upper = lower + 1
    const weight = index % 1

    if (upper === nums.length) {
        return nums[lower]
    }

    return nums[lower] * (1 - weight) + nums[upper] * weight
}
