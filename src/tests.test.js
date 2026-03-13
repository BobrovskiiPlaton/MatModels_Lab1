// collision.test.js
import Rectangle from './rectangle';
import Triangle from './triangle';
import Circle from './circle';

const EPSILON = 0.1; // Допуск для погрешностей вычислений

// Функция для точной проверки коллизий
function checkCollision(figure1, figure2) {
    const bounds1 = figure1.getBounds();
    const bounds2 = figure2.getBounds();
    
    // AABB проверка (быстрое отсечение)
    if (bounds2.left > bounds1.right + EPSILON ||
        bounds2.right < bounds1.left - EPSILON ||
        bounds2.top > bounds1.bottom + EPSILON ||
        bounds2.bottom < bounds1.top - EPSILON) {
        return false;
    }
    
    // Круг-Круг
    if (figure1 instanceof Circle && figure2 instanceof Circle) {
        const dx = figure1.x - figure2.x;
        const dy = figure1.y - figure2.y;
        const distSq = dx * dx + dy * dy;
        const radSum = figure1.r + figure2.r;
        return distSq <= (radSum * radSum) + EPSILON;
    }
    
    // Прямоугольник-Прямоугольник (с учетом вращения)
    if (figure1 instanceof Rectangle && figure2 instanceof Rectangle) {
        return checkRectangleRectangle(figure1, figure2);
    }
    
    // Круг-Прямоугольник
    if ((figure1 instanceof Circle && figure2 instanceof Rectangle) ||
        (figure1 instanceof Rectangle && figure2 instanceof Circle)) {
        
        const circle = figure1 instanceof Circle ? figure1 : figure2;
        const rect = figure1 instanceof Rectangle ? figure1 : figure2;
        
        return checkCircleRectangle(circle, rect);
    }
    
    // Круг-Треугольник
    if ((figure1 instanceof Circle && figure2 instanceof Triangle) ||
        (figure1 instanceof Triangle && figure2 instanceof Circle)) {
        
        const circle = figure1 instanceof Circle ? figure1 : figure2;
        const triangle = figure1 instanceof Triangle ? figure1 : figure2;
        
        return checkCircleTriangle(circle, triangle);
    }
    
    // Прямоугольник-Треугольник
    if ((figure1 instanceof Rectangle && figure2 instanceof Triangle) ||
        (figure1 instanceof Triangle && figure2 instanceof Rectangle)) {
        
        const rect = figure1 instanceof Rectangle ? figure1 : figure2;
        const triangle = figure1 instanceof Triangle ? figure1 : figure2;
        
        return checkRectangleTriangle(rect, triangle);
    }
    
    // Треугольник-Треугольник
    if (figure1 instanceof Triangle && figure2 instanceof Triangle) {
        return checkTriangleTriangle(figure1, figure2);
    }
    
    return true;
}

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============

// Прямоугольник-Прямоугольник
function checkRectangleRectangle(rect1, rect2) {
    const verts1 = getRectangleVertices(rect1);
    const verts2 = getRectangleVertices(rect2);
    
    // Проверка пересечения сторон
    for (let i = 0; i < 4; i++) {
        const start1 = verts1[i];
        const end1 = verts1[(i + 1) % 4];
        
        for (let j = 0; j < 4; j++) {
            const start2 = verts2[j];
            const end2 = verts2[(j + 1) % 4];
            
            if (segmentsIntersect(start1, end1, start2, end2)) {
                return true;
            }
        }
    }
    
    // Проверка: один прямоугольник внутри другого
    for (let i = 0; i < 4; i++) {
        if (pointInRectangle(verts1[i], rect2) || 
            pointInRectangle(verts2[i], rect1)) {
            return true;
        }
    }
    
    return false;
}

// Круг-Прямоугольник
function checkCircleRectangle(circle, rect) {
    const vertices = getRectangleVertices(rect);
    
    // Проверка: центр круга внутри прямоугольника
    if (pointInRectangle({x: circle.x, y: circle.y}, rect)) {
        return true;
    }
    
    // Проверка расстояния до сторон
    for (let i = 0; i < 4; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % 4];
        
        const dist = pointToSegmentDistance(
            circle.x, circle.y,
            start.x, start.y,
            end.x, end.y
        );
        
        if (dist <= circle.r + EPSILON) {
            return true;
        }
    }
    
    // Проверка расстояния до вершин
    for (let i = 0; i < 4; i++) {
        const dx = circle.x - vertices[i].x;
        const dy = circle.y - vertices[i].y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= (circle.r * circle.r) + EPSILON) {
            return true;
        }
    }
    
    return false;
}

