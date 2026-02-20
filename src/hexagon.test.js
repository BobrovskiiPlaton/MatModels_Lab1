import Hexagon from './hexagon'

describe('Hexagon vertices', () => {
    it('should calculate vertices correctly', () => {
        const hexagon = new Hexagon(100, 100, 20)
        const vertices = hexagon.vertices
        
        expect(vertices).toHaveLength(6)
        
        const angles = vertices.map(v => 
            Math.atan2(v.y - 100, v.x - 100) * 180 / Math.PI
        ).map(a => a < 0 ? a + 360 : a)
        
        expect(angles[0]).toBeCloseTo(330)
        expect(angles[1]).toBeCloseTo(30)
        expect(angles[2]).toBeCloseTo(90)
        expect(angles[3]).toBeCloseTo(150)
        expect(angles[4]).toBeCloseTo(210)
        expect(angles[5]).toBeCloseTo(270)
    })

    it('should update vertices when position changes', () => {
        const hexagon = new Hexagon(100, 100, 20)
        const vertices1 = hexagon.vertices
        
        hexagon.x = 200
        hexagon.y = 200
        const vertices2 = hexagon.vertices
        
        vertices2.forEach((v, i) => {
            expect(v.x).toBeCloseTo(vertices1[i].x + 100)
            expect(v.y).toBeCloseTo(vertices1[i].y + 100)
        })
    })
})

describe('Hexagon getBounds', () => {
    it('should calculate bounds correctly', () => {
        const hexagon = new Hexagon(100, 100, 20)
        const bounds = hexagon.getBounds()
        const vertices = hexagon.vertices
        
        const minX = Math.min(...vertices.map(v => v.x))
        const maxX = Math.max(...vertices.map(v => v.x))
        const minY = Math.min(...vertices.map(v => v.y))
        const maxY = Math.max(...vertices.map(v => v.y))
        
        expect(bounds.left).toBeCloseTo(minX)
        expect(bounds.right).toBeCloseTo(maxX)
        expect(bounds.top).toBeCloseTo(minY)
        expect(bounds.bottom).toBeCloseTo(maxY)
    })

    it('should update bounds when position changes', () => {
        const hexagon = new Hexagon(100, 100, 20)
        const bounds1 = hexagon.getBounds()
        
        hexagon.x = 200
        hexagon.y = 200
        const bounds2 = hexagon.getBounds()
        
        expect(bounds2.left).toBeCloseTo(bounds1.left + 100)
        expect(bounds2.right).toBeCloseTo(bounds1.right + 100)
        expect(bounds2.top).toBeCloseTo(bounds1.top + 100)
        expect(bounds2.bottom).toBeCloseTo(bounds1.bottom + 100)
    })
})

describe('Hexagon collision counting', () => {
    it('should increment collision count', () => {
        const hexagon = new Hexagon(0, 0, 5)
        expect(hexagon.collisionCount).toBe(0)
        
        hexagon.incrementCollision()
        expect(hexagon.collisionCount).toBe(1)
    })

    it('should return true after 3 collisions', () => {
        const hexagon = new Hexagon(0, 0, 5)
        
        expect(hexagon.incrementCollision()).toBe(false)
        expect(hexagon.incrementCollision()).toBe(false)
        expect(hexagon.incrementCollision()).toBe(true)
        expect(hexagon.collisionCount).toBe(3)
    })
})

describe('Hexagon setSpeed', () => {
    it('should set speed correctly', () => {
        const hexagon = new Hexagon(0, 0, 5)
        
        hexagon.setSpeed(3, 4)
        expect(hexagon.speed.x).toBe(3)
        expect(hexagon.speed.y).toBe(4)
    })
})