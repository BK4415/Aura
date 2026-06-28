const Core = {
    config: null,
    state: { size: 4, mode: 'numbers', preset: 0, moves: 0, time: 0, timer: null },
    engine: null,

    async init() {
        const bar = document.getElementById('progress-bar');
        const status = document.getElementById('loader-status');

        try {
            // Step 1: Load Config
            bar.style.width = "30%";
            status.textContent = "LOADING CONFIG...";
            const res = await fetch('json/config.json');
            if (!res.ok) throw new Error("Config not found");
            this.config = await res.json();

            // Step 2: Initialize Engine
            bar.style.width = "60%";
            status.textContent = "MOUNTING ENGINE...";
            this.engine = new Engine(document.getElementById('board-viewport'));
            
            // Step 3: Setup UI
            bar.style.width = "90%";
            status.textContent = "READY";
            this.setupListeners();
            this.updatePreview();

            // Final Step: Hide Loader
            setTimeout(() => this.hideLoader(), 800);

        } catch (error) {
            console.error("Initialization failed:", error);
            status.textContent = "STARTING IN EMERGENCY MODE...";
            // Emergency fallback if JSON fails
            this.config = { 
                presets: ["images/preset1.jpg"], 
                ratings: { "4": { "stars5": 80, "stars4": 120, "stars3": 180 } } 
            };
            this.engine = new Engine(document.getElementById('board-viewport'));
            this.setupListeners();
            setTimeout(() => this.hideLoader(), 1500);
        }
    },

    hideLoader() {
        const loader = document.getElementById('loader');
        loader.classList.add('fade-out');
        document.body.classList.remove('loading-state');
        UI.nav('home');
    },

    // ... rest of your Core functions (changePreset, updatePreview, etc.)
};

window.onload = () => Core.init();
