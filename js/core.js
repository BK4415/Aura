const Core = {
    config: null,
    state: { size: 4, mode: 'numbers', preset: 0, moves: 0, time: 0, timer: null },
    engine: null,

    async init() {
        const res = await fetch('json/config.json');
        this.config = await res.json();
        this.engine = new Engine(document.getElementById('board-viewport'));
        
        this.setupListeners();
        this.updatePreview();
        setTimeout(() => UI.nav('home'), 1500);
    },

    setupListeners() {
        document.querySelectorAll('#size-options .chip').forEach(c => {
            c.onclick = () => {
                document.querySelector('#size-options .chip.active').classList.remove('active');
                c.classList.add('active');
                this.state.size = parseInt(c.dataset.val);
                document.getElementById('lbl-size').textContent = `${this.state.size} × ${this.state.size}`;
            };
        });

        document.querySelectorAll('#mode-options .chip').forEach(c => {
            c.onclick = () => {
                document.querySelector('#mode-options .chip.active').classList.remove('active');
                c.classList.add('active');
                this.state.mode = c.dataset.val;
                document.getElementById('photo-picker').classList.toggle('hidden', this.state.mode !== 'photo');
                this.updatePreview();
            };
        });
        
        // Security: Disable context menu & dragging
        window.oncontextmenu = (e) => e.preventDefault();
    },

    changePreset(dir) {
        this.state.preset = (this.state.preset + dir + this.config.presets.length) % this.config.presets.length;
        document.getElementById('preset-name').textContent = `PRESET ${String(this.state.preset + 1).padStart(2, '0')}`;
        this.updatePreview();
    },

    updatePreview() {
        const p = document.getElementById('img-preview-container');
        p.style.backgroundImage = this.state.mode === 'photo' ? `url(${this.config.presets[this.state.preset]})` : 'none';
        p.style.background = this.state.mode === 'numbers' ? 'rgba(255,255,255,0.05)' : '';
    },

    launchGame() {
        this.state.moves = 0;
        this.state.time = 0;
        document.getElementById('val-moves').textContent = '0';
        UI.nav('game');
        this.engine.render(this.state.size, this.state.mode, this.config.presets[this.state.preset]);
        this.startTimer();
    },

    startTimer() {
        clearInterval(this.state.timer);
        this.state.timer = setInterval(() => {
            this.state.time++;
            document.getElementById('val-time').textContent = UI.formatTime(this.state.time);
        }, 1000);
    },

    incrementMove() {
        this.state.moves++;
        document.getElementById('val-moves').textContent = this.state.moves;
    },

    handleWin() {
        clearInterval(this.state.timer);
        UI.showWin();
    }
};

window.onload = () => Core.init();
