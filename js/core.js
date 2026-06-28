const Core = {
    // FALLBACK CONFIG: If your JSON file fails, these images/settings are used.
    config: {
        presets: [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
            "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=800",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800",
            "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=800",
            "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800"
        ],
        ratings: {
            "3": { "stars5": 25, "stars4": 40, "stars3": 60 },
            "4": { "stars5": 80, "stars4": 120, "stars3": 180 },
            "5": { "stars5": 150, "stars4": 250, "stars3": 400 },
            "7": { "stars5": 400, "stars4": 650, "stars3": 900 }
        }
    },
    state: { size: 4, mode: 'numbers', preset: 0, moves: 0, time: 0, timer: null },
    engine: null,

    async init() {
        this.updateProgress(20, "WAKING UP...");

        // Try to load external JSON, but don't get stuck if it fails
        try {
            const res = await fetch('json/config.json');
            if (res.ok) {
                const externalConfig = await res.json();
                this.config = externalConfig;
                console.log("External Config Loaded");
            }
        } catch (e) {
            console.warn("Using Internal Config (Local File Mode)");
        }

        this.updateProgress(60, "PREPARING BOARD...");
        this.engine = new Engine(document.getElementById('board-viewport'));
        this.setupListeners();
        this.updatePreview();

        // Safety Finish
        this.updateProgress(100, "COMPLETE");
        setTimeout(() => UI.nav('home'), 500);
    },

    updateProgress(pct, msg) {
        const bar = document.getElementById('loading-bar');
        const txt = document.getElementById('loader-status');
        if(bar) bar.style.width = pct + "%";
        if(txt) txt.textContent = msg;
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
    },

    changePreset(dir) {
        this.state.preset = (this.state.preset + dir + this.config.presets.length) % this.config.presets.length;
        document.getElementById('preset-name').textContent = `PRESET ${String(this.state.preset + 1).padStart(2, '0')}`;
        this.updatePreview();
    },

    updatePreview() {
        const p = document.getElementById('img-preview-container');
        if(this.state.mode === 'photo') {
            p.style.backgroundImage = `url(${this.config.presets[this.state.preset]})`;
        } else {
            p.style.backgroundImage = 'none';
            p.style.background = 'rgba(255,255,255,0.05)';
        }
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
        if(this.state.timer) clearInterval(this.state.timer);
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
