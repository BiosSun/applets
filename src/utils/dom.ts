// eslint-disable-next-line import/no-anonymous-default-export
export default {
    prev(el: Element | null): Element[] {
        const result = []
        if (el) while ((el = el.previousElementSibling)) result.push(el)
        return result
    },

    empty(el: Element) {
        el.innerHTML = ''
    },
}
