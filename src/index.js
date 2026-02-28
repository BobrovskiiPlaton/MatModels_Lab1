import Hexagon from "./hexagon";
import Rectangle from "./rectangle";
import Triangle from "./triangle";
import Circle from "./circle";
import QuadTree from "./quad-tree";

const canvas = document.getElementById("cnvs");

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
    quadTree: null
};

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength
        update(gameState.lastTick)
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    drawRectangles(context)
    drawTriangles(context)
    drawHexagons(context)
    drawCircles(context)
}

function drawRectangles(context) {
    const rects = gameState.rects
    for (let i = 0; i < rects.length; i++) {
        const rectangle = rects[i]
        context.fillStyle = rectangle.color
        
        if (rectangle.rotation !== 0) {
            context.save()
            const centerX = rectangle.x + rectangle.w / 2
            const centerY = rectangle.y + rectangle.h / 2
            context.translate(centerX, centerY)
            context.rotate(rectangle.rotation)
            context.fillRect(-rectangle.w / 2, -rectangle.h / 2, rectangle.w, rectangle.h)
            context.restore()
        } else {
            context.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h)
        }
    }
}

function drawTriangles(context) {
    const triangles = gameState.triangles
    for (let i = 0; i < triangles.length; i++) {
        const triangle = triangles[i]
        const vertices = triangle.vertices
        context.fillStyle = triangle.color
        context.beginPath()
        context.moveTo(vertices[0].x, vertices[0].y)
        context.lineTo(vertices[1].x, vertices[1].y)
        context.lineTo(vertices[2].x, vertices[2].y)
        context.closePath()
        context.fill()
    }
}

function drawHexagons(context) {
    const hexagons = gameState.hexagons
    for (let i = 0; i < hexagons.length; i++) {
        const hexagon = hexagons[i]
        const vertices = hexagon.vertices
        context.fillStyle = hexagon.color
        context.beginPath()
        context.moveTo(vertices[0].x, vertices[0].y)
        for(let j = 1; j < vertices.length; j++){
            context.lineTo(vertices[j].x, vertices[j].y)
        }
        context.closePath()
        context.fill()
    }
}

function drawCircles(context) {
    const circles = gameState.circles
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i]
        context.fillStyle = circle.color
        context.beginPath()
        context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
        context.fill()
    }
}

function checkAABBCollision(bounds1, bounds2, figure1, figure2) {
    if (bounds2.left >= bounds1.right ||
        bounds2.right <= bounds1.left ||
        bounds2.top >= bounds1.bottom ||
        bounds2.bottom <= bounds1.top) {
        return false
    }
    
    if (figure1 instanceof Circle && figure2 instanceof Circle) {
        const dx = figure1.x - figure2.x
        const dy = figure1.y - figure2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < figure1.r + figure2.r
    }
    
    return true
}

function handleCollisions() {
    gameState.allFigures = [
        ...gameState.rects,
        ...gameState.triangles,
        ...gameState.hexagons,
        ...gameState.circles
    ]

    const allFigures = gameState.allFigures

    const boundary = new Rectangle(0, 0, canvas.width, canvas.height)
    gameState.quadTree = new QuadTree(boundary, 8)
    
    for (let i = 0; i < allFigures.length; i++) {
        const figure = allFigures[i]
        const bounds = figure.getBounds()
        const figureRect = new Rectangle(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top
        )
        figureRect.figure = figure
        gameState.quadTree.insert(figureRect)
    }

    const processedPairs = new Set()
    
    for (let i = 0; i < allFigures.length; i++) {
        const figure1 = allFigures[i]
        const bounds1 = figure1.getBounds()
        
        const searchRect = new Rectangle(
            bounds1.left - 50,
            bounds1.top - 50,
            bounds1.right - bounds1.left + 100,
            bounds1.bottom - bounds1.top + 100
        )
        
        const nearbyRects = gameState.quadTree.queryRange(searchRect)
        
        for (let j = 0; j < nearbyRects.length; j++) {
            const figure2 = nearbyRects[j].figure
            if (figure1 === figure2) continue
            
            const pairId = i < allFigures.indexOf(figure2) ? 
                `${i}-${allFigures.indexOf(figure2)}` : 
                `${allFigures.indexOf(figure2)}-${i}`
            
            if (processedPairs.has(pairId)) continue
            
            const bounds2 = figure2.getBounds()
            
            if (checkAABBCollision(bounds1, bounds2, figure1, figure2)) {
                processedPairs.add(pairId)
                
                if (figure1 instanceof Triangle || figure1 instanceof Rectangle) {
                    figure1.startRotating()
                }
                if (figure2 instanceof Triangle || figure2 instanceof Rectangle) {
                    figure2.startRotating()
                }
                
                separateFigures(figure1, figure2, bounds1, bounds2)
                
                const speed1 = {x: figure1.speed.x, y: figure1.speed.y}
                const speed2 = {x: figure2.speed.x, y: figure2.speed.y}
                
                figure1.setSpeed(speed2.x, speed2.y)
                figure2.setSpeed(speed1.x, speed1.y)
            }
        }
    }
}

