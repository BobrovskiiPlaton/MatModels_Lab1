import Circle from './circle'

describe('Circle getBounds', () => {
    it('should calculate bounds correctly', () => {
        const circle = new Circle(10, 10, 5)
        const bounds = circle.getBounds()
        
        expect(bounds.left).toBe(5)
        expect(bounds.right).toBe(15)
        expect(bounds.top).toBe(5)
        expect(bounds.bottom).toBe(15)
    })

    it('should update bounds when position changes', () => {
        const circle = new Circle(10, 10, 5)
        circle.x = 20
        circle.y = 20
        
        const bounds = circle.getBounds()
        expect(bounds.left).toBe(15)
        expect(bounds.right).toBe(25)
        expect(bounds.top).toBe(15)
        expect(bounds.bottom).toBe(25)
    })
})

describe('Circle collision counting', () => {
    it('should increment collision count', () => {
        const circle = new Circle(0, 0, 5)
        expect(circle.collisionCount).toBe(0)
        
        circle.incrementCollision()
        expect(circle.collisionCount).toBe(1)
    })

    it('should return true after 3 collisions', () => {
        const circle = new Circle(0, 0, 5)
        
        expect(circle.incrementCollision()).toBe(false)
        expect(circle.incrementCollision()).toBe(false)
        expect(circle.incrementCollision()).toBe(true)
        expect(circle.collisionCount).toBe(3)
    })
})

describe('Circle setSpeed', () => {
    it('should set speed correctly', () => {
        const circle = new Circle(0, 0, 5)
        
        circle.setSpeed(3, 4)
        expect(circle.speed.x).toBe(3)
        expect(circle.speed.y).toBe(4)
    })
})