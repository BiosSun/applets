import { ChangeEvent, forwardRef } from 'react'

export type SelectValue = string | number

export interface SelectOption {
    label: string
    value: SelectValue
}

interface SelectProps {
    value?: SelectValue
    defaultValue?: SelectValue
    className?: string
    options: SelectOption[]
    onBlur?: () => void
    onChange?: (
        value: SelectValue,
        option: SelectOption,
        index: number,
        options: SelectOption[]
    ) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { value, defaultValue, className, options, onChange: _onChange, ...otherProps },
    ref
) {
    function onChange(event: ChangeEvent<HTMLSelectElement>) {
        const selectedIndex = event.target.selectedIndex
        const selectedOption = options[selectedIndex]
        const selectedValue = selectedOption.value
        _onChange?.(selectedValue, selectedOption, selectedIndex, options)
    }

    return (
        <select
            className={className}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            {...otherProps}
        >
            {options?.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
})
