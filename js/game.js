class SlidingEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.size = 4;
        this.mode = 'numbers';
        this.image = '';
        this.tiles = [];
        this.emptyPos = { x: 0, y: 0 };
        this.moves = 0;
        this.isDragging = false;
        this.locked = false;

        this.setupEvents();
    }

    init(size, mode, imageUrl) {
        this.size = size;
        this.mode = mode;
        this.image = imageUrl;
        this.moves = 0;
        this.locked = false;
        this.container.innerHTML = '';
        
        const rect = this.container.getBoundingClientRect();
        this.tileSize = (rect.width / size);

        // Create initial solved state then shuffle
        this.tiles = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x === size - 1 && y === size - 1) {
                    this.emptyPos = { x, y };
                    continue;
                }
                this.createTile(x, y, (y * size) + x + 1);
            }
        }
        this.shuffle();
    }

    createTile(x, y, num) {
        const el = document.createElement('div');
        el.className = `tile ${this.mode === 'photo' ? 'photo-mode' : ''}`;
        el.style.width = `${this.tileSize - 4}px`;
        el.style.height = `${this.tileSize - 4}px`;
        
        if (this.mode === 'numbers') {
            el.textContent = num;
        } else {
            el.style.backgroundImage = `url(${this.image})`;
            // Calculate background position based on original x, y
            const bx = (num - 1) % this.size;
            const by = Math.floor((num - 1) / this.size);
            el.style.backgroundPosition = `-${bx * this.tileSize}px -${by * this.tileSize}px`;
            el.style.backgroundSize = `${this.size * this.tileSize}px ${this.size * this.tileSize}px`;
        }

        const tile = { el, x, y, origX: x, origY: y, curX: x, curY: y };
        this.tiles.push(tile);
        this.container.appendChild(el);
        this.updateDOM(tile);
    }

    updateDOM(tile) {
        tile.el.style.transform = `translate3d(${tile.curX * this.tileSize}px, ${tile.curY * this.tileSize}px, 0)`;
    }

    setupEvents() {
        this.container.addEventListener('pointerdown', e => this.handleDown(e));
        window.addEventListener('pointermove', e => this.handleMove(e));
        window.addEventListener('pointerup', () => this.handleUp());
    }

    handleDown(e) {
        if (this.locked) return;
        const tileEl = e.target.closest('.tile');
        if (!tileEl) return;
        const tile = this.tiles.find(t => t.el === tileEl);
        
        // Simple valid move check
        if (this.isAdjacent(tile)) {
            this.moveTile(tile);
        }
    }

    isAdjacent(tile) {
        const dx = Math.abs(tile.curX - this.emptyPos.x);
        const dy = Math.abs(tile.curY - this.emptyPos.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    moveTile(tile, isShuffle = false) {
        const tempX = tile.curX;
        const tempY = tile.curY;
        
        tile.curX = this.emptyPos.x;
        tile.curY = this.emptyPos.y;
        this.emptyPos.x = tempX;
        this.emptyPos.y = tempY;

        this.updateDOM(tile);
        
        if (!isShuffle) {
            this.moves++;
            App.onMove(this.moves);
            this.checkWin();
        }
    }

    shuffle() {
        for (let i = 0; i < 200; i++) {
            const adj = this.tiles.filter(t => this.isAdjacent(t));
            this.moveTile(adj[Math.floor(Math.random() * adj.length)], true);
        }
    }

    checkWin() {
        const won = this.tiles.every(t => t.curX === t.origX && t.curY === t.origY);
        if (won) {
            this.locked = true;
            setTimeout(() => App.onWin(), 500);
        }
    }
}
