import { useReducer } from 'react'

type forceUpdate = () => void

export default function useForceUpdate(): forceUpdate {
    return useReducer(state => !state, false)[1]
}