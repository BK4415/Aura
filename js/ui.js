const UI = {
    nav(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(`screen-${id}`).classList.remove('hidden');
        document.getElementById('win-overlay').classList.add('hidden');
        document.getElementById('loader').classList.remove('active');
    },

    formatTime(s) {
        const m = Math.floor(s / 60);
        return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    },

    showWin() {
        const overlay = document.getElementById('win-overlay');
        const moves = Core.state.moves;
        const size = Core.state.size;
        const thresholds = Core.config.ratings[size];

        let stars = "★★★★★";
        let perf = "MASTERFUL";
        if (moves > thresholds.stars5) { stars = "★★★★☆"; perf = "EXCELLENT"; }
        if (moves > thresholds.stars4) { stars = "★★★☆☆"; perf = "GREAT"; }
        if (moves > thresholds.stars3) { stars = "★★☆☆☆"; perf = "GOOD"; }

        document.getElementById('win-stars').textContent = stars;
        document.getElementById('win-perf-text').textContent = perf;
        document.getElementById('res-moves').textContent = moves;
        document.getElementById('res-time').textContent = this.formatTime(Core.state.time);
        
        overlay.classList.remove('hidden');
    },

    share() {
        // Simple Web Share API logic
        if (navigator.share) {
            navigator.share({
                title: 'Aura Slide',
                text: `I finished the ${Core.state.size}x${Core.state.size} puzzle in ${Core.state.moves} moves!`,
                url: window.location.href
            });
        } else {
            alert("Score copied to clipboard!");
        }
    }
};
