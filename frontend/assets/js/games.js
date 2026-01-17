// Games Controller
class GamesController {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentGame = null;
        this.gameStats = {};
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.canvas = null;
        this.ctx = null;
        this.gameLoop = null;
        this.gameTime = 0;
        this.gameScore = 0;
        this.gameLevel = 1;
        this.init();
    }

    async init() {
        await this.loadGames();
        await this.loadGameStats();
        this.renderFeaturedGames();
        this.renderAllGames();
        this.updateStats();
        this.setupCanvas();
        this.setupEventListeners();
    }

    async loadGames() {
        try {
            const response = await fetch('assets/data/games.json');
            const data = await response.json();
            this.games = data.games;
            this.filteredGames = [...this.games];
        } catch (error) {
            console.error('Error loading games:', error);
            this.loadFallbackGames();
        }
    }

    loadFallbackGames() {
        this.games = [
            {
                id: 1,
                name: "Breathing Bubble",
                type: "breathing",
                duration: "2-5 minutes",
                difficulty: "Beginner",
                description: "Control a bubble's size with your breath rhythm.",
                mechanics: "Click to inhale (bubble grows), release to exhale (bubble shrinks). Try to achieve 10 calm breath cycles.",
                benefits: ["Regulates breathing", "Reduces anxiety", "Improves focus"],
                icon: "bi-droplet"
            }
        ];
        this.filteredGames = [...this.games];
    }

    async loadGameStats() {
        try {
            const saved = localStorage.getItem('mindcare_game_stats');
            if (saved) {
                this.gameStats = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading game stats:', error);
            this.gameStats = {};
        }
    }

    saveGameStats() {
        localStorage.setItem('mindcare_game_stats', JSON.stringify(this.gameStats));
    }

    renderFeaturedGames() {
        const container = document.getElementById('featuredGames');
        if (!container) return;

        const featuredGames = this.games.slice(0, 3);
        
        container.innerHTML = featuredGames.map(game => `
            <div class="featured-game-card" onclick="games.showGameDetails(${game.id})">
                <div class="featured-game-banner">
                    <i class="bi ${game.icon || 'bi-controller'}"></i>
                    <span class="featured-game-badge">Featured</span>
                </div>
                <div class="featured-game-content">
                    <h4>${game.name}</h4>
                    <p>${game.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="game-meta">
                            <span class="badge bg-primary">${game.type}</span>
                            <span class="badge bg-secondary">${game.duration}</span>
                        </div>
                        <span class="text-success">
                            <i class="bi bi-play-circle"></i> Play Now
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAllGames() {
        const container = document.getElementById('gamesGrid');
        if (!container) return;

        container.innerHTML = this.filteredGames.map(game => {
            const stats = this.gameStats[game.id] || { plays: 0, highScore: 0 };
            const difficultyClass = `difficulty-${game.difficulty.toLowerCase()}`;
            
            return `
                <div class="game-card ${difficultyClass}" onclick="games.showGameDetails(${game.id})">
                    <div class="game-icon">
                        <i class="bi ${game.icon || 'bi-controller'}"></i>
                    </div>
                    <h5>${game.name}</h5>
                    <p>${game.description}</p>
                    <div class="game-meta">
                        <span class="badge bg-primary">${game.type}</span>
                        <span class="badge bg-secondary">${game.duration}</span>
                        <span class="badge bg-info">${game.difficulty}</span>
                    </div>
                    <div class="game-stats">
                        <span><i class="bi bi-play-circle"></i> ${stats.plays || 0} plays</span>
                        <span><i class="bi bi-trophy"></i> High: ${stats.highScore || 0}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    showGameDetails(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        this.currentGame = game;
        const stats = this.gameStats[game.id] || { plays: 0, highScore: 0, lastPlayed: null };

        // Update modal content
        document.getElementById('modalGameName').textContent = game.name;
        document.getElementById('modalGameType').textContent = game.type;
        document.getElementById('modalGameDuration').textContent = game.duration;
        document.getElementById('modalGameDifficulty').textContent = game.difficulty;
        document.getElementById('modalGameDescription').textContent = game.description;
        document.getElementById('modalGameMechanics').textContent = game.mechanics;
        
        // Update benefits
        const benefitsContainer = document.getElementById('modalGameBenefits');
        benefitsContainer.innerHTML = game.benefits.map(benefit => `
            <div class="benefit-item-modal">
                <i class="bi bi-check-circle-fill"></i>
                <h6>${benefit}</h6>
                <p>Regular play improves this area</p>
            </div>
        `).join('');
        
        // Update stats
        document.getElementById('modalHighScore').textContent = stats.highScore || 0;
        document.getElementById('modalTimesPlayed').textContent = stats.plays || 0;
        document.getElementById('modalLastPlayed').textContent = stats.lastPlayed ? 
            new Date(stats.lastPlayed).toLocaleDateString() : 'Never';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('gameModal'));
        modal.show();
    }

    startGameFromModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('gameModal'));
        modal.hide();
        this.startGame(this.currentGame.id);
    }

    startGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        this.currentGame = game;
        this.gameState = 'playing';
        this.gameTime = 0;
        this.gameScore = 0;
        this.gameLevel = 1;

        // Show game canvas section
        document.getElementById('gameCanvasSection').style.display = 'block';
        document.querySelector('html').style.scrollBehavior = 'auto';
        document.getElementById('gameCanvasSection').scrollIntoView({ behavior: 'smooth' });
        document.querySelector('html').style.scrollBehavior = 'smooth';

        // Update game info
        document.getElementById('currentGameName').textContent = game.name;
        document.getElementById('gameType').textContent = game.type;
        document.getElementById('instructionsText').textContent = game.mechanics;

        // Update benefits
        const benefitsList = document.getElementById('gameBenefits');
        benefitsList.innerHTML = game.benefits.map(benefit => `
            <li><i class="bi bi-check-circle"></i> ${benefit}</li>
        `).join('');

        // Update stats
        const stats = this.gameStats[game.id] || { plays: 0, highScore: 0, bestTime: 0 };
        document.getElementById('highScore').textContent = stats.highScore || 0;
        document.getElementById('timesPlayed').textContent = stats.plays || 0;
        document.getElementById('bestTime').textContent = stats.bestTime ? `${stats.bestTime}s` : '0s';

        // Show instructions
        document.getElementById('gameInstructions').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';

        // Initialize game based on type
        this.initGameCanvas();
    }

    initGameCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) return;

        // Set canvas size
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 400;

        // Start game loop based on game type
        switch(this.currentGame.type) {
            case 'breathing':
                this.startBreathingGame();
                break;
            case 'focus':
                this.startFocusGame();
                break;
            case 'mindfulness':
                this.startMindfulnessGame();
                break;
            default:
                this.startGenericGame();
        }
    }

    startBreathingGame() {
        let bubbleSize = 50;
        let isInhaling = false;
        let breathCycle = 0;
        const targetCycles = 5;

        const drawBubble = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw bubble
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, bubbleSize, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
            this.ctx.fill();
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Draw instructions
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click and hold to inhale, release to exhale', this.canvas.width/2, 50);
            this.ctx.fillText(`Breath Cycles: ${breathCycle}/${targetCycles}`, this.canvas.width/2, 80);
            
            // Draw inhale/exhale text
            this.ctx.font = '20px Inter';
            this.ctx.fillStyle = isInhaling ? '#10b981' : '#0ea5e9';
            this.ctx.fillText(isInhaling ? 'INHALE' : 'EXHALE', this.canvas.width/2, this.canvas.height - 50);
        };

        // Mouse/touch events
        this.canvas.onmousedown = this.canvas.ontouchstart = () => {
            if (this.gameState !== 'playing') return;
            isInhaling = true;
            this.gameScore += 10;
            this.updateGameDisplay();
        };

        this.canvas.onmouseup = this.canvas.ontouchend = () => {
            if (this.gameState !== 'playing') return;
            isInhaling = false;
            breathCycle++;
            this.gameScore += 20;
            this.updateGameDisplay();
            
            if (breathCycle >= targetCycles) {
                this.gameComplete();
            }
        };

        // Animation loop
        const animate = () => {
            if (this.gameState === 'playing') {
                if (isInhaling) {
                    bubbleSize = Math.min(bubbleSize + 1, 100);
                } else {
                    bubbleSize = Math.max(bubbleSize - 1, 50);
                }
                drawBubble();
                requestAnimationFrame(animate);
            }
        };

        // Hide instructions and start
        this.hideInstructions();
        animate();
    }

    startFocusGame() {
        let circles = [];
        let targets = [];
        let speed = 2;
        
        // Create initial circles
        for (let i = 0; i < 5; i++) {
            circles.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                radius: 20,
                color: '#10b981'
            });
        }
        
        // Create targets
        for (let i = 0; i < 3; i++) {
            targets.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: Math.random() * (this.canvas.height - 30) + 15,
                radius: 15,
                color: '#ef4444'
            });
        }

        const draw = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw targets
            targets.forEach(target => {
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = target.color;
                this.ctx.fill();
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            });
            
            // Draw circles
            circles.forEach(circle => {
                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = circle.color;
                this.ctx.fill();
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Move towards nearest target
                let nearestTarget = null;
                let minDist = Infinity;
                
                targets.forEach(target => {
                    const dx = target.x - circle.x;
                    const dy = target.y - circle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearestTarget = target;
                    }
                });
                
                if (nearestTarget) {
                    const dx = nearestTarget.x - circle.x;
                    const dy = nearestTarget.y - circle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 5) {
                        circle.x += (dx / dist) * speed;
                        circle.y += (dy / dist) * speed;
                    }
                }
            });
            
            // Draw score and time
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Inter';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.gameScore}`, 20, 30);
            this.ctx.fillText(`Time: ${this.gameTime}s`, 20, 60);
            this.ctx.fillText(`Level: ${this.gameLevel}`, 20, 90);
        };

        // Click to add points
        this.canvas.onclick = (e) => {
            if (this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is near any target
            targets.forEach((target, index) => {
                const dx = x - target.x;
                const dy = y - target.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < target.radius) {
                    this.gameScore += 100;
                    targets.splice(index, 1);
                    
                    // Add new target
                    if (targets.length < 3) {
                        targets.push({
                            x: Math.random() * (this.canvas.width - 30) + 15,
                            y: Math.random() * (this.canvas.height - 30) + 15,
                            radius: 15,
                            color: '#ef4444'
                        });
                    }
                    
                    // Increase speed occasionally
                    if (this.gameScore % 500 === 0) {
                        speed += 0.5;
                        this.gameLevel++;
                    }
                    
                    this.updateGameDisplay();
                }
            });
        };

        // Game timer
        const gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.gameTime++;
                this.updateGameDisplay();
                
                if (this.gameTime >= 60) { // 1 minute game
                    clearInterval(gameTimer);
                    this.gameComplete();
                }
            } else {
                clearInterval(gameTimer);
            }
        }, 1000);

        // Animation loop
        const animate = () => {
            if (this.gameState === 'playing') {
                draw();
                requestAnimationFrame(animate);
            }
        };

        this.hideInstructions();
        animate();
    }

    startMindfulnessGame() {
        let particles = [];
        let isDragging = false;
        let dragX = 0;
        let dragY = 0;
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)` // Blue-green colors
            });
        }

        const draw = () => {
            // Clear with fade effect
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw particles
            particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Bounce off walls
                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
                
                // Apply mouse/touch force
                if (isDragging) {
                    const dx = particle.x - dragX;
                    const dy = particle.y - dragY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        const force = 50 / dist;
                        particle.vx += (dx / dist) * force * 0.1;
                        particle.vy += (dy / dist) * force * 0.1;
                    }
                }
                
                // Slow down gradually
                particle.vx *= 0.99;
                particle.vy *= 0.99;
            });
            
            // Draw calmness meter
            const calmness = Math.min(this.gameTime / 60, 1);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(20, this.canvas.height - 40, 200, 20);
            this.ctx.fillStyle = `hsl(${120 * calmness}, 70%, 50%)`;
            this.ctx.fillRect(20, this.canvas.height - 40, 200 * calmness, 20);
            
            // Draw text
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Inter';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Calmness Meter', 20, this.canvas.height - 50);
            this.ctx.fillText('Drag to create gentle waves', 20, 30);
            this.ctx.fillText(`Time: ${this.gameTime}s`, this.canvas.width - 100, 30);
        };

        // Mouse/touch events
        this.canvas.onmousedown = this.canvas.ontouchstart = (e) => {
            isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;
            dragX = x - rect.left;
            dragY = y - rect.top;
            this.gameScore += 5;
            this.updateGameDisplay();
        };

        this.canvas.onmousemove = this.canvas.ontouchmove = (e) => {
            if (!isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX || e.touches[0].clientX;
            const y = e.clientY || e.touches[0].clientY;
            dragX = x - rect.left;
            dragY = y - rect.top;
        };

        this.canvas.onmouseup = this.canvas.onmouseleave = this.canvas.ontouchend = () => {
            isDragging = false;
        };

        // Game timer
        const gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.gameTime++;
                this.updateGameDisplay();
                
                if (this.gameTime >= 120) { // 2 minutes
                    clearInterval(gameTimer);
                    this.gameComplete();
                }
            } else {
                clearInterval(gameTimer);
            }
        }, 1000);

        // Animation loop
        const animate = () => {
            if (this.gameState === 'playing') {
                draw();
                requestAnimationFrame(animate);
            }
        };

        this.hideInstructions();
        animate();
    }

    startGenericGame() {
        // Simple catch game for other game types
        let player = { x: this.canvas.width/2, y: this.canvas.height - 50, width: 60, height: 20 };
        let fallingItems = [];
        let lastDrop = 0;

        const draw = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw player
            this.ctx.fillStyle = '#10b981';
            this.ctx.fillRect(player.x - player.width/2, player.y, player.width, player.height);
            
            // Draw falling items
            fallingItems.forEach((item, index) => {
                this.ctx.beginPath();
                this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = item.color;
                this.ctx.fill();
                
                // Update position
                item.y += item.speed;
                
                // Check collision with player
                if (item.y + item.radius > player.y && 
                    item.y - item.radius < player.y + player.height &&
                    item.x > player.x - player.width/2 && 
                    item.x < player.x + player.width/2) {
                    
                    this.gameScore += item.points;
                    fallingItems.splice(index, 1);
                    this.updateGameDisplay();
                }
                
                // Remove if off screen
                if (item.y > this.canvas.height + 20) {
                    fallingItems.splice(index, 1);
                }
            });
            
            // Draw score and time
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Inter';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.gameScore}`, 20, 30);
            this.ctx.fillText(`Time: ${this.gameTime}s`, 20, 60);
        };

        // Mouse movement
        this.canvas.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            player.x = e.clientX - rect.left;
            
            // Keep within bounds
            if (player.x < player.width/2) player.x = player.width/2;
            if (player.x > this.canvas.width - player.width/2) player.x = this.canvas.width - player.width/2;
        };

        // Touch movement
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            player.x = touch.clientX - rect.left;
            
            // Keep within bounds
            if (player.x < player.width/2) player.x = player.width/2;
            if (player.x > this.canvas.width - player.width/2) player.x = this.canvas.width - player.width/2;
        };

        // Game timer and item dropping
        const gameLoop = setInterval(() => {
            if (this.gameState === 'playing') {
                this.gameTime++;
                
                // Drop new items
                if (this.gameTime - lastDrop > 1) { // Every second
                    fallingItems.push({
                        x: Math.random() * (this.canvas.width - 40) + 20,
                        y: -20,
                        radius: 10 + Math.random() * 10,
                        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                        speed: 2 + Math.random() * 3,
                        points: 10
                    });
                    lastDrop = this.gameTime;
                }
                
                // Increase difficulty
                if (this.gameTime % 30 === 0) {
                    this.gameLevel++;
                    // Items fall faster
                    fallingItems.forEach(item => item.speed *= 1.1);
                }
                
                this.updateGameDisplay();
                
                if (this.gameTime >= 120) { // 2 minutes
                    clearInterval(gameLoop);
                    this.gameComplete();
                }
                
                draw();
            } else {
                clearInterval(gameLoop);
            }
        }, 1000/60); // 60 FPS

        this.hideInstructions();
    }

    hideInstructions() {
        document.getElementById('gameInstructions').style.display = 'none';
    }

    updateGameDisplay() {
        document.getElementById('gameTime').textContent = `Time: ${this.gameTime}s`;
        document.getElementById('gameScore').textContent = `Score: ${this.gameScore}`;
    }

    gameComplete() {
        this.gameState = 'gameover';
        
        // Update stats
        const gameId = this.currentGame.id;
        if (!this.gameStats[gameId]) {
            this.gameStats[gameId] = { plays: 0, highScore: 0, bestTime: 0 };
        }
        
        this.gameStats[gameId].plays++;
        this.gameStats[gameId].lastPlayed = new Date().toISOString();
        
        if (this.gameScore > (this.gameStats[gameId].highScore || 0)) {
            this.gameStats[gameId].highScore = this.gameScore;
        }
        
        if (this.gameTime > (this.gameStats[gameId].bestTime || 0)) {
            this.gameStats[gameId].bestTime = this.gameTime;
        }
        
        this.saveGameStats();
        this.updateStats();
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.gameScore;
        document.getElementById('finalTime').textContent = `${this.gameTime}s`;
        document.getElementById('finalLevel').textContent = this.gameLevel;
        
        // Provide feedback
        const feedback = document.getElementById('gameFeedback');
        let message = '';
        
        if (this.gameScore >= 1000) {
            message = 'Excellent! You achieved great focus and calmness.';
        } else if (this.gameScore >= 500) {
            message = 'Great job! You showed good concentration skills.';
        } else {
            message = 'Good start! Regular practice will improve your focus.';
        }
        
        feedback.innerHTML = `<p>${message}</p>`;
        
        document.getElementById('gameOver').style.display = 'flex';
    }

    exitGame() {
        this.gameState = 'menu';
        document.getElementById('gameCanvasSection').style.display = 'none';
        this.renderAllGames();
        this.updateStats();
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').innerHTML = '<i class="bi bi-play"></i>';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').innerHTML = '<i class="bi bi-pause"></i>';
        }
    }

    restartGame() {
        if (this.currentGame) {
            this.startGame(this.currentGame.id);
        }
    }

    filterGames(type) {
        if (type === 'all') {
            this.filteredGames = [...this.games];
        } else if (type === 'quick') {
            this.filteredGames = this.games.filter(game => {
                const durationMatch = game.duration.match(/(\d+)/);
                return durationMatch && parseInt(durationMatch[1]) <= 3;
            });
        } else {
            this.filteredGames = this.games.filter(game => game.type === type);
        }
        
        this.renderAllGames();
    }

    sortGames(criteria) {
        switch(criteria) {
            case 'difficulty':
                const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
                this.filteredGames.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
                break;
            case 'duration':
                this.filteredGames.sort((a, b) => {
                    const aTime = parseInt(a.duration.match(/(\d+)/)?.[0] || 0);
                    const bTime = parseInt(b.duration.match(/(\d+)/)?.[0] || 0);
                    return aTime - bTime;
                });
                break;
            case 'popularity':
                this.filteredGames.sort((a, b) => {
                    const aPlays = this.gameStats[a.id]?.plays || 0;
                    const bPlays = this.gameStats[b.id]?.plays || 0;
                    return bPlays - aPlays;
                });
                break;
        }
        
        this.renderAllGames();
    }

    startRandomGame() {
        const availableGames = this.games.filter(game => {
            const stats = this.gameStats[game.id];
            return !stats || stats.plays < 5; // Prefer less played games
        });
        
        const gamesToChoose = availableGames.length > 0 ? availableGames : this.games;
        const randomGame = gamesToChoose[Math.floor(Math.random() * gamesToChoose.length)];
        
        this.showGameDetails(randomGame.id);
    }

    startQuickFocus() {
        // Find a quick focus game
        const quickFocusGame = this.games.find(game => 
            game.type === 'focus' && game.duration.includes('2') || game.duration.includes('3')
        ) || this.games[0];
        
        this.showGameDetails(quickFocusGame.id);
    }

    addToFavorites() {
        if (!this.currentGame) return;
        
        let favorites = JSON.parse(localStorage.getItem('mindcare_game_favorites') || '[]');
        if (!favorites.includes(this.currentGame.id)) {
            favorites.push(this.currentGame.id);
            localStorage.setItem('mindcare_game_favorites', JSON.stringify(favorites));
            this.showNotification('Added to favorites!', 'success');
        } else {
            this.showNotification('Already in favorites', 'info');
        }
    }

    updateStats() {
        let totalPlays = 0;
        let totalScore = 0;
        let totalTime = 0;
        
        Object.values(this.gameStats).forEach(stats => {
            totalPlays += stats.plays || 0;
            totalScore += stats.highScore || 0;
            totalTime += stats.bestTime || 0;
        });
        
        document.getElementById('gamesPlayed').textContent = totalPlays;
        document.getElementById('totalScore').textContent = totalScore;
        document.getElementById('focusTime').textContent = `${Math.floor(totalTime/60)}m`;
        
        // Calculate mastery (percentage of games played at least once)
        const gamesPlayed = Object.keys(this.gameStats).length;
        const mastery = Math.round((gamesPlayed / this.games.length) * 100);
        document.getElementById('gamesProgress').style.width = `${mastery}%`;
        document.getElementById('masteryText').textContent = `${mastery}%`;
    }

    setupEventListeners() {
        // Setup sound toggles
        const soundToggle = document.getElementById('soundToggle');
        const musicToggle = document.getElementById('musicToggle');
        const vibrationToggle = document.getElementById('vibrationToggle');
        
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                localStorage.setItem('gameSound', e.target.checked);
            });
        }
        
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                localStorage.setItem('gameMusic', e.target.checked);
            });
        }
        
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                localStorage.setItem('gameVibration', e.target.checked);
            });
        }
        
        // Load saved settings
        if (soundToggle) soundToggle.checked = localStorage.getItem('gameSound') !== 'false';
        if (musicToggle) musicToggle.checked = localStorage.getItem('gameMusic') !== 'false';
        if (vibrationToggle) vibrationToggle.checked = localStorage.getItem('gameVibration') === 'true';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupCanvas() {
        // Canvas is setup when game starts
    }
}

// Initialize games controller
const games = new GamesController();
window.games = games;