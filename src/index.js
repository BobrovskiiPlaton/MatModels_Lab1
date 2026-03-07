import Hexagon from "./hexagon";
import Rectangle from "./rectangle";
import Triangle from "./triangle";
import Circle from "./circle";
import QuadTree from "./quad-tree";

const canvas = document.getElementById("cnvs");

// Оптимизированное состояние игры
const gameState = {
    rects: [],
    triangles: [],
    hexagons: [],
    circles: [],
    allFigures: [],
    lastTick: 0,
    lastRender: 0,
    tickLength: 15,
    stopCycle: null,
    quadTree: null,
    figuresChanged: true, // Флаг для обновления allFigures
    processedPairs: new Set(), // Переиспользуемый Set для пар
    searchRectPool: [], // Пул для прямоугольников поиска
    canvasWidth: 0,
    canvasHeight: 0
};

// Пул для прямоугольников поиска
function getSearchRect(x, y, w, h) {
    const pool = gameState.searchRectPool;
    if (pool.length > 0) {
        const rect = pool.pop();
        rect.x = x;
        rect.y = y;
        rect.w = w;
        rect.h = h;
        return rect;
    }
    return new Rectangle(x, y, w, h);
}

function releaseSearchRect(rect) {
    if (gameState.searchRectPool.length < 100) { // Ограничиваем размер пула
        gameState.searchRectPool.push(rect);
    }
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick += gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
    
    // Оптимизированная отрисовка
    drawRectangles(context);
    drawTriangles(context);
    drawHexagons(context);
    drawCircles(context);
}

function drawRectangles(context) {
    const rects = gameState.rects;
    for (let i = 0; i < rects.length; i++) {
        const rectangle = rects[i];
        context.fillStyle = rectangle.color;
        
        if (rectangle.rotation !== 0) {
            context.save();
            const centerX = rectangle.x + rectangle.w / 2;
            const centerY = rectangle.y + rectangle.h / 2;
            context.translate(centerX, centerY);
            context.rotate(rectangle.rotation);
            context.fillRect(-rectangle.w / 2, -rectangle.h / 2, rectangle.w, rectangle.h);
            context.restore();
        } else {
            context.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
        }
    }
}

function drawTriangles(context) {
    const triangles = gameState.triangles;
    for (let i = 0; i < triangles.length; i++) {
        const triangle = triangles[i];
        const vertices = triangle.vertices;
        context.fillStyle = triangle.color;
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        context.lineTo(vertices[1].x, vertices[1].y);
        context.lineTo(vertices[2].x, vertices[2].y);
        context.closePath();
        context.fill();
    }
}

function drawHexagons(context) {
    const hexagons = gameState.hexagons;
    for (let i = 0; i < hexagons.length; i++) {
        const hexagon = hexagons[i];
        const vertices = hexagon.vertices;
        context.fillStyle = hexagon.color;
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for(let j = 1; j < vertices.length; j++){
            context.lineTo(vertices[j].x, vertices[j].y);
        }
        context.closePath();
        context.fill();
    }
}

function drawCircles(context) {
    const circles = gameState.circles;
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        context.fillStyle = circle.color;
        context.beginPath();
        context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
        context.fill();
    }
}

// Оптимизированная проверка коллизий
function checkAABBCollision(bounds1, bounds2, figure1, figure2) {
    if (bounds2.left >= bounds1.right ||
        bounds2.right <= bounds1.left ||
        bounds2.top >= bounds1.bottom ||
        bounds2.bottom <= bounds1.top) {
        return false;
    }
    
    // Для кругов используем точную проверку с квадратом расстояния
    if (figure1 instanceof Circle && figure2 instanceof Circle) {
        const dx = figure1.x - figure2.x;
        const dy = figure1.y - figure2.y;
        const distSq = dx * dx + dy * dy;
        const radSum = figure1.r + figure2.r;
        return distSq < radSum * radSum;
    }
    
    return true;
}

