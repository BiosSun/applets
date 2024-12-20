import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { addEventListener } from 'consolidated-events'
import useResizeObserver from 'use-resize-observer'
import { Box, Flex, Separator } from '@radix-ui/themes'
import { Button } from '@/components/button'

import useLocalState from '@/utils/use-local-state'
import Pen from '@/utils/pen'

import styles from './index.module.scss'

// 控制点坐标（结点）
interface Node {
    // x 轴百分比
    x: number

    // y 轴百分比
    y: number
}

const MODES = [
    // 一级控制点样式
    {
        line: {
            width: 2,
            style: 'rgba(20, 20, 20, 0.2)',
        },
        dot: {
            radius: 3,
            background: 'rgba(20, 20, 20, 0.5)',
        },
    },
    // 二级样式
    {
        line: {
            width: 2,
            style: 'rgba(158, 16, 104, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(158, 16, 104, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(57, 16, 133, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(57, 16, 133, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(16, 35, 158, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(16, 35, 158, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(0, 80, 179, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(0, 80, 179, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(0, 109, 117, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(0, 109, 117, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(35, 120, 4, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(35, 120, 4, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(91, 140, 0, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(91, 140, 0, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(173, 139, 0, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(173, 139, 0, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(173, 104, 0, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(173, 104, 0, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(173, 78, 0, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(173, 78, 0, 0.5)',
        },
    },
    {
        line: {
            width: 2,
            style: 'rgba(173, 33, 2, 0.2)',
        },
        dot: {
            radius: 2,
            background: 'rgba(173, 33, 2, 0.5)',
        },
    },
]

export default function BezierCurveView() {
    const [controlNodes, setControlNodes] = useLocalState<Node[]>('BezierCurve/controlNodes', [])
    const [progress, setProgress] = useLocalState<number>('BezierCurve/progress', 0)

    function resetControlNodes() {
        setControlNodes([])
    }

    return (
        <Flex className={styles.container} direction={'column'}>
            {controlNodes.length === 0 ? (
                <Flex p={'3'} gap={'3'}>
                    <em>随便在下面点几个点试试~~~</em>
                </Flex>
            ) : (
                <Flex p={'3'} gap={'3'}>
                    <Button onClick={resetControlNodes}>重置</Button>
                    <span>{controlNodes.length}个控制点</span>
                    <Box asChild flexGrow={'1'}>
                        <Slide value={progress} onChange={setProgress} />
                    </Box>
                </Flex>
            )}
            <Separator size={'4'} />
            <Box asChild flexGrow={'1'}>
                <Canvas
                    controlNodes={controlNodes}
                    progress={progress}
                    onChangeControlNodes={setControlNodes}
                />
            </Box>
        </Flex>
    )
}

function Slide({
    className,
    value,
    onChange,
    ...otherProps
}: {
    className?: string
    value: number
    onChange(value: number): void
}) {
    return (
        <Box asChild className={className} flexGrow={'1'} {...otherProps}>
            <input
                type="range"
                min={0}
                max={1}
                step={0.0001}
                value={value}
                onChange={(e) => onChange(e.target.valueAsNumber)}
            />
        </Box>
    )
}

function Canvas({
    className,
    progress,
    controlNodes,
    onChangeControlNodes,
    ...otherProps
}: {
    className?: string
    progress: number
    controlNodes: Node[]
    onChangeControlNodes: (nodes: Node[]) => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { width = 1, height = 1 } = useResizeObserver({ ref: containerRef })
    const scale = window.devicePixelRatio

    // 计算 1001 个时间点
    const momentNodeGroups = useMemo<Node[][][]>(() => {
        const momentNodeGroups = []

        for (let i = 0; i <= 1000; i++) {
            momentNodeGroups.push(calcMomentNodeGroups(controlNodes, i / 1000))
        }

        return momentNodeGroups
    }, [controlNodes])

    // canvas resize
    useLayoutEffect(() => {
        const el = canvasRef.current

        if (el) {
            el.style.width = width + 'px'
            el.style.height = height + 'px'

            el.width = Math.floor(width * scale)
            el.height = Math.floor(height * scale)

            const ctx = el.getContext('2d')
            ctx!.scale(scale, scale)
        }
    }, [width, height, scale])

    // 点击添加控制点
    useEffect(() => {
        const el = canvasRef.current

        return addEventListener(el, 'click', (event: PointerEvent) => {
            const { offsetX: x, offsetY: y } = event

            const newNodes = [
                ...controlNodes,
                {
                    x: x / width,
                    y: y / height,
                },
            ]

            onChangeControlNodes(newNodes)
        })
    }, [width, height, controlNodes, onChangeControlNodes])

    // 绘制控制点
    useEffect(() => {
        const el = canvasRef.current
        const ctx = el!.getContext('2d')

        const pen = new Pen(ctx!)

        ctx!.clearRect(0, 0, width, height)

        // 获得对应当前时间的路径点分组
        const index = Math.round(progress * 1000)
        const momentNodeGroup = momentNodeGroups[index]

        // 逐层绘制路径及路径点
        momentNodeGroup.forEach((nodes, nodesIndex) => {
            if ((progress === 0 || progress === 1) && nodesIndex > 0) {
                return
            }

            const mode = MODES[nodesIndex === 0 ? 0 : ((nodesIndex - 1) % (MODES.length - 1)) + 1]

            const points = nodes.map(({ x, y }) => ({
                x: x * width,
                y: y * height,
            }))

            // 绘制路径
            pen.line(points, mode.line)
            pen.circles(points, mode.dot)
        })

        // 绘制曲线
        if (controlNodes.length) {
            const bezierPoints = []
            for (let i = 0; i <= index; i++) {
                const nodeGroups = momentNodeGroups[i]
                const bezierNode = nodeGroups[nodeGroups.length - 1][0]

                bezierPoints.push({
                    x: bezierNode.x * width,
                    y: bezierNode.y * height,
                })
            }

            pen.line(bezierPoints, { width: 4, style: 'rgb(255, 0, 0)' })
        }
    }, [width, height, controlNodes, progress, momentNodeGroups])

    return (
        <div className={clsx(styles.canvasContainer, className)} ref={containerRef}>
            <canvas className={styles.canvas} ref={canvasRef} {...otherProps} />
        </div>
    )
}

/**
 * 计算在指定时间点上，所有结点的位置
 */
function calcMomentNodeGroups(nodes: Node[], time: number) {
    const nodeGroups = [nodes]
    let currentNodeGroup = nodes

    while (currentNodeGroup.length > 1) {
        const nodeGroup = []

        for (let i = 0; i < currentNodeGroup.length - 1; i++) {
            const p1 = currentNodeGroup[i]
            const p2 = currentNodeGroup[i + 1]

            const x = (p2.x - p1.x) * time + p1.x
            const y = (p2.y - p1.y) * time + p1.y

            nodeGroup.push({ x, y })
        }

        nodeGroups.push(nodeGroup)
        currentNodeGroup = nodeGroup
    }

    return nodeGroups
}
