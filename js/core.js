const Core = {
    config: null,
    state: { size: 4, mode: 'numbers', preset: 0, moves: 0, time: 0, timer: null },
    engine: null,

    async init() {
        const bar = document.getElementById('loading-bar');
        const status = document.getElementById('loader-status');
        
        // Step 1: Progress Start
        this.updateProgress(30, "BOOTING ENGINE...");

        try {
            // Step 2: Try to load JSON with a Timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 sec timeout

            const res = await fetch('json/config.json', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                this.config = await res.json();
                this.updateProgress(70, "ASSETS SYNCED...");
            } else {
                throw new Error("Local config not found");
            }
        } catch (err) {
            console.warn("Using Fallback Config (PWA Mode)");
            // DEFAULT FALLBACK DATA (Agar file load nahi hui toh ye chalega)
            this.config = {
                "presets": [
    "images/preset1.jpg",
    "images/preset2.jpg",
    "images/preset3.jpg",
    "images/preset4.jpg",
    "images/preset5.jpg"
]
                ratings: {
                    "3": { "stars5": 25, "stars4": 40, "stars3": 60 },
                    "4": { "stars5": 80, "stars4": 120, "stars3": 180 },
                    "5": { "stars5": 150, "stars4": 250, "stars3": 400 },
                    "7": { "stars5": 400, "stars4": 650, "stars3": 900 }
                }
            };
        }

        // Step 3: Initialize Components
        this.engine = new Engine(document.getElementById('board-viewport'));
        this.setupListeners();
        this.updatePreview();

        // Step 4: Finalize
        this.updateProgress(100, "READY");

        setTimeout(() => {
            UI.nav('home');
        }, 600);
    },

    updateProgress(percent, msg) {
        const bar = document.getElementById('loading-bar');
        const status = document.getElementById('loader-status');
        if(bar) bar.style.width = percent + "%";
        if(status) status.textContent = msg;
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
        window.oncontextmenu = (e) => e.preventDefault();
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
    },

    resetGame() {
        this.launchGame();
    }
};

window.onload = () => Core.init();
