import React, { useState, useEffect } from 'react'

export default function Loading() {
    const [display, setDisplay] = useState(false)

    useEffect(() => {
        const timmer = setTimeout(() => {
            setDisplay(true)
        }, 200)

        return () => {
            clearTimeout(timmer)
        }
    })

    if (!display) {
        return null
    }

    return <div>Loading...</div>
}
