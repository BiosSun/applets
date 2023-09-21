import clsx from 'clsx'
import { Suspense } from 'react'
import { Link, Outlet, useResolvedPath, useMatch } from 'react-router-dom'
import { VStack } from '@nami-ui/stack'
import { Divider } from '@nami-ui/divider'
import Loading from './components/loading'

import styles from './app.module.scss'

export default function App() {
    return (
        <VStack className={styles.view}>
            <nav className={styles.nav}>
                <ul>
                    <NavItem to="/" title="Home" />
                    <NavItem to="/js-size" title="JS Size" description="计算某段 JS 代码的源文件大小，压缩后大小及 gzip 之后的大小" />
                    <NavItem to="/qrcode" title="QRCode" description="生成二维码" />
                    <NavItem to="/url" title="URL" description="解析 URL" />
                    <NavItem to="/json" title="JSON" description="解析 JSON 字符串" />
                    <NavItem to="/base64" title="Base64" description="编码/反编码 Base64 字符串" />
                    <NavItem to="/regexp" title="RegExp" />
                    <NavItem to="/chart" title="Chart" description="快速创建一些图表" />
                    <NavItem to="/clock" title="Clock" />
                    <NavItem to="/time" title="Time" description="解析时间" />
                    <NavItem to="/duration" title="Duration" description="解析时长" />
                    <NavItem to="/bezier-curve" title="Bezier Curve" description="贝塞尔曲线：定义结点，绘制曲线" />
                    <NavItem to="/xss" title="XSS" description="为 HTML 添加 XSS 过滤" />
                </ul>
            </nav>

            <Divider />

            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </VStack>
    )
}

function NavItem({ title, description, to, ...props }) {
    const resolved = useResolvedPath(to)
    const match = useMatch({ path: resolved.pathname, end: true })

    const className = clsx(styles.navItem, { [styles.active]: match })

    return (
        <li className={className}>
            <Link to={to} title={description} {...props}>
                {title}
            </Link>
        </li>
    )
}
