class Engine {
    constructor(container) {
        this.container = container;
        this.size = 4;
        this.tiles = [];
        this.empty = { x: 3, y: 3 };
        this.isLocked = false;
    }

    render(size, mode, image) {
        this.size = size;
        this.container.innerHTML = '';
        this.tiles = [];
        this.empty = { x: size - 1, y: size - 1 };
        const tSize = 100 / size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x === size - 1 && y === size - 1) continue;
                
                const val = y * size + x + 1;
                const el = document.createElement('div');
                el.className = `tile ${mode === 'photo' ? 'photo-mode' : ''}`;
                el.style.width = el.style.height = `calc(${tSize}% - 4px)`;
                
                if (mode === 'photo') {
                    el.style.backgroundImage = `url(${image})`;
                    el.style.backgroundSize = `${size * 100}%`;
                    el.style.backgroundPosition = `${(x / (size - 1)) * 100}% ${(y / (size - 1)) * 100}%`;
                } else {
                    el.textContent = val;
                }

                const tile = { el, x, y, ox: x, oy: y };
                el.addEventListener('pointerdown', () => this.tryMove(tile));
                this.tiles.push(tile);
                this.container.appendChild(el);
                this.updatePos(tile);
            }
        }
        this.shuffle();
    }

    updatePos(tile) {
        const percent = 100 / this.size;
        tile.el.style.transform = `translate3d(${tile.x * 100}%, ${tile.y * 100}%, 0)`;
    }

    tryMove(tile) {
        if (this.isLocked) return;
        const dx = Math.abs(tile.x - this.empty.x);
        const dy = Math.abs(tile.y - this.empty.y);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            const tx = tile.x, ty = tile.y;
            tile.x = this.empty.x; tile.y = this.empty.y;
            this.empty.x = tx; this.empty.y = ty;
            this.updatePos(tile);
            Core.incrementMove();
            this.checkWin();
        }
    }

    shuffle() {
        for (let i = 0; i < 200; i++) {
            const neighbors = this.tiles.filter(t => 
                (Math.abs(t.x - this.empty.x) === 1 && t.y === this.empty.y) ||
                (Math.abs(t.y - this.empty.y) === 1 && t.x === this.empty.x)
            );
            const t = neighbors[Math.floor(Math.random() * neighbors.length)];
            const tx = t.x, ty = t.y;
            t.x = this.empty.x; t.y = this.empty.y;
            this.empty.x = tx; this.empty.y = ty;
            this.updatePos(t);
        }
    }

    checkWin() {
        const won = this.tiles.every(t => t.x === t.ox && t.y === t.oy);
        if (won) Core.handleWin();
    }
}
