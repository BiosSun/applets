import { produce, Draft } from 'immer'
import { Identifiable } from '@/types/identifiable'

type StateSetter<T> = (newValue: T) => void

export default function useList<T extends Identifiable, Key extends keyof T>([items, setItems]: [
    T[],
    StateSetter<T[]>,
]) {
    const length = items.length

    function get(id: string, _items: (T | Draft<T>)[] = items) {
        return _items.find((item) => item.id === id)
    }

    function getIndex(id: string) {
        return items.findIndex((item) => item.id === id)
    }

    function add(item: T, index: number = items.length): void {
        const newItems = [...items]
        newItems.splice(index, 0, item)
        setItems(newItems)
    }

    function remove(id: string): void {
        setItems(items.filter((item) => item.id !== id))
    }

    function change(id: string, key: Key, value: unknown): void {
        setItems(
            produce(items, (items) => {
                const item = get(id, items)

                if (!item) {
                    throw new Error(`item<id: ${id}> not exist`)
                }

                ;(item as any)[key] = value
            })
        )
    }

    return { items, length, get, getIndex, add, remove, change }
}
