import { ReactNode } from 'react'

export interface ButtonProps {
    className?: string
    disabled?: boolean
    children?: ReactNode
    onClick?: () => void
}

export function Button(props: ButtonProps) {
    return (
        <button type="button" {...props}>
            {props.children}
        </button>
    )
}
