export default class Triangle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = {x: 0, y: 0};
        this.r = size / Math.sqrt(3);
        this.color = 'rgb(200, 0, 0)';
        this.collisionCount = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this._boundsCache = {left: 0, right: 0, top: 0, bottom: 0};
        this._verticesCache = new Array(3);
        this._needsBoundsUpdate = true;
        this._needsVerticesUpdate = true;
        
        // Предвычисленные базовые углы
        this._baseAngles = [Math.PI/2, 7*Math.PI/6, 11*Math.PI/6];
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
        const r = this.r;
        const x = this.x;
        const y = this.y;
        const rotation = this.rotation;
        
        for (let i = 0; i < 3; i++) {
            const angle = this._baseAngles[i] + rotation;
            vertices[i] = {
                x: x + r * Math.cos(angle),
                y: y + r * Math.sin(angle)
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
            
            for (let i = 0; i < 3; i++) {
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

    updateRotation() {
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed;
            if (this.rotation >= 2 * Math.PI) {
                this.rotation -= 2 * Math.PI;
            }
            this._needsVerticesUpdate = true;
            this._needsBoundsUpdate = true;
        }
    }

    startRotating() {
        this.rotationSpeed = 0.05;
    }
}