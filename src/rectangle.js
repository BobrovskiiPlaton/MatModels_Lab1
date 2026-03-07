export default class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = {x: 0, y: 0};
        this.color = 'rgb(0, 0, 200)';
        this.rotation = 0;
        this.rotationSpeed = 0;
        this._boundsCache = {left: 0, right: 0, top: 0, bottom: 0};
        this._needsBoundsUpdate = true;
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.w;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.h;
    }

    getBounds() {
        if (this._needsBoundsUpdate) {
            const cache = this._boundsCache;
            cache.left = this.left;
            cache.right = this.right;
            cache.top = this.top;
            cache.bottom = this.bottom;
            this._needsBoundsUpdate = false;
        }
        return this._boundsCache;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this._needsBoundsUpdate = true;
    }

    updateRotation() {
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed;
            if (this.rotation >= 2 * Math.PI) {
                this.rotation -= 2 * Math.PI;
            }
            this._needsBoundsUpdate = true;
        }
    }

    startRotating() {
        this.rotationSpeed = 0.03;
    }
    
    contains(point) {
        return point.x >= this.x && point.x < this.x + this.w &&
               point.y >= this.y && point.y < this.y + this.h;
    }
    
    intersects(other) {
        const bounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        return !(otherBounds.left >= bounds.right ||
                 otherBounds.right <= bounds.left ||
                 otherBounds.top >= bounds.bottom ||
                 otherBounds.bottom <= bounds.top);
    }
}