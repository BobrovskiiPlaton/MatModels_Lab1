// collision.test.js
import Rectangle from './rectangle';
import Triangle from './triangle';
import Hexagon from './hexagon';
import Circle from './circle';

// Функция для проверки коллизий (адаптированная из вашего кода)
function checkCollision(figure1, figure2) {
    const bounds1 = figure1.getBounds();
    const bounds2 = figure2.getBounds();
    
    // AABB проверка
    if (bounds2.left > bounds1.right ||
        bounds2.right < bounds1.left ||
        bounds2.top > bounds1.bottom ||
        bounds2.bottom < bounds1.top) {
        return false;
    }
    
    // Для кругов используем более точную проверку
    if (figure1 instanceof Circle && figure2 instanceof Circle) {
        const dx = figure1.x - figure2.x;
        const dy = figure1.y - figure2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= figure1.r + figure2.r;
    }
    
    return true;
}

// Функция для разделения фигур (упрощенная для тестов)
// Функция для разделения фигур (улучшенная версия)
function separate(figure1, figure2) {
    const bounds1 = figure1.getBounds();
    const bounds2 = figure2.getBounds();
    
    const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left);
    const overlapY = Math.min(bounds1.bottom, bounds2.bottom) - Math.max(bounds1.top, bounds2.top);
    
    // Разделяем с небольшим запасом, чтобы гарантировать отсутствие коллизии
    const separationMargin = 0.1;
    
    if (overlapX < overlapY) {
        // Разделяем по горизонтали
        const separationX = overlapX + separationMargin;
        if (bounds1.left < bounds2.left) {
            figure1.x -= separationX / 2;
            figure2.x += separationX / 2;
        } else {
            figure1.x += separationX / 2;
            figure2.x -= separationX / 2;
        }
    } else {
        // Разделяем по вертикали
        const separationY = overlapY + separationMargin;
        if (bounds1.top < bounds2.top) {
            figure1.y -= separationY / 2;
            figure2.y += separationY / 2;
        } else {
            figure1.y += separationY / 2;
            figure2.y -= separationY / 2;
        }
    }
}

