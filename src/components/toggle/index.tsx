import { HStack } from '@nami-ui/stack'

interface ToggleProps {
    className?: string
    label: string
    value: boolean
    onChange: (value: boolean) => void
}

export default function Toggle({ value, onChange, className, label, ...otherProps }: ToggleProps) {
    return (
        <HStack className={className} component="label" align="center" spacing="small" {...otherProps}>
            <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
            {label}
        </HStack>
    )
}
