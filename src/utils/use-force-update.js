import { useReducer } from 'react'

export default function useForceUpdate() {
    return useReducer(state => !state, false)[1]
}