describe('Collision Detection', () => {
    describe('Rectangle-Rectangle collisions', () => {
        let rect1, rect2;
        
        test('should detect intersection when rectangles overlap', () => {
            rect1 = new Rectangle(0, 0, 10, 10);
            rect2 = new Rectangle(5, 5, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should detect when rectangles just touch', () => {
            rect1 = new Rectangle(0, 0, 10, 10);
            rect2 = new Rectangle(10, 0, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should detect when one rectangle contains another', () => {
            rect1 = new Rectangle(0, 0, 20, 20);
            rect2 = new Rectangle(5, 5, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should not detect collision when rectangles are separated', () => {
            rect1 = new Rectangle(0, 0, 10, 10);
            rect2 = new Rectangle(20, 20, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(false);
        });
    });

    describe('Circle-Circle collisions', () => {
        let circle1, circle2;
        
        test('should detect intersection when circles overlap', () => {
            circle1 = new Circle(10, 10, 5);
            circle2 = new Circle(13, 13, 5);
            expect(checkCollision(circle1, circle2)).toBe(true);
        });

        test('should detect when circles just touch', () => {
            circle1 = new Circle(10, 10, 5);
            circle2 = new Circle(20, 10, 5);
            expect(checkCollision(circle1, circle2)).toBe(true);
        });

        test('should detect when one circle contains another', () => {
            circle1 = new Circle(10, 10, 10);
            circle2 = new Circle(10, 10, 5);
            expect(checkCollision(circle1, circle2)).toBe(true);
        });

        test('should not detect collision when circles are separated', () => {
            circle1 = new Circle(10, 10, 5);
            circle2 = new Circle(30, 10, 5);
            expect(checkCollision(circle1, circle2)).toBe(false);
        });
    });

    describe('Triangle-Triangle collisions', () => {
        let triangle1, triangle2;
        
        test('should detect when triangles intersect', () => {
            triangle1 = new Triangle(10, 10, 10);
            triangle2 = new Triangle(15, 10, 10);
            expect(checkCollision(triangle1, triangle2)).toBe(true);
        });

        test('should detect when triangles touch', () => {
            triangle1 = new Triangle(10, 10, 10);
            triangle2 = new Triangle(20, 10, 10);
            expect(checkCollision(triangle1, triangle2)).toBe(true);
        });

        test('should not detect collision when triangles are separated', () => {
            triangle1 = new Triangle(10, 10, 10);
            triangle2 = new Triangle(50, 50, 10);
            expect(checkCollision(triangle1, triangle2)).toBe(false);
        });
    });

    describe('Hexagon-Hexagon collisions', () => {
        let hex1, hex2;
        
        test('should detect when hexagons intersect', () => {
            hex1 = new Hexagon(10, 10, 5);
            hex2 = new Hexagon(15, 10, 5);
            expect(checkCollision(hex1, hex2)).toBe(true);
        });

        test('should detect when hexagons touch', () => {
            hex1 = new Hexagon(10, 10, 5);
            hex2 = new Hexagon(18, 10, 5);
            expect(checkCollision(hex1, hex2)).toBe(true);
        });

        test('should not detect collision when hexagons are separated', () => {
            hex1 = new Hexagon(10, 10, 5);
            hex2 = new Hexagon(50, 50, 5);
            expect(checkCollision(hex1, hex2)).toBe(false);
        });
    });

    describe('Mixed shape collisions', () => {
        test('Rectangle-Triangle collision', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(15, 15, 10);
            expect(checkCollision(rect, triangle)).toBe(true);
        });

        test('Rectangle-Circle collision', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(15, 15, 5);
            expect(checkCollision(rect, circle)).toBe(true);
        });

        test('Rectangle-Hexagon collision', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const hexagon = new Hexagon(15, 15, 5);
            expect(checkCollision(rect, hexagon)).toBe(true);
        });

        test('Triangle-Circle collision', () => {
            const triangle = new Triangle(10, 10, 10);
            const circle = new Circle(15, 10, 5);
            expect(checkCollision(triangle, circle)).toBe(true);
        });

        test('Triangle-Hexagon collision', () => {
            const triangle = new Triangle(10, 10, 10);
            const hexagon = new Hexagon(15, 15, 5);
            expect(checkCollision(triangle, hexagon)).toBe(true);
        });

        test('Circle-Hexagon collision', () => {
            const circle = new Circle(10, 10, 5);
            const hexagon = new Hexagon(15, 10, 5);
            expect(checkCollision(circle, hexagon)).toBe(true);
        });

        test('should not detect collision between separated mixed shapes', () => {
            const rect = new Rectangle(0, 0, 10, 10);
            const circle = new Circle(50, 50, 5);
            expect(checkCollision(rect, circle)).toBe(false);
        });
    });

    describe('Shape separation', () => {
        test('should separate overlapping rectangles', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(5, 0, 10, 10);
            
            separate(rect1, rect2);
            expect(checkCollision(rect1, rect2)).toBe(false);
        });

        test('should separate overlapping circles', () => {
            const circle1 = new Circle(10, 10, 5);
            const circle2 = new Circle(14, 10, 5);
            
            separate(circle1, circle2);
            expect(checkCollision(circle1, circle2)).toBe(false);
        });

        test('should separate rectangle and triangle', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(15, 15, 10);
            
            separate(rect, triangle);
            expect(checkCollision(rect, triangle)).toBe(false);
        });

        test('should separate rectangle and circle', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(15, 15, 5);
            
            separate(rect, circle);
            expect(checkCollision(rect, circle)).toBe(false);
        });

        test('should separate triangle and circle', () => {
            const triangle = new Triangle(10, 10, 10);
            const circle = new Circle(15, 10, 5);
            
            separate(triangle, circle);
            expect(checkCollision(triangle, circle)).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test('should handle shapes at exact same position', () => {
            const rect1 = new Rectangle(10, 10, 10, 10);
            const rect2 = new Rectangle(10, 10, 10, 10);
            
            expect(checkCollision(rect1, rect2)).toBe(true);
            
            separate(rect1, rect2);
            expect(checkCollision(rect1, rect2)).toBe(false);
        });

        test('contains method should work correctly for Rectangle', () => {
            const rect = new Rectangle(0, 0, 10, 10);
            
            expect(rect.contains({x: 5, y: 5})).toBe(true);
            expect(rect.contains({x: 0, y: 0})).toBe(true);
            expect(rect.contains({x: 10, y: 5})).toBe(false);
            expect(rect.contains({x: 5, y: 10})).toBe(false);
            expect(rect.contains({x: 15, y: 15})).toBe(false);
        });

        test('intersects method should work correctly for Rectangle', () => {
            const rect = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(5, 5, 10, 10);
            const rect3 = new Rectangle(20, 20, 10, 10);
            
            expect(rect.intersects(rect2)).toBe(true);
            expect(rect.intersects(rect3)).toBe(false);
        });
    });
});