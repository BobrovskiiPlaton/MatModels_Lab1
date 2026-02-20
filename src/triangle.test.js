import Triangle from './triangle'

describe('Triangle vertices calculation', () => {
    it('should calculate vertices for triangle at origin', () => {
        const triangle = new Triangle(0, 0, 30)
        const vertices = triangle.vertices
        
        // Проверяем что получили 3 вершины
        expect(vertices.length).toBe(3)
        
        // Для перевернутого треугольника:
        // Вершина 1 (нижняя): угол 90° (π/2) - внизу
        expect(vertices[0].x).toBeCloseTo(0)
        expect(vertices[0].y).toBeCloseTo(17.32, 1) // +size/sqrt(3) (вниз)
        
        // Вершина 2 (верхняя левая): угол 210° (7π/6)
        expect(vertices[1].x).toBeCloseTo(-15, 0)
        expect(vertices[1].y).toBeCloseTo(-8.66, 1) // отрицательный y (вверх)
        
        // Вершина 3 (верхняя правая): угол 330° (11π/6)
        expect(vertices[2].x).toBeCloseTo(15, 0)
        expect(vertices[2].y).toBeCloseTo(-8.66, 1) // отрицательный y (вверх)
    })

    it('should calculate vertices for triangle at offset position', () => {
        const triangle = new Triangle(50, 50, 30)
        const vertices = triangle.vertices
        
        expect(vertices.length).toBe(3)
        
        // Нижняя вершина
        expect(vertices[0].x).toBeCloseTo(50)
        expect(vertices[0].y).toBeCloseTo(67.32, 1) // 50 + 17.32 (вниз)
        
        // Левая верхняя вершина
        expect(vertices[1].x).toBeCloseTo(35, 0) // 50 - 15
        expect(vertices[1].y).toBeCloseTo(41.34, 1) // 50 - 8.66 (вверх)
        
        // Правая верхняя вершина
        expect(vertices[2].x).toBeCloseTo(65, 0) // 50 + 15
        expect(vertices[2].y).toBeCloseTo(41.34, 1) // 50 - 8.66 (вверх)
    })
})

describe('Triangle getBounds', () => {
    it('should calculate bounds correctly for inverted triangle', () => {
        const triangle = new Triangle(50, 50, 30)
        const bounds = triangle.getBounds()
        
        // Левая граница должна быть у левой верхней вершины
        expect(bounds.left).toBeCloseTo(35, 0)
        // Правая граница должна быть у правой верхней вершины
        expect(bounds.right).toBeCloseTo(65, 0)
        // Верхняя граница должна быть у верхних вершин
        expect(bounds.top).toBeCloseTo(41.34, 1)
        // Нижняя граница должна быть у нижней вершины
        expect(bounds.bottom).toBeCloseTo(67.32, 1)
    })

    it('should update bounds when position changes', () => {
        const triangle = new Triangle(50, 50, 30)
        triangle.x = 100
        triangle.y = 100
        
        const bounds = triangle.getBounds()
        expect(bounds.left).toBeCloseTo(85, 0)
        expect(bounds.right).toBeCloseTo(115, 0)
        expect(bounds.top).toBeCloseTo(91.34, 1)
        expect(bounds.bottom).toBeCloseTo(117.32, 1)
    })
})

describe('Triangle collision counting', () => {
    it('should increment collision count', () => {
        const triangle = new Triangle(0, 0, 30)
        expect(triangle.collisionCount).toBe(0)
        
        triangle.incrementCollision()
        expect(triangle.collisionCount).toBe(1)
    })

    it('should return true after 3 collisions', () => {
        const triangle = new Triangle(0, 0, 30)
        
        expect(triangle.incrementCollision()).toBe(false)
        expect(triangle.incrementCollision()).toBe(false)
        expect(triangle.incrementCollision()).toBe(true)
        expect(triangle.collisionCount).toBe(3)
    })
})

describe('Triangle setSpeed', () => {
    it('should set speed correctly', () => {
        const triangle = new Triangle(0, 0, 30)
        
        triangle.setSpeed(3, 4)
        expect(triangle.speed.x).toBe(3)
        expect(triangle.speed.y).toBe(4)
    })
})

describe('Triangle visual representation', () => {
    it('should have correct r value', () => {
        const triangle = new Triangle(0, 0, 30)
        // r = size / sqrt(3)
        expect(triangle.r).toBeCloseTo(17.32, 1)
    })
})