import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'
import _monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor'

const monacoEditorPlugin =
    ((_monacoEditorPlugin as any).default as typeof _monacoEditorPlugin) ?? _monacoEditorPlugin

const configs: {
    [key: string]: {
        base?: string
        customDistPath?: IMonacoEditorOpts['customDistPath']
    }
} = {
    development: {},
    production: {
        base: 'https://cdn-m.biossun.xyz/applets',
        customDistPath(root) {
            return path.join(root, 'dist', 'monacoeditorwork')
        },
    },
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        base: configs[mode].base,

        plugins: [
            react(),
            monacoEditorPlugin({
                customDistPath: configs[mode].customDistPath,
            }),
        ],
        resolve: {
            alias: {
                components: path.resolve(__dirname, './src/components'),
                utils: path.resolve(__dirname, './src/utils'),
                snapsvg: 'snapsvg-cjs',
            },
        },
    }
})
