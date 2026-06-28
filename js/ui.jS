const UI = {
    // Page Navigation
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
            p.style.pointerEvents = 'none';
        });
        const target = document.getElementById(`${pageId}-screen`) || document.getElementById(`${pageId}-page`);
        target.classList.remove('hidden');
        target.style.pointerEvents = 'auto';
        
        // Special case for loading screen removal
        if(pageId === 'home') {
             document.body.classList.remove('loading-active');
        }
    },

    showHome() {
        this.showPage('home');
        document.getElementById('win-popup').classList.add('hidden');
    },

    // HUD Updates
    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Win Logic & Performance
    showWinPopup(moves, time, size) {
        const popup = document.getElementById('win-popup');
        const winMoves = document.getElementById('win-moves');
        const winTime = document.getElementById('win-time');
        const starContainer = document.getElementById('star-rating');
        const perfLabel = document.getElementById('performance-label');

        winMoves.textContent = moves;
        winTime.textContent = document.getElementById('timer').textContent;

        // Calculate Stars based on JSON thresholds
        const thresholds = App.state.config.ratings[size];
        let stars = 1;
        if (moves <= thresholds["5"]) stars = 5;
        else if (moves <= thresholds["4"]) stars = 4;
        else if (moves <= thresholds["3"]) stars = 3;
        else stars = 2;

        starContainer.innerHTML = '★'.repeat(stars) + '☆'.repeat(5 - stars);
        
        const labels = ["STILL LEARNING", "GOOD", "GREAT", "EXCELLENT", "MASTERFUL"];
        perfLabel.textContent = labels[stars - 1];

        // Check Record
        const isRecord = Storage.saveStats(size, moves, time);
        document.getElementById('new-record-badge').classList.toggle('hidden', !isRecord);

        popup.classList.remove('hidden');
        this.generateSnapshot();
    },

    // Capture the board state for the share card
    generateSnapshot() {
        const board = document.getElementById('game-board-container');
        const snapshot = document.getElementById('solved-snapshot');
        snapshot.innerHTML = '';
        
        // Create a mini version of the board for the popup
        const clone = board.cloneNode(true);
        clone.id = "mini-board";
        clone.style.transform = "scale(0.3)";
        clone.style.pointerEvents = "none";
        snapshot.appendChild(clone);
    }
};
