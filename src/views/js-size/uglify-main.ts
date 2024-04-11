import * as Comlink from 'comlink'
import UglifyWorker from './uglify-worker.ts?worker&inline'
import type { minify } from './uglify-worker'

const uglifyWorker = Comlink.wrap<{ minify: typeof minify }>(new UglifyWorker())

export { uglifyWorker }
