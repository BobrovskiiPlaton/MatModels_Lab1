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
        
        if (!this._boundary.intersects(rect)) {
            return false
        }
        if (this._hasChildren) {
            return this._insertIntoChildren(rect)
        }
        this._rects.push(rect)

        if (this._rects.length > this._capacity && !this._hasChildren) {
            this._subdivide()
            const rects = [...this._rects]
            this._rects = []
            rects.forEach(r => this._insertIntoChildren(r))
        }

        return true
    }

    _insertIntoChildren(rect) {
        for (const child of this._children) {
            if (child.insert(rect)) {
                return true
            }
        }
        return false
    }

    get length() {
        let count = this._rects.length
        if (this._hasChildren) {
            // handle childrens somehow
            for (const child of this._children) {
                count += child.length
            }
        }
        return count
    }

    queryRange(rect, found = []) {
        if (!this._boundary.intersects(rect)) {
            return found
        }

        for (const storedRect of this._rects) {
            if (storedRect.intersects(rect)) {
                found.push(storedRect)
            }
        }

        if (this._hasChildren) {
            for (const child of this._children) {
                child.queryRange(rect, found)
            }
        }

        return found
    }

    // todo call if the number of elements is too big
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
        // clear _rects and _children arrays
        // see https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
        this._rects = []
        this._children = []
        this._hasChildren = false
    }

    getAllRects() {
        let rects = [...this._rects]
        if (this._hasChildren) {
            for (const child of this._children) {
                rects = rects.concat(child.getAllRects())
            }
        }
        return rects
    }
}