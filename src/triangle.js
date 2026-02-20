export default class Triangle {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.speed = {x: 0, y: 0}
        this.r = size / Math.sqrt(3)
        this.color = 'rgb(200, 0, 0)'
        this.collisionCount = 0
    }

    setSpeed(x, y){
        this.speed.x = x
        this.speed.y = y
    }

    get vertices() {

        const angles = [Math.PI/2, 7*Math.PI/6, 11*Math.PI/6]
        const result = []
        
        for (let i = 0; i < angles.length; i++) {
            const angle = angles[i]
            result.push({
                x: this.x + this.r * Math.cos(angle),
                y: this.y + this.r * Math.sin(angle)
            })
        }
        
        return result
    }

    getBounds() {
        const vertices = this.vertices
        let minX = Infinity, minY = Infinity
        let maxX = -Infinity, maxY = -Infinity
        
        for (const v of vertices) {
            minX = Math.min(minX, v.x)
            minY = Math.min(minY, v.y)
            maxX = Math.max(maxX, v.x)
            maxY = Math.max(maxY, v.y)
        }
        
        return {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY
        }
    }
    
    incrementCollision() {
        this.collisionCount++
        return this.collisionCount >= 3
    }
}