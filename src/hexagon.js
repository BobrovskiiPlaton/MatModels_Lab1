export default class Hexagon {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = {x: 0, y: 0};
        this.color = 'rgb(0, 200, 0)';
        this._boundsCache = {left: 0, right: 0, top: 0, bottom: 0};
        this._verticesCache = new Array(6);
        this._needsBoundsUpdate = true;
        this._needsVerticesUpdate = true;
        
        // Предвычисленные углы для производительности
        this._angles = new Array(6);
        for (let i = 0; i < 6; i++) {
            this._angles[i] = (i * 60 - 30) * Math.PI / 180;
        }
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }

    get vertices() {
        if (this._needsVerticesUpdate) {
            this._updateVerticesCache();
        }
        return this._verticesCache;
    }

    _updateVerticesCache() {
        const vertices = this._verticesCache;
        const size = this.size;
        const x = this.x;
        const y = this.y;
        
        for (let i = 0; i < 6; i++) {
            const angle = this._angles[i];
            vertices[i] = {
                x: x + size * Math.cos(angle),
                y: y + size * Math.sin(angle)
            };
        }
        
        this._needsVerticesUpdate = false;
        this._needsBoundsUpdate = true;
    }

    getBounds() {
        if (this._needsBoundsUpdate) {
            const vertices = this.vertices;
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            for (let i = 0; i < 6; i++) {
                const v = vertices[i];
                if (v.x < minX) minX = v.x;
                if (v.y < minY) minY = v.y;
                if (v.x > maxX) maxX = v.x;
                if (v.y > maxY) maxY = v.y;
            }
            
            const cache = this._boundsCache;
            cache.left = minX;
            cache.right = maxX;
            cache.top = minY;
            cache.bottom = maxY;
            this._needsBoundsUpdate = false;
        }
        return this._boundsCache;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this._needsVerticesUpdate = true;
        this._needsBoundsUpdate = true;
    }
}