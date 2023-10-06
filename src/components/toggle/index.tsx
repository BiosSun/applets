import { HStack } from '@nami-ui/stack'

interface ToggleProps {
    className?: string
    label?: string
    value: boolean
    onChange: (value: boolean) => void
    onBlur?: () => void
}

export function Toggle({ value, className, label, onChange, onBlur, ...otherProps }: ToggleProps) {
    return (
        <HStack
            className={className}
            component="label"
            align="center"
            spacing="small"
            {...otherProps}
        >
            <input
                type="checkbox"
                checked={value}
                onChange={(event) => onChange(event.target.checked)}
                onBlur={() => onBlur?.()}
            />
            {label}
        </HStack>
    )
}
