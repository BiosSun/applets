import _ from 'lodash'
import { useMemo } from 'react'
import CodeEditor from '@/components/code-editor'
import { Config } from './interface'

export function G2ConfigEditor({
    value,
    className,
    onChange: _onChange,
    ...otherProps
}: {
    value: Config
    className?: string
    onChange: (value: Config) => void
    [otherProp: string]: any
}) {
    const onChange = useMemo(() => {
        return _.debounce(_onChange, 500)
    }, [_onChange])

    return (
        <CodeEditor
            {...otherProps}
            style={{ height: '100%' }}
            language="javascript"
            value={value}
            onChange={onChange}
        />
    )
}
