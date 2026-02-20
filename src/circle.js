export default class Circle {
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
        this.speed = {x: 0, y: 0}
        this.color = 'rgb(255, 255, 0)'
        this.collisionCount = 0
    }


    setSpeed(x, y) {
        this.speed.x = x
        this.speed.y = y
    }

    getBounds() {
        return {
            left: this.x - this.r,
            right: this.x + this.r,
            top: this.y - this.r,
            bottom: this.y + this.r
        }
    }

    incrementCollision() {
        this.collisionCount++
        return this.collisionCount >= 3
    }
}