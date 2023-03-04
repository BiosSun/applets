import { lazy } from 'react'

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution'

const MonacoEditor = lazy(() => import('react-monaco-editor'))

export default MonacoEditor
