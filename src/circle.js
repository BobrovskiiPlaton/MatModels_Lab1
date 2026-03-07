export default class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = {x: 0, y: 0};
        this.color = 'rgb(255, 255, 0)';
        this._boundsCache = {left: 0, right: 0, top: 0, bottom: 0};
        this._needsBoundsUpdate = true;
    }

    setSpeed(x, y) {
        this.speed.x = x;
        this.speed.y = y;
    }

    _updateBoundsCache() {
        const cache = this._boundsCache;
        cache.left = this.x - this.r;
        cache.right = this.x + this.r;
        cache.top = this.y - this.r;
        cache.bottom = this.y + this.r;
        this._needsBoundsUpdate = false;
    }

    getBounds() {
        if (this._needsBoundsUpdate) {
            this._updateBoundsCache();
        }
        return this._boundsCache;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this._needsBoundsUpdate = true;
    }
    
    // Добавляем метод для проверки коллизии с другими фигурами
    collidesWith(other) {
        const bounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        // Быстрая AABB проверка
        if (otherBounds.left >= bounds.right ||
            otherBounds.right <= bounds.left ||
            otherBounds.top >= bounds.bottom ||
            otherBounds.bottom <= bounds.top) {
            return false;
        }
        
        // Для кругов используем точную проверку
        if (other instanceof Circle) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSq = dx * dx + dy * dy;
            const radSum = this.r + other.r;
            return distSq <= radSum * radSum;
        }
        
        return true;
    }
}