// Оптимизированная обработка коллизий
function handleCollisions() {
    // Обновляем allFigures только при необходимости
    if (gameState.figuresChanged) {
        gameState.allFigures = [
            ...gameState.rects,
            ...gameState.triangles,
            ...gameState.hexagons,
            ...gameState.circles
        ];
        gameState.figuresChanged = false;
    }

    const allFigures = gameState.allFigures;
    const boundary = new Rectangle(0, 0, gameState.canvasWidth, gameState.canvasHeight);
    
    // Переиспользуем QuadTree
    if (!gameState.quadTree) {
        gameState.quadTree = new QuadTree(boundary, 8);
    } else {
        gameState.quadTree.clear();
    }
    
    for (let i = 0; i < allFigures.length; i++) {
        gameState.quadTree.insert(allFigures[i]);
    }

    const processedPairs = gameState.processedPairs;
    processedPairs.clear();
    
    for (let i = 0; i < allFigures.length; i++) {
        const figure1 = allFigures[i];
        const bounds1 = figure1.getBounds();
        
        // Используем пул для поискового прямоугольника
        const searchRect = getSearchRect(
            bounds1.left - 50,
            bounds1.top - 50,
            bounds1.right - bounds1.left + 100,
            bounds1.bottom - bounds1.top + 100
        );
        
        const nearbyFigures = gameState.quadTree.queryRange(searchRect);
        releaseSearchRect(searchRect);
        
        for (let j = 0; j < nearbyFigures.length; j++) {
            const figure2 = nearbyFigures[j];
            if (figure1 === figure2) continue;
            
            // Оптимизированное создание ключа пары
            const index2 = allFigures.indexOf(figure2);
            const pairId = i < index2 ? 
                (i << 16) | index2 : // Используем битовые операции для чисел
                (index2 << 16) | i;
            
            if (processedPairs.has(pairId)) continue;
            
            const bounds2 = figure2.getBounds();
            
            if (checkAABBCollision(bounds1, bounds2, figure1, figure2)) {
                processedPairs.add(pairId);
                
                if (figure1 instanceof Triangle || figure1 instanceof Rectangle) {
                    figure1.startRotating();
                }
                if (figure2 instanceof Triangle || figure2 instanceof Rectangle) {
                    figure2.startRotating();
                }
                
                separateFigures(figure1, figure2, bounds1, bounds2);
                
                // Обмен скоростями
                const speed1x = figure1.speed.x;
                const speed1y = figure1.speed.y;
                figure1.setSpeed(figure2.speed.x, figure2.speed.y);
                figure2.setSpeed(speed1x, speed1y);
            }
        }
    }
}

// Оптимизированное разделение фигур
function separateFigures(figure1, figure2, bounds1, bounds2) {
    const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left);
    const overlapY = Math.min(bounds1.bottom, bounds2.bottom) - Math.max(bounds1.top, bounds2.top);
    
    if (overlapX < overlapY) {
        if (bounds1.left < bounds2.left) {
            figure1.x -= overlapX / 2;
            figure2.x += overlapX / 2;
        } else {
            figure1.x += overlapX / 2;
            figure2.x -= overlapX / 2;
        }
    } else {
        if (bounds1.top < bounds2.top) {
            figure1.y -= overlapY / 2;
            figure2.y += overlapY / 2;
        } else {
            figure1.y += overlapY / 2;
            figure2.y -= overlapY / 2;
        }
    }
    
    // Помечаем, что границы изменились
    if (figure1._needsBoundsUpdate !== undefined) figure1._needsBoundsUpdate = true;
    if (figure2._needsBoundsUpdate !== undefined) figure2._needsBoundsUpdate = true;
    
    // Оптимизированная проверка границ канваса
    constrainToCanvas(figure1);
    constrainToCanvas(figure2);
}

// Оптимизированное ограничение фигур канвасом
function constrainToCanvas(figure) {
    const canvasWidth = gameState.canvasWidth;
    const canvasHeight = gameState.canvasHeight;
    
    if (figure instanceof Circle) {
        figure.x = Math.max(figure.r, Math.min(canvasWidth - figure.r, figure.x));
        figure.y = Math.max(figure.r, Math.min(canvasHeight - figure.r, figure.y));
    } else if (figure instanceof Rectangle) {
        figure.x = Math.max(0, Math.min(canvasWidth - figure.w, figure.x));
        figure.y = Math.max(0, Math.min(canvasHeight - figure.h, figure.y));
    } else if (figure instanceof Triangle || figure instanceof Hexagon) {
        const bounds = figure.getBounds();
        if (bounds.left < 0) figure.x += (0 - bounds.left);
        if (bounds.right > canvasWidth) figure.x -= (bounds.right - canvasWidth);
        if (bounds.top < 0) figure.y += (0 - bounds.top);
        if (bounds.bottom > canvasHeight) figure.y -= (bounds.bottom - canvasHeight);
    }
}

function update(tick) {
    updateRectangles();
    updateTriangles();
    updateHexagons();
    updateCircles();
    updateRotations();

    handleCollisions();
}

function updateRotations() {
    const triangles = gameState.triangles;
    for (let i = 0; i < triangles.length; i++) {
        triangles[i].updateRotation();
    }
    
    const rects = gameState.rects;
    for (let i = 0; i < rects.length; i++) {
        rects[i].updateRotation();
    }
}

function updateRectangles() {
    const rects = gameState.rects;
    const canvasWidth = gameState.canvasWidth;
    const canvasHeight = gameState.canvasHeight;
    
    for (let i = 0; i < rects.length; i++) {
        const figure = rects[i];
        
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        figure._needsBoundsUpdate = true;

        let bounced = false;
        
        if (figure.x + figure.w > canvasWidth) {
            figure.x = canvasWidth - figure.w;
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        } else if (figure.x < 0) {
            figure.x = 0;
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        }

        if (figure.y + figure.h > canvasHeight) {
            figure.y = canvasHeight - figure.h;
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        } else if (figure.y < 0) {
            figure.y = 0;
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        }
        
        if (bounced) {
            figure._needsBoundsUpdate = true;
        }
    }
}

function updateTriangles() {
    const triangles = gameState.triangles;
    const canvasWidth = gameState.canvasWidth;
    const canvasHeight = gameState.canvasHeight;
    
    for (let i = 0; i < triangles.length; i++) {
        const figure = triangles[i];
        
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        figure._needsVerticesUpdate = true;
        figure._needsBoundsUpdate = true;

        const bounds = figure.getBounds();
        let bounced = false;

        if (bounds.right > canvasWidth) {
            figure.x -= (bounds.right - canvasWidth);
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left);
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        }

        if (bounds.bottom > canvasHeight) {
            figure.y -= (bounds.bottom - canvasHeight);
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top);
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        }
        
        if (bounced) {
            figure._needsVerticesUpdate = true;
            figure._needsBoundsUpdate = true;
        }
    }
}

function updateHexagons() {
    const hexagons = gameState.hexagons;
    const canvasWidth = gameState.canvasWidth;
    const canvasHeight = gameState.canvasHeight;
    
    for (let i = 0; i < hexagons.length; i++) {
        const figure = hexagons[i];
        
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        figure._needsVerticesUpdate = true;
        figure._needsBoundsUpdate = true;

        const bounds = figure.getBounds();
        let bounced = false;

        if (bounds.right > canvasWidth) {
            figure.x -= (bounds.right - canvasWidth);
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left);
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        }

        if (bounds.bottom > canvasHeight) {
            figure.y -= (bounds.bottom - canvasHeight);
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top);
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        }
        
        if (bounced) {
            figure._needsVerticesUpdate = true;
            figure._needsBoundsUpdate = true;
        }
    }
}

function updateCircles() {
    const circles = gameState.circles;
    const canvasWidth = gameState.canvasWidth;
    const canvasHeight = gameState.canvasHeight;
    
    for (let i = 0; i < circles.length; i++) {
        const figure = circles[i];
        
        figure.x += figure.speed.x;
        figure.y += figure.speed.y;

        figure._needsBoundsUpdate = true;

        const bounds = figure.getBounds();
        let bounced = false;

        if (bounds.right > canvasWidth) {
            figure.x = canvasWidth - figure.r;
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        } else if (bounds.left < 0) {
            figure.x = figure.r;
            figure.setSpeed(-figure.speed.x, figure.speed.y);
            bounced = true;
        }

        if (bounds.bottom > canvasHeight) {
            figure.y = canvasHeight - figure.r;
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        } else if (bounds.top < 0) {
            figure.y = figure.r;
            figure.setSpeed(figure.speed.x, -figure.speed.y);
            bounced = true;
        }
        
        if (bounced) {
            figure._needsBoundsUpdate = true;
        }
    }
}

function run(tFrame) {
    gameState.stopCycle = requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
        numTicks = Math.min(numTicks, 5);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function setup() {
    gameState.canvasWidth = window.innerWidth;
    gameState.canvasHeight = window.innerHeight;
    canvas.width = gameState.canvasWidth;
    canvas.height = gameState.canvasHeight;
    
    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15;

    gameState.rects = [];
    gameState.triangles = [];
    gameState.hexagons = [];
    gameState.circles = [];
    
    // Оптимизированное создание фигур
    const count = 800;
    const speedRange = 4;
    
    for (let i = 0; i < count; i++) {
        const speedX = (Math.random() * speedRange + 1) * (Math.random() > 0.5 ? 1 : -1);
        const speedY = (Math.random() * speedRange + 1) * (Math.random() > 0.5 ? 1 : -1);
        
        const rectangle = new Rectangle(
            Math.random() * (gameState.canvasWidth - 20), 
            Math.random() * (gameState.canvasHeight - 20), 
            10, 10
        );
        rectangle.setSpeed(speedX, speedY);
        gameState.rects.push(rectangle);

        const triangle = new Triangle(
            Math.random() * (gameState.canvasWidth - 20), 
            Math.random() * (gameState.canvasHeight - 20), 
            10
        );
        triangle.setSpeed(speedX * 1.1, speedY * 1.1); // Немного разные скорости
        gameState.triangles.push(triangle);

        /* Раскомментировать для добавления шестиугольников
        const hexagon = new Hexagon(
            Math.random() * (gameState.canvasWidth - 20), 
            Math.random() * (gameState.canvasHeight - 20), 
            10
        );
        hexagon.setSpeed(speedX * 0.9, speedY * 0.9);
        gameState.hexagons.push(hexagon);
        */

        const circle = new Circle(
            Math.random() * (gameState.canvasWidth - 20), 
            Math.random() * (gameState.canvasHeight - 20), 
            5
        );
        circle.setSpeed(speedX, speedY);
        gameState.circles.push(circle);
    }
    
    gameState.figuresChanged = true;
    
    console.log('Setup complete:', {
        rects: gameState.rects.length,
        triangles: gameState.triangles.length,
        hexagons: gameState.hexagons.length,
        circles: gameState.circles.length
    });
}

setup();
run();