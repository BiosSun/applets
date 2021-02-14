import { usePrevious } from 'react-use'

/**
 * 记录并告诉你数据是否改变
 */
export default function useChanged(val: any) {
    const prev = usePrevious(val)
    return prev !== val
}
