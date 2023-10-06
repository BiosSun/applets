/**
 * 断言
 * @example
 * assert(something, 'something 应当是一个 truthy 值，否则该断言函数将会抛出一个异常，异常的 message 便是该字符串')
 */
export function assert(
    condition: unknown,
    message?: string | (() => string)
): asserts condition {
    if (!condition) {
        throw new Error(typeof message === 'function' ? message() : message)
    }
}
