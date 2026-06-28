const App = {
    state: {
        size: 4,
        mode: 'numbers',
        currentPreset: 0,
        presets: [],
        timer: 0,
        timerInt: null,
        moves: 0,
        config: null
    },

    async init() {
        const response = await fetch('json/config.json');
        this.state.config = await response.json();
        this.state.presets = this.state.config.presets;
        
        this.setupListeners();
        this.updatePreview();
        
        // Hide Loader
        setTimeout(() => {
            document.getElementById('loading-screen').classList.remove('active');
            UI.showPage('home');
        }, 2000);
    },

    setupListeners() {
        document.querySelectorAll('#size-chips .chip').forEach(btn => {
            btn.onclick = () => {
                document.querySelector('#size-chips .chip.active').classList.remove('active');
                btn.classList.add('active');
                this.state.size = parseInt(btn.dataset.size);
                document.getElementById('preview-size-label').textContent = `${this.state.size}x${this.state.size}`;
            };
        });

        document.querySelectorAll('#mode-chips .chip').forEach(btn => {
            btn.onclick = () => {
                document.querySelector('#mode-chips .chip.active').classList.remove('active');
                btn.classList.add('active');
                this.state.mode = btn.dataset.mode;
                document.getElementById('photo-selector').classList.toggle('hidden', this.state.mode === 'numbers');
                this.updatePreview();
            };
        });
    },

    updatePreview() {
        const preview = document.getElementById('live-preview');
        if (this.state.mode === 'photo') {
            preview.style.backgroundImage = `url(${this.state.presets[this.state.currentPreset]})`;
        } else {
            preview.style.backgroundImage = 'none';
            preview.style.backgroundColor = '#222';
        }
    },

    nextImage() {
        this.state.currentPreset = (this.state.currentPreset + 1) % this.state.presets.length;
        this.updateImageUI();
    },

    prevImage() {
        this.state.currentPreset = (this.state.currentPreset - 1 + this.state.presets.length) % this.state.presets.length;
        this.updateImageUI();
    },

    updateImageUI() {
        document.getElementById('image-index-label').textContent = `Preset ${this.state.currentPreset + 1}`;
        this.updatePreview();
    },

    startGame() {
        this.state.moves = 0;
        this.state.timer = 0;
        UI.showPage('game');
        
        const imgUrl = this.state.mode === 'photo' ? this.state.presets[this.state.currentPreset] : null;
        engine.init(this.state.size, this.state.mode, imgUrl);
        
        this.startTimer();
    },

    startTimer() {
        clearInterval(this.state.timerInt);
        this.state.timerInt = setInterval(() => {
            this.state.timer++;
            UI.updateTimer(this.state.timer);
        }, 1000);
    },

    onMove(count) {
        this.state.moves = count;
        document.getElementById('move-count').textContent = count;
    },

    onWin() {
        clearInterval(this.state.timerInt);
        UI.showWinPopup(this.state.moves, this.state.timer, this.state.size);
        Storage.saveStats(this.state.size, this.state.moves, this.state.timer);
    }
};

const engine = new SlidingEngine('game-board-container');
window.onload = () => App.init();
