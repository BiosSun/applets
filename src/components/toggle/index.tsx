import { Flex } from '@radix-ui/themes'

interface ToggleProps {
    className?: string
    label?: string
    value: boolean
    disabled?: boolean
    onChange: (value: boolean) => void
    onBlur?: () => void
}

export function Toggle({
    value,
    className,
    label,
    disabled,
    onChange,
    onBlur,
    ...otherProps
}: ToggleProps) {
    return (
        <Flex className={className} asChild align="center" gap={'2'} {...otherProps}>
            <label>
                <input
                    type="checkbox"
                    checked={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.checked)}
                    onBlur={() => onBlur?.()}
                />
                {label}
            </label>
        </Flex>
    )
}