// Круг-Треугольник
function checkCircleTriangle(circle, triangle) {
    const vertices = triangle.vertices;
    
    // Проверка: центр круга внутри треугольника
    if (pointInTriangle(circle.x, circle.y, vertices)) {
        return true;
    }
    
    // Проверка расстояния до сторон
    for (let i = 0; i < 3; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % 3];
        
        const dist = pointToSegmentDistance(
            circle.x, circle.y,
            start.x, start.y,
            end.x, end.y
        );
        
        if (dist <= circle.r + EPSILON) {
            return true;
        }
    }
    
    // Проверка расстояния до вершин
    for (let i = 0; i < 3; i++) {
        const dx = circle.x - vertices[i].x;
        const dy = circle.y - vertices[i].y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= (circle.r * circle.r) + EPSILON) {
            return true;
        }
    }
    
    return false;
}

// Прямоугольник-Треугольник
function checkRectangleTriangle(rect, triangle) {
    const rectVerts = getRectangleVertices(rect);
    const triVerts = triangle.vertices;
    
    // Проверка пересечения сторон
    for (let i = 0; i < 4; i++) {
        const rStart = rectVerts[i];
        const rEnd = rectVerts[(i + 1) % 4];
        
        for (let j = 0; j < 3; j++) {
            const tStart = triVerts[j];
            const tEnd = triVerts[(j + 1) % 3];
            
            if (segmentsIntersect(rStart, rEnd, tStart, tEnd)) {
                return true;
            }
        }
    }
    
    // Проверка: вершины прямоугольника внутри треугольника
    for (let i = 0; i < 4; i++) {
        if (pointInTriangle(rectVerts[i].x, rectVerts[i].y, triVerts)) {
            return true;
        }
    }
    
    // Проверка: вершины треугольника внутри прямоугольника
    for (let i = 0; i < 3; i++) {
        if (pointInRectangle(triVerts[i], rect)) {
            return true;
        }
    }
    
    return false;
}

// Треугольник-Треугольник
function checkTriangleTriangle(tri1, tri2) {
    const v1 = tri1.vertices;
    const v2 = tri2.vertices;
    
    // Проверка пересечения сторон
    for (let i = 0; i < 3; i++) {
        const start1 = v1[i];
        const end1 = v1[(i + 1) % 3];
        
        for (let j = 0; j < 3; j++) {
            const start2 = v2[j];
            const end2 = v2[(j + 1) % 3];
            
            if (segmentsIntersect(start1, end1, start2, end2)) {
                return true;
            }
        }
    }
    
    // Проверка: вершины одного треугольника внутри другого
    for (let i = 0; i < 3; i++) {
        if (pointInTriangle(v1[i].x, v1[i].y, v2) ||
            pointInTriangle(v2[i].x, v2[i].y, v1)) {
            return true;
        }
    }
    
    return false;
}

// Получить вершины прямоугольника с учетом поворота
function getRectangleVertices(rect) {
    const centerX = rect.x + rect.w / 2;
    const centerY = rect.y + rect.h / 2;
    const cos = Math.cos(rect.rotation);
    const sin = Math.sin(rect.rotation);
    
    const halfW = rect.w / 2;
    const halfH = rect.h / 2;
    
    const corners = [
        {x: -halfW, y: -halfH},
        {x: halfW, y: -halfH},
        {x: halfW, y: halfH},
        {x: -halfW, y: halfH}
    ];
    
    return corners.map(corner => ({
        x: centerX + corner.x * cos - corner.y * sin,
        y: centerY + corner.x * sin + corner.y * cos
    }));
}

// Проверка точки в прямоугольнике
function pointInRectangle(point, rect) {
    if (rect.rotation === 0) {
        return point.x >= rect.x - EPSILON && point.x <= rect.x + rect.w + EPSILON &&
               point.y >= rect.y - EPSILON && point.y <= rect.y + rect.h + EPSILON;
    }
    
    const vertices = getRectangleVertices(rect);
    
    for (let i = 0; i < 4; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % 4];
        
        const edgeX = end.x - start.x;
        const edgeY = end.y - start.y;
        const pointVecX = point.x - start.x;
        const pointVecY = point.y - start.y;
        
        const normalX = -edgeY;
        const normalY = edgeX;
        
        const dot = pointVecX * normalX + pointVecY * normalY;
        
        if (dot < -EPSILON) return false;
    }
    
    return true;
}

// Проверка точки в треугольнике
function pointInTriangle(px, py, vertices) {
    const v0 = vertices[2];
    const v1 = vertices[0];
    const v2 = vertices[1];
    
    const dX = px - v0.x;
    const dY = py - v0.y;
    const dX21 = v2.x - v1.x;
    const dY12 = v1.y - v2.y;
    const D = (v2.y - v0.y) * (v1.x - v0.x) - (v2.x - v0.x) * (v1.y - v0.y);
    
    if (Math.abs(D) < EPSILON) return false;
    
    const s = ((v2.y - v0.y) * dX - (v2.x - v0.x) * dY) / D;
    const t = (-(v1.y - v0.y) * dX + (v1.x - v0.x) * dY) / D;
    
    return s >= -EPSILON && t >= -EPSILON && s + t <= 1 + EPSILON;
}

