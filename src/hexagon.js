export default class Hexagon {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size 
        this.speed = {x: 0, y: 0}
        this.color = 'rgb(0, 200, 0)'
        this.collisionCount = 0
    }

    setSpeed(x, y){
        this.speed.x = x
        this.speed.y = y
    }

    get vertices() {
        const vertices = []
        for(var i =0 ; i < 6; i++){
            const angle = (i * 60 - 30) * Math.PI / 180

            const x = this.x + this.size * Math.cos(angle)
            const y = this.y + this.size * Math.sin(angle)
            vertices.push({x, y})
        }
        return vertices
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