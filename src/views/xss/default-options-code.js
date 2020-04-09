export default `{
    // =============================================================================================
    // 你可以在这里书写兼容当前浏览器的 JS 代码，以声明 xss.js 配置，这些代码会存储在本地的 localStorage 中,
    // 下面每一项都有相关说明，若需要更详细的文档可参考：
    //     https://github.com/leizongmin/js-xss/blob/master/README.zh.md
    // =============================================================================================

    // 白名单，格式为 \`{ "标签名": ["属性1", "属性2"] }\`
    // 不在白名单上的标签将被过滤，不在白名单上的属性也将被过滤，
    // 默认白名单配置请参考：
    //     https://github.com/leizongmin/js-xss/blob/26ef2d0a81d5d74b728ef1e2e7169600d75ea4d5/lib/default.js#L11
    //
    // whiteList: {
    //    div: [],
    //    a: ["target", "href", "title"],
    // },

    // 自定义 CSS 过滤器，格式如下。
    // 默认白名单配置请参考：
    //     https://github.com/leizongmin/js-css-filter/blob/dc32e3071b3aa162669411df3ad07145ed57edc7/lib/default.js#L15
    //
    // css: {
    //    whiteList: {
    //        position: /^fixed|relative$/,
    //        top: true,
    //        left: true,
    //    },
    // },

    // 如果不想过滤 css，则可以指定为：
    // css: false,

    // 去掉不在白名单上的标签
    // - true：去掉不在白名单上的标签
    // - false：（默认），使用配置的escape函数对该标签进行转义
    //
    // stripIgnoreTag: false,

    // 去掉不在白名单上的标签及标签体
    // - false|null|undefined：（默认），不特殊处理
    // - '*'|true：去掉所有不在白名单上的标签
    // - ['tag1', 'tag2']：仅去掉指定的不在白名单上的标签
    //
    // stripIgnoreTagBody: false,

    // 去掉 HTML 备注
    // - true：不处理
    // - false：（默认），自动去掉 HTML 中的备注
    //
    // allowCommentTag: false,

    // 自定义匹配到标签时的处理方法
    // tag是当前的标签名称，比如<a>标签，则tag的值是'a'
    // html是该标签的HTML，比如<a>标签，则html的值是'<a>'
    // options是一些附加的信息，具体如下：
    //   isWhite         boolean类型，表示该标签是否在白名单上
    //   isClosing       boolean类型，表示该标签是否为闭合标签，比如</a>时为true
    //   position        integer类型，表示当前标签在输出的结果中的起始位置
    //   sourcePosition  integer类型，表示当前标签在原HTML中的起始位置
    // 如果返回一个字符串，则当前标签将被替换为该字符串
    // 如果不返回任何值，则使用默认的处理方法：
    //   在白名单上：  通过onTagAttr来过滤属性
    //   不在白名单上：通过onIgnoreTag指定
    //
    // onTag(tag, html, options) {
    // },

    // 自定义匹配到标签的属性时的处理方法
    // tag是当前的标签名称，比如<a>标签，则tag的值是'a'
    // name是当前属性的名称，比如href="#"，则name的值是'href'
    // value是当前属性的值，比如href="#"，则value的值是'#'
    // isWhiteAttr是否为白名单上的属性
    // 如果返回一个字符串，则当前属性值将被替换为该字符串
    // 如果不返回任何值，则使用默认的处理方法
    //   在白名单上：  调用safeAttrValue来过滤属性值，并输出该属性
    //   不在白名单上：通过onIgnoreTagAttr指定
    //
    // onTagAttr(tag, name, value, isWhiteAttr) {
    // },

    // 自定义匹配到不在白名单上的标签时的处理方法
    // 参数说明与onTag相同
    // 如果返回一个字符串，则当前标签将被替换为该字符串
    // 如果不返回任何值，则使用默认的处理方法（通过escape指定）
    //
    // onIgnoreTag(tag, html, options) {
    // },

    // 自定义匹配到不在白名单上的属性时的处理方法
    // 参数说明与onTagAttr相同
    // 如果返回一个字符串，则当前属性值将被替换为该字符串
    // 如果不返回任何值，则使用默认的处理方法（删除该属）
    //
    // onIgnoreTagAttr(tag, name, value, isWhiteAttr) {
    // },

    // 自定义 HTML 转义函数，以下是默认代码（不建议修改）
    // function escapeHtml(html) {
    //     return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // },

    // 自定义标签属性值的转义函数
    // 参数说明与onTagAttr相同（没有options参数）
    // 返回一个字符串表示该属性值
    //
    // safeAttrValue(tag, name, value) {
    // },
}`