// Расстояние от точки до отрезка
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    
    if (lenSq < EPSILON) {
        return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

// Проверка пересечения двух отрезков
function segmentsIntersect(p1, p2, p3, p4) {
    const d1 = direction(p3, p4, p1);
    const d2 = direction(p3, p4, p2);
    const d3 = direction(p1, p2, p3);
    const d4 = direction(p1, p2, p4);
    
    return (d1 * d2 < -EPSILON) && (d3 * d4 < -EPSILON);
}

function direction(p1, p2, p3) {
    return (p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x);
}

// ============= ТЕСТЫ =============

describe('Collision Detection', () => {
    
    // ===== ПРЯМОУГОЛЬНИК-ПРЯМОУГОЛЬНИК =====
    describe('Rectangle-Rectangle collisions', () => {
        test('should detect when rectangles overlap', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(5, 5, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should detect when rectangles touch at corners', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(10, 10, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should detect when rectangles touch along edge', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(10, 0, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should detect when one rectangle contains another', () => {
            const outer = new Rectangle(0, 0, 20, 20);
            const inner = new Rectangle(5, 5, 10, 10);
            expect(checkCollision(outer, inner)).toBe(true);
        });

        test('should detect when rectangles are identical', () => {
            const rect1 = new Rectangle(10, 10, 10, 10);
            const rect2 = new Rectangle(10, 10, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(true);
        });

        test('should not detect collision when rectangles are separated', () => {
            const rect1 = new Rectangle(0, 0, 10, 10);
            const rect2 = new Rectangle(20, 20, 10, 10);
            expect(checkCollision(rect1, rect2)).toBe(false);
        });

        test('should handle rotated rectangles', () => {
            const rect1 = new Rectangle(10, 10, 10, 10);
            const rect2 = new Rectangle(15, 10, 10, 10);
            rect1.rotation = Math.PI / 4;
            expect(checkCollision(rect1, rect2)).toBe(true);
        });
    });

    // ===== КРУГ-КРУГ =====
    describe('Circle-Circle collisions', () => {
        test('should detect when circles overlap', () => {
            const c1 = new Circle(10, 10, 5);
            const c2 = new Circle(13, 13, 5);
            expect(checkCollision(c1, c2)).toBe(true);
        });

        test('should detect when circles touch externally', () => {
            const c1 = new Circle(10, 10, 5);
            const c2 = new Circle(20, 10, 5);
            expect(checkCollision(c1, c2)).toBe(true);
        });

        test('should detect when circles touch internally', () => {
            const outer = new Circle(10, 10, 10);
            const inner = new Circle(20, 10, 10);
            expect(checkCollision(outer, inner)).toBe(true);
        });

        test('should detect when one circle contains another', () => {
            const outer = new Circle(10, 10, 10);
            const inner = new Circle(12, 12, 3);
            expect(checkCollision(outer, inner)).toBe(true);
        });

        test('should detect when circles are concentric', () => {
            const c1 = new Circle(10, 10, 5);
            const c2 = new Circle(10, 10, 3);
            expect(checkCollision(c1, c2)).toBe(true);
        });

        test('should not detect collision when circles are separated', () => {
            const c1 = new Circle(10, 10, 5);
            const c2 = new Circle(30, 10, 5);
            expect(checkCollision(c1, c2)).toBe(false);
        });
    });

    // ===== ТРЕУГОЛЬНИК-ТРЕУГОЛЬНИК =====
    describe('Triangle-Triangle collisions', () => {
        test('should detect when triangles overlap', () => {
            const t1 = new Triangle(10, 10, 10);
            const t2 = new Triangle(13, 10, 10);
            expect(checkCollision(t1, t2)).toBe(true);
        });

        test('should detect when triangles touch at vertices', () => {
        const t1 = new Triangle(10, 10, 10);
        const t2 = new Triangle(10, 15.77, 0.5);
        expect(checkCollision(t1, t2)).toBe(true);
});

        test('should detect when triangles touch along edge', () => {
            const t1 = new Triangle(10, 10, 10);
            const t2 = new Triangle(15, 16, 10);
            expect(checkCollision(t1, t2)).toBe(true);
        });

        test('should detect when one triangle contains another', () => {
            const outer = new Triangle(10, 10, 20);
            const inner = new Triangle(10, 10, 5);
            expect(checkCollision(outer, inner)).toBe(true);
        });

        test('should detect when triangles are identical', () => {
            const t1 = new Triangle(10, 10, 10);
            const t2 = new Triangle(10, 10, 10);
            expect(checkCollision(t1, t2)).toBe(true);
        });

        test('should not detect collision when triangles are separated', () => {
            const t1 = new Triangle(10, 10, 10);
            const t2 = new Triangle(30, 30, 5);
            expect(checkCollision(t1, t2)).toBe(false);
        });
    });

    // ===== КРУГ-ПРЯМОУГОЛЬНИК =====
    describe('Circle-Rectangle collisions', () => {
        test('should detect when circle overlaps rectangle', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(15, 15, 5);
            expect(checkCollision(rect, circle)).toBe(true);
        });

        test('should detect when circle touches rectangle corner', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(20, 10, 1);
            expect(checkCollision(rect, circle)).toBe(true);
        });

        test('should detect when circle touches rectangle edge', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(15, 8, 2);
            expect(checkCollision(rect, circle)).toBe(true);
        });

        test('should detect when circle is inside rectangle', () => {
            const rect = new Rectangle(10, 10, 20, 20);
            const circle = new Circle(20, 20, 5);
            expect(checkCollision(rect, circle)).toBe(true);
        });

        test('should detect when rectangle is inside circle', () => {
            const circle = new Circle(20, 20, 15);
            const rect = new Rectangle(15, 15, 10, 10);
            expect(checkCollision(circle, rect)).toBe(true);
        });

        test('should not detect collision when separated', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const circle = new Circle(30, 30, 5);
            expect(checkCollision(rect, circle)).toBe(false);
        });
    });

    // ===== КРУГ-ТРЕУГОЛЬНИК =====
    describe('Circle-Triangle collisions', () => {
        test('should detect when circle overlaps triangle', () => {
            const triangle = new Triangle(10, 10, 10);
            const circle = new Circle(12, 12, 3);
            expect(checkCollision(triangle, circle)).toBe(true);
        });

        test('should detect when circle touches triangle vertex', () => {
            const triangle = new Triangle(10, 10, 10);
            // Верхняя вершина примерно в (10, 15.77)
            const circle = new Circle(10, 15.77, 0.5);
            expect(checkCollision(triangle, circle)).toBe(true);
        });

        test('should detect when circle is inside triangle', () => {
            const triangle = new Triangle(10, 10, 20);
            const circle = new Circle(10, 10, 3);
            expect(checkCollision(triangle, circle)).toBe(true);
        });

        test('should detect when triangle is inside circle', () => {
            const circle = new Circle(10, 10, 20);
            const triangle = new Triangle(10, 10, 10);
            expect(checkCollision(circle, triangle)).toBe(true);
        });

        test('should not detect collision when separated', () => {
            const triangle = new Triangle(10, 10, 10);
            const circle = new Circle(30, 30, 5);
            expect(checkCollision(triangle, circle)).toBe(false);
        });
    });

    // ===== ПРЯМОУГОЛЬНИК-ТРЕУГОЛЬНИК =====
    describe('Rectangle-Triangle collisions', () => {
        test('should detect when rectangle and triangle overlap', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(15, 15, 10);
            expect(checkCollision(rect, triangle)).toBe(true);
        });

        test('should detect when triangle touches rectangle corner', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(20, 10, 2);
            expect(checkCollision(rect, triangle)).toBe(true);
        });

        test('should detect when triangle touches rectangle edge', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(15, 10, 2);
            expect(checkCollision(rect, triangle)).toBe(true);
        });

        test('should detect when triangle is inside rectangle', () => {
            const rect = new Rectangle(0, 0, 30, 30);
            const triangle = new Triangle(15, 15, 10);
            expect(checkCollision(rect, triangle)).toBe(true);
        });

        test('should detect when rectangle is inside triangle', () => {
            const triangle = new Triangle(10, 10, 30);
            const rect = new Rectangle(8, 8, 4, 4);
            expect(checkCollision(triangle, rect)).toBe(true);
        });

        test('should not detect collision when separated', () => {
            const rect = new Rectangle(10, 10, 10, 10);
            const triangle = new Triangle(30, 30, 5);
            expect(checkCollision(rect, triangle)).toBe(false);
        });
    });

    // ===== ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ =====
    describe('Additional checks', () => {
        test('contains method should work correctly for Rectangle', () => {
            const rect = new Rectangle(0, 0, 10, 10);
            
            expect(rect.contains({x: 5, y: 5})).toBe(true);
            expect(rect.contains({x: 0, y: 0})).toBe(true);
            expect(rect.contains({x: 10, y: 5})).toBe(false);
            expect(rect.contains({x: 5, y: 10})).toBe(false);
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