import Hexagon from "./hexagon";
import Rectangle from "./rectangle";
import Triangle from "./triangle";
import Circle from "./circle";
import QuadTree from "./quad-tree";

const canvas = document.getElementById("cnvs");

const gameState = {};

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength
        update(gameState.lastTick)
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height)
    
    gameState.rects.forEach((rectangle)=>{
        context.fillStyle = rectangle.color
        context.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h)
    })

    
    gameState.triangles.forEach((triangle)=>{
        const vertices = triangle.vertices
        context.fillStyle = triangle.color
        context.beginPath()
        context.moveTo(vertices[0].x, vertices[0].y)
        context.lineTo(vertices[1].x, vertices[1].y)
        context.lineTo(vertices[2].x, vertices[2].y)
        context.closePath()
        context.fill()
    })

    
    gameState.hexagons.forEach((hexagon)=>{
        const vertices = hexagon.vertices
        context.fillStyle = hexagon.color
        context.beginPath()
        context.moveTo(vertices[0].x, vertices[0].y)
        for(var i = 1; i < vertices.length; i++){
            context.lineTo(vertices[i].x, vertices[i].y)
        }
        context.closePath()
        context.fill()
    })

    
    gameState.circles.forEach((circle) => {
        context.fillStyle = circle.color
        context.beginPath()
        context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
        context.fill()
    })
}

function checkAABBCollision(bounds1, bounds2) {
    return !(bounds2.left >= bounds1.right ||
             bounds2.right <= bounds1.left ||
             bounds2.top >= bounds1.bottom ||
             bounds2.bottom <= bounds1.top)
}

function handleCollisions() {
    const allFigures = [
        ...gameState.rects,
        ...gameState.triangles,
        ...gameState.hexagons,
        ...gameState.circles
    ]


    allFigures.forEach((figure, index) => {
        if (!figure.id) figure.id = index
    })


    const boundary = new Rectangle(0, 0, canvas.width, canvas.height)
    const quadTree = new QuadTree(boundary, 4)
    

    allFigures.forEach(figure => {
        const bounds = figure.getBounds()
        const figureRect = new Rectangle(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top
        )
        figureRect.figure = figure
        quadTree.insert(figureRect)
    })

    const figuresToRemove = []
    const processedPairs = new Set()
    
    for (let i = 0; i < allFigures.length; i++) {
        const figure1 = allFigures[i]
        if (figuresToRemove.includes(figure1)) continue
        
        const bounds1 = figure1.getBounds()
        

        const searchRect = new Rectangle(
            bounds1.left - 100,
            bounds1.top - 100,
            bounds1.right - bounds1.left + 200,
            bounds1.bottom - bounds1.top + 200
        )
        

        const nearbyRects = quadTree.queryRange(searchRect)
        
        for (const rect of nearbyRects) {
            const figure2 = rect.figure
            if (figure1 === figure2 || figuresToRemove.includes(figure2)) continue
            

            const pairId = figure1.id < figure2.id ? 
                `${figure1.id}-${figure2.id}` : 
                `${figure2.id}-${figure1.id}`
            
            if (processedPairs.has(pairId)) continue
            

            const bounds2 = figure2.getBounds()
            
            if (checkAABBCollision(bounds1, bounds2)) {
                processedPairs.add(pairId)
                

                const tempColor = figure1.color
                figure1.color = figure2.color
                figure2.color = tempColor

                const shouldRemove1 = figure1.incrementCollision()
                const shouldRemove2 = figure2.incrementCollision()

                if (shouldRemove1 && !figuresToRemove.includes(figure1)) {
                    figuresToRemove.push(figure1)
                }

                if (shouldRemove2 && !figuresToRemove.includes(figure2)) {
                    figuresToRemove.push(figure2)
                }

                const speed1 = {...figure1.speed}
                const speed2 = {...figure2.speed}
                
                figure1.setSpeed(speed2.x, speed2.y)
                figure2.setSpeed(speed1.x, speed1.y)
            }
        }
    }


    gameState.rects = gameState.rects.filter(rect => !figuresToRemove.includes(rect))
    gameState.triangles = gameState.triangles.filter(tri => !figuresToRemove.includes(tri))
    gameState.hexagons = gameState.hexagons.filter(hex => !figuresToRemove.includes(hex))
    gameState.circles = gameState.circles.filter(circle => !figuresToRemove.includes(circle))
}

function update(tick) {
    updateRectangles()
    updateTriangles()
    updateHexagons()
    updateCircles()
    
    handleCollisions()
}

function updateRectangles() {
    gameState.rects.forEach((figure)=>{
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        if (figure.x + figure.w > canvas.width) {
            figure.x = canvas.width - figure.w
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (figure.x < 0) {
            figure.x = 0
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (figure.y + figure.h > canvas.height) {
            figure.y = canvas.height - figure.h
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (figure.y < 0) {
            figure.y = 0
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    })
}

function updateTriangles() {
    gameState.triangles.forEach((figure) => {
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()
        const width = bounds.right - bounds.left
        const height = bounds.bottom - bounds.top

        if (bounds.right > canvas.width) {
            figure.x -= (bounds.right - canvas.width)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvas.height) {
            figure.y -= (bounds.bottom - canvas.height)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    })
}

function updateHexagons() {
    gameState.hexagons.forEach((figure) => {
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()
        const width = bounds.right - bounds.left
        const height = bounds.bottom - bounds.top

        if (bounds.right > canvas.width) {
            figure.x -= (bounds.right - canvas.width)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x += (0 - bounds.left)
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvas.height) {
            figure.y -= (bounds.bottom - canvas.height)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y += (0 - bounds.top)
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    })
}

function updateCircles() {
    gameState.circles.forEach((figure) => {
        figure.x += figure.speed.x
        figure.y += figure.speed.y

        const bounds = figure.getBounds()

        if (bounds.right > canvas.width) {
            figure.x = canvas.width - figure.r
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        } else if (bounds.left < 0) {
            figure.x = figure.r
            figure.setSpeed(-figure.speed.x, figure.speed.y)
        }

        if (bounds.bottom > canvas.height) {
            figure.y = canvas.height - figure.r
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        } else if (bounds.top < 0) {
            figure.y = figure.r
            figure.setSpeed(figure.speed.x, -figure.speed.y)
        }
    })
}


function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run)

    const nextTick = gameState.lastTick + gameState.tickLength
    let numTicks = 0

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick
        numTicks = Math.floor(timeSinceTick / gameState.tickLength)
    }
    queueUpdates(numTicks)
    draw(tFrame)
    gameState.lastRender = tFrame
}

function stopGame(handle) {
    window.cancelAnimationFrame(handle);
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
    for (var i = 0; i < 10; i++) {
        const rectangle = new Rectangle(Math.random() * (canvas.width - 30), Math.random() * (canvas.height - 30), 30, 30)
        rectangle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.rects.push(rectangle)

        const triangle = new Triangle(Math.random() * (canvas.width - 30), Math.random() * (canvas.height - 30), 30)
        triangle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.triangles.push(triangle)

        const hexagon = new Hexagon(Math.random() * (canvas.width - 20), Math.random() * (canvas.height - 20), 20)
        hexagon.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.hexagons.push(hexagon)

        const circle = new Circle(Math.random() * (canvas.width - 20), Math.random() * (canvas.height - 20), 20)
        circle.setSpeed(Math.random() * 5, Math.random() * 5)
        gameState.circles.push(circle)
    }
}
setup();
run();