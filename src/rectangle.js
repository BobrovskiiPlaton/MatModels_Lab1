export default class Rectangle {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.speed = {x: 0, y: 0}
        this.color = 'rgb(0, 0, 200)'
        this.rotation = 0
        this.rotationSpeed = 0
    }

    setSpeed(x, y){
        this.speed.x = x
        this.speed.y = y
    }

    get left() {
        return this.x
    }

    get right() {
        return this.x + this.w
    }

    get top() {
        return this.y
    }

    get bottom() {
        return this.y + this.h
    }

    get vertices() {
        const centerX = this.x + this.w / 2
        const centerY = this.y + this.h / 2
        
        const halfW = this.w / 2
        const halfH = this.h / 2
        
        const localVertices = [
            {x: -halfW, y: -halfH},
            {x: halfW, y: -halfH},
            {x: halfW, y: halfH},
            {x: -halfW, y: halfH}
        ]
        
        return localVertices.map(v => ({
            x: centerX + v.x * Math.cos(this.rotation) - v.y * Math.sin(this.rotation),
            y: centerY + v.x * Math.sin(this.rotation) + v.y * Math.cos(this.rotation)
        }))
    }

    contains(point) {
        return (point.x >= this.x &&
            point.x < this.x + this.w &&
            point.y >= this.y &&
            point.y < this.y + this.h)
    }

    intersects(rect) {
        return (this.x < rect.x + rect.w)
            && (rect.x < this.x + this.w)
            && (this.y < rect.y + rect.h)
            && (rect.y < this.y + this.h)
    }

    getBounds() {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom
        }
    }

    updateRotation() {
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed
            this.rotation = this.rotation % (2 * Math.PI)
        }
    }

    startRotating() {
        this.rotationSpeed = 0.03
    }
}