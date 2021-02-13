export default class Mime {
    private _type: String
    private _subtype: String

    get type() {
        return `${this._type}/${this._subtype}`
    }

    constructor(str: string) {
        ;[this._type, this._subtype] = str.split('/')
    }

    is(type: string) {
        return this._type === type
    }

    static from(str: string) {
        return new Mime(str)
    }
}
