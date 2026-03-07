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

        this._items = []
        this._boundary = boundary
        this._capacity = capacity
        this._hasChildren = false
        this._children = []
    }

    _intersectsBoundary(item) {
        const bounds = item.getBounds()
        return !(bounds.left >= this._boundary.x + this._boundary.w ||
                 bounds.right <= this._boundary.x ||
                 bounds.top >= this._boundary.y + this._boundary.h ||
                 bounds.bottom <= this._boundary.y)
    }

    insert(item) {
        if (!item || typeof item.getBounds !== 'function') {
            throw new TypeError('inserted object must have getBounds() method')
        }
        
        if (!this._intersectsBoundary(item)) {
            return false
        }

        if (this._hasChildren) {
            return this._insertIntoChildren(item)
        }

        this._items.push(item)

        if (this._items.length > this._capacity) {
            this._subdivide()
        }

        return true
    }

    _insertIntoChildren(item) {
        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i].insert(item)) {
                return true
            }
        }
        return false
    }

    get length() {
        let count = this._items.length
        if (this._hasChildren) {
            for (let i = 0; i < this._children.length; i++) {
                count += this._children[i].length
            }
        }
        return count
    }

    queryRange(rect, found = []) {
        if (rect.x + rect.w < this._boundary.x || 
            rect.x > this._boundary.x + this._boundary.w ||
            rect.y + rect.h < this._boundary.y || 
            rect.y > this._boundary.y + this._boundary.h) {
            return found
        }

        const searchBounds = {
            left: rect.x,
            right: rect.x + rect.w,
            top: rect.y,
            bottom: rect.y + rect.h
        }

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i]
            const itemBounds = item.getBounds()
            
            if (!(itemBounds.left >= searchBounds.right ||
                  itemBounds.right <= searchBounds.left ||
                  itemBounds.top >= searchBounds.bottom ||
                  itemBounds.bottom <= searchBounds.top)) {
                found.push(item)
            }
        }

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

        const items = this._items
        this._items = []
        this._hasChildren = true

        for (const it of items) {
            this._insertIntoChildren(it)
        }
    }

    clear() {
        this._items = []
        this._children = []
        this._hasChildren = false
    }

    getAllItems(result = []) {
        result.push(...this._items)
        
        if (this._hasChildren) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].getAllItems(result)
            }
        }
        
        return result
    }
}