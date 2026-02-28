// quad-tree.js
import Rectangle from './rectangle'

export default class QuadTree {
    constructor(boundary, capacity = 4) {
        if (!boundary) {
            throw TypeError('boundary is null or undefined')
        }

        if (!(boundary instanceof Rectangle)) {
            throw TypeError('boundary should be a Rectangle')
        }

        this._rects = []
        this._boundary = boundary
        this._capacity = capacity
        this._hasChildren = false
        this._children = []
    }

    insert(rect) {
        if (!(rect instanceof Rectangle)) {
            throw new TypeError('inserted object should be a Rectangle')
        }
        

        if (rect.x + rect.w < this._boundary.x || 
            rect.x > this._boundary.x + this._boundary.w ||
            rect.y + rect.h < this._boundary.y || 
            rect.y > this._boundary.y + this._boundary.h) {
            return false
        }

        if (this._hasChildren) {
            return this._insertIntoChildren(rect)
        }

        this._rects.push(rect)

        if (this._rects.length > this._capacity) {
            this._subdivide()
            const rects = this._rects
            this._rects = []
            for (const r of rects) {
                this._insertIntoChildren(r)
            }
        }

        return true
    }

    _insertIntoChildren(rect) {
        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i].insert(rect)) {
                return true
            }
        }
        return false
    }

    get length() {
        let count = this._rects.length
        if (this._hasChildren) {
            for (let i = 0; i < this._children.length; i++) {
                count += this._children[i].length
            }
        }
        return count
    }

    queryRange(rect, found = []) {
        // Быстрая проверка пересечения
        if (rect.x + rect.w < this._boundary.x || 
            rect.x > this._boundary.x + this._boundary.w ||
            rect.y + rect.h < this._boundary.y || 
            rect.y > this._boundary.y + this._boundary.h) {
            return found
        }

        // Проверяем rects в текущем узле
        for (let i = 0; i < this._rects.length; i++) {
            const storedRect = this._rects[i]
            if (!(storedRect.x + storedRect.w < rect.x || 
                  storedRect.x > rect.x + rect.w ||
                  storedRect.y + storedRect.h < rect.y || 
                  storedRect.y > rect.y + rect.h)) {
                found.push(storedRect)
            }
        }

        // Рекурсивно проверяем дочерние узлы
        if (this._hasChildren) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].queryRange(rect, found)
            }
        }

        return found
    }

    _subdivide() {
        const x = this._boundary.x
        const y = this._boundary.y
        const w = this._boundary.w / 2
        const h = this._boundary.h / 2

        const nw = new Rectangle(x, y, w, h)
        const ne = new Rectangle(x + w, y, w, h)
        const sw = new Rectangle(x, y + h, w, h)
        const se = new Rectangle(x + w, y + h, w, h)

        this._children = [
            new QuadTree(nw, this._capacity),
            new QuadTree(ne, this._capacity),
            new QuadTree(sw, this._capacity),
            new QuadTree(se, this._capacity)
        ]

        this._hasChildren = true
    }

    clear() {
        this._rects = []
        this._children = []
        this._hasChildren = false
    }
}