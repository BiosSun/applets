import { ComponentType } from 'react'

/**
 * 一个完整的可视化方案
 */
export interface Visual<Config, Data> {
    /** 方案名称 */
    name: string

    /** 校验数据是否符合该方案的要求 */
    verifyData: (data: any) => data is Data

    /** 获取默认配置 */
    getDefaultConfig: () => Config

    /** 默认的数据生成代码 */
    defaultDataCode: string

    /** 用于编辑配置的组件 */
    ConfigEditor: ComponentType<{
        value: Config
        onChange: (value: Config) => void
        [otherProp: string]: any
    }>

    /** 渲染图表 */
    Chart: ComponentType<{
        data: Data
        config: Config
        onConfigChange: (value: Config) => void
        [otherProp: string]: any
    }>
}