function separateFigures(figure1, figure2, bounds1, bounds2) {
    const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left)
    const overlapY = Math.min(bounds1.bottom, bounds2.bottom) - Math.max(bounds1.top, bounds2.top)
    
    if (overlapX < overlapY) {
        if (bounds1.left < bounds2.left) {
            figure1.x -= overlapX / 2
            figure2.x += overlapX / 2
        } else {
            figure1.x += overlapX / 2
            figure2.x -= overlapX / 2
        }
    } else {
        if (bounds1.top < bounds2.top) {
            figure1.y -= overlapY / 2
            figure2.y += overlapY / 2
        } else {
            figure1.y += overlapY / 2
            figure2.y -= overlapY / 2
        }
    }
    
    if (figure1 instanceof Circle) {
        figure1.x = Math.max(figure1.r, Math.min(canvas.width - figure1.r, figure1.x))
        figure1.y = Math.max(figure1.r, Math.min(canvas.height - figure1.r, figure1.y))
    }
    if (figure2 instanceof Circle) {
        figure2.x = Math.max(figure2.r, Math.min(canvas.width - figure2.r, figure2.x))
        figure2.y = Math.max(figure2.r, Math.min(canvas.height - figure2.r, figure2.y))
    }

    if (figure1 instanceof Rectangle) {
        figure1.x = Math.max(0, Math.min(canvas.width - figure1.w, figure1.x))
        figure1.y = Math.max(0, Math.min(canvas.height - figure1.h, figure1.y))
    }
    if (figure2 instanceof Rectangle) {
        figure2.x = Math.max(0, Math.min(canvas.width - figure2.w, figure2.x))
        figure2.y = Math.max(0, Math.min(canvas.height - figure2.h, figure2.y))
    }
    
    if (figure1 instanceof Triangle || figure1 instanceof Hexagon) {
        const bounds = figure1.getBounds()
        if (bounds.left < 0) figure1.x += (0 - bounds.left)
        if (bounds.right > canvas.width) figure1.x -= (bounds.right - canvas.width)
        if (bounds.top < 0) figure1.y += (0 - bounds.top)
        if (bounds.bottom > canvas.height) figure1.y -= (bounds.bottom - canvas.height)
    }
    if (figure2 instanceof Triangle || figure2 instanceof Hexagon) {
        const bounds = figure2.getBounds()
        if (bounds.left < 0) figure2.x += (0 - bounds.left)
        if (bounds.right > canvas.width) figure2.x -= (bounds.right - canvas.width)
        if (bounds.top < 0) figure2.y += (0 - bounds.top)
        if (bounds.bottom > canvas.height) figure2.y -= (bounds.bottom - canvas.height)
    }
}

function update(tick) {
    updateRectangles()
    updateTriangles()
    updateHexagons()
    updateCircles()
    updateRotations()

    handleCollisions()
}

function updateRotations() {
    const triangles = gameState.triangles
    for (let i = 0; i < triangles.length; i++) {
        triangles[i].updateRotation()
    }
    
    const rects = gameState.rects
    for (let i = 0; i < rects.length; i++) {
        rects[i].updateRotation()
    }
}

function updateRectangles() {
    const rects = gameState.rects
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    for (let i = 0; i < rects.length; i++) {
        const figure = rects[i]
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        if (figure.x + figure.w > canvasWidth) {
            figure.x = canvasWidth - figure.w
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (figure.x < 0) {
            figure.x = 0
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (figure.y + figure.h > canvasHeight) {
            figure.y = canvasHeight - figure.h
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (figure.y < 0) {
            figure.y = 0
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    }
}

function updateTriangles() {
    const triangles = gameState.triangles
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    for (let i = 0; i < triangles.length; i++) {
        const figure = triangles[i]
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()

        if (bounds.right > canvasWidth) {
            figure.x -= (bounds.right - canvasWidth)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvasHeight) {
            figure.y -= (bounds.bottom - canvasHeight)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    }
}

function updateHexagons() {
    const hexagons = gameState.hexagons
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    for (let i = 0; i < hexagons.length; i++) {
        const figure = hexagons[i]
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()

        if (bounds.right > canvasWidth) {
            figure.x -= (bounds.right - canvasWidth)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvasHeight) {
            figure.y -= (bounds.bottom - canvasHeight)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    }
}

function updateCircles() {
    const circles = gameState.circles
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    for (let i = 0; i < circles.length; i++) {
        const figure = circles[i]
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()

        if (bounds.right > canvasWidth) {
            figure.x = canvasWidth - figure.r
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x = figure.r
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvasHeight) {
            figure.y = canvasHeight - figure.r
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y = figure.r
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    }
}

function run(tFrame) {
    gameState.stopCycle = requestAnimationFrame(run)

    const nextTick = gameState.lastTick + gameState.tickLength
    let numTicks = 0

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick
        numTicks = Math.floor(timeSinceTick / gameState.tickLength)
        numTicks = Math.min(numTicks, 5)
    }
    queueUpdates(numTicks)
    draw(tFrame)
    gameState.lastRender = tFrame
}

function setup() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gameState.lastTick = performance.now()
    gameState.lastRender = gameState.lastTick
    gameState.tickLength = 15

    gameState.rects = []
    gameState.triangles = []
    gameState.hexagons = []
    gameState.circles = []
    
    for (let i = 0; i < 300; i++) {
        const rectangle = new Rectangle(
            Math.random() * (canvas.width - 10), 
            Math.random() * (canvas.height - 10), 
            10, 10
        )
        rectangle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.rects.push(rectangle)

        const triangle = new Triangle(
            Math.random() * (canvas.width - 10), 
            Math.random() * (canvas.height - 10), 
            10
        )
        triangle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.triangles.push(triangle)

        const hexagon = new Hexagon(
            Math.random() * (canvas.width - 5), 
            Math.random() * (canvas.height - 5), 
            5
        )
        hexagon.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.hexagons.push(hexagon)

        const circle = new Circle(
            Math.random() * (canvas.width - 5), 
            Math.random() * (canvas.height - 5), 
            5
        )
        circle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.circles.push(circle)
    }
}

setup();
run();