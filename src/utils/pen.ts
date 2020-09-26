export interface Point {
    x: number
    y: number
}

export interface LineMode {
    width: number
    style: string | CanvasGradient | CanvasPattern
}

export interface CircleMode {
    radius: number
    background: string | CanvasGradient | CanvasPattern
}

const DEFAULT_LINE_MODE: LineMode = {
    width: 1,
    style: '#000',
}

const DEFAULT_CIRCLE_MODE: CircleMode = {
    radius: 1,
    background: '#000',
}

export default class Pen {
    private ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    /**
     * 绘制所给定点之间的连线
     * @param points 一组坐标点
     * @param mode 线段模式
     */
    line(points: Point[], mode: LineMode = DEFAULT_LINE_MODE) {
        const { ctx } = this

        ctx.lineWidth = mode.width
        ctx.strokeStyle = mode.style

        ctx.beginPath()
        points.forEach(({ x, y }) => ctx.lineTo(x, y))
        ctx.stroke()
    }

    /**
     * 绘制一个圆形
     * @param point 圆形中心点坐标
     * @param mode 圆模式
     */
    circle(point: Point, mode: CircleMode = DEFAULT_CIRCLE_MODE) {
        const { ctx } = this

        ctx.fillStyle = mode.background
        ctx.beginPath()
        ctx.arc(point.x, point.y, mode.radius, 0, 2 * Math.PI)
        ctx.fill()
    }

    /**
     * 绘制一组圆形
     * @param points 一组圆形中心点坐标
     * @param mode 圆模式
     */
    circles(points: Point[], mode: CircleMode) {
        points.forEach((point) => this.circle(point, mode))
    }
}
