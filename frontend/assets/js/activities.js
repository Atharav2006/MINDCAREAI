// activities.js - Activities Page Functionality

const activities = {
    // Sample activities data
    activities: [
        {
            id: 1,
            name: "4-7-8 Breathing",
            category: "breathing",
            type: "Breathing",
            duration: 5,
            difficulty: "Beginner",
            description: "A calming breathing exercise that helps reduce anxiety and promote relaxation.",
            steps: [
                "Sit in a comfortable position",
                "Exhale completely through your mouth",
                "Inhale quietly through your nose for 4 seconds",
                "Hold your breath for 7 seconds",
                "Exhale completely through your mouth for 8 seconds",
                "Repeat this cycle 4 times"
            ],
            benefits: ["Reduces anxiety", "Improves sleep", "Calms nervous system"],
            completed: false,
            rating: 4.5,
            timesCompleted: 0
        },
        {
            id: 2,
            name: "Body Scan Meditation",
            category: "mindfulness",
            type: "Mindfulness",
            duration: 10,
            difficulty: "Beginner",
            description: "A mindfulness practice that increases body awareness and reduces stress.",
            steps: [
                "Lie down in a comfortable position",
                "Bring attention to your breath",
                "Slowly scan your body from head to toe",
                "Notice any sensations without judgment",
                "Release tension in each body part",
                "Return to normal breathing"
            ],
            benefits: ["Reduces stress", "Increases body awareness", "Promotes relaxation"],
            completed: false,
            rating: 4.8,
            timesCompleted: 0
        },
        {
            id: 3,
            name: "Exam Stress Relief",
            category: "academic",
            type: "Academic",
            duration: 7,
            difficulty: "Intermediate",
            description: "Techniques to manage exam anxiety and improve focus during study sessions.",
            steps: [
                "Take 3 deep breaths before starting",
                "Break study sessions into 25-minute blocks",
                "Use positive self-talk",
                "Practice grounding techniques",
                "Visualize successful completion",
                "Take regular breaks"
            ],
            benefits: ["Reduces exam anxiety", "Improves focus", "Boosts confidence"],
            completed: false,
            rating: 4.3,
            timesCompleted: 0
        },
        {
            id: 4,
            name: "Progressive Muscle Relaxation",
            category: "relaxation",
            type: "Relaxation",
            duration: 15,
            difficulty: "Beginner",
            description: "Systematically tense and relax muscle groups to release physical tension.",
            steps: [
                "Start with your feet and work upward",
                "Tense each muscle group for 5 seconds",
                "Release and notice the relaxation",
                "Move to the next muscle group",
                "Continue until you reach your face",
                "Enjoy the feeling of deep relaxation"
            ],
            benefits: ["Reduces muscle tension", "Promotes sleep", "Relieves stress"],
            completed: false,
            rating: 4.6,
            timesCompleted: 0
        },
        {
            id: 5,
            name: "Mindful Journaling",
            category: "mindfulness",
            type: "Reflection",
            duration: 10,
            difficulty: "Beginner",
            description: "Write down thoughts and feelings to gain clarity and emotional awareness.",
            steps: [
                "Find a quiet space with no distractions",
                "Set a timer for 10 minutes",
                "Write without judgment or editing",
                "Express thoughts and feelings openly",
                "Reflect on what you've written",
                "Notice any patterns or insights"
            ],
            benefits: ["Increases self-awareness", "Reduces stress", "Improves mood"],
            completed: false,
            rating: 4.4,
            timesCompleted: 0
        }
    ],

    // Categories data
    categories: [
        {
            id: "breathing",
            name: "Breathing",
            icon: "bi-wind",
            description: "Calm your nervous system",
            count: 8
        },
        {
            id: "mindfulness",
            name: "Mindfulness",
            icon: "bi-sun",
            description: "Stay present and aware",
            count: 12
        },
        {
            id: "academic",
            name: "Academic",
            icon: "bi-mortarboard",
            description: "Study stress relief",
            count: 6
        },
        {
            id: "relaxation",
            name: "Relaxation",
            icon: "bi-moon",
            description: "Release tension",
            count: 10
        },
        {
            id: "quick",
            name: "Quick",
            icon: "bi-lightning",
            description: "Under 5 minutes",
            count: 15
        },
        {
            id: "sleep",
            name: "Sleep",
            icon: "bi-moon-stars",
            description: "Better sleep quality",
            count: 7
        }
    ],

    // User progress data
    progress: {
        completedActivities: 0,
        totalTime: 0,
        streakDays: 0,
        progressPercentage: 0
    },

    // Timer variables
    timer: {
        minutes: 5,
        seconds: 0,
        isRunning: false,
        interval: null,
        circleOffset: 0,
        totalSeconds: 300
    },

    // Initialize the page
    init: function() {
        this.loadCategories();
        this.loadActivities();
        this.loadProgress();
        this.setupEventListeners();
    },

    // Load categories
    loadCategories: function() {
        const container = document.getElementById('activityCategories');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card card-hover';
            card.innerHTML = `
                <div class="category-icon">
                    <i class="bi ${category.icon}"></i>
                </div>
                <h3 class="category-title">${category.name}</h3>
                <p class="text-muted">${category.description}</p>
                <span class="category-count">${category.count} activities</span>
            `;
            card.onclick = () => this.filterActivities(category.id);
            container.appendChild(card);
        });
    },

    // Load activities
    loadActivities: function() {
        const container = document.getElementById('activitiesGrid');
        container.innerHTML = '';

        this.activities.forEach(activity => {
            const card = this.createActivityCard(activity);
            container.appendChild(card);
        });
    },

    // Create activity card element
    createActivityCard: function(activity) {
        const card = document.createElement('div');
        card.className = 'activity-card card-hover';
        card.innerHTML = `
            <div class="activity-image"></div>
            <div class="activity-content">
                <h3 class="activity-title">${activity.name}</h3>
                <p class="activity-description">${activity.description}</p>
                <div class="activity-meta">
                    <span class="activity-badge badge-duration">
                        <i class="bi bi-clock me-1"></i>${activity.duration} min
                    </span>
                    <span class="activity-badge badge-type">${activity.type}</span>
                    <span class="activity-badge badge-difficulty">${activity.difficulty}</span>
                </div>
                <div class="activity-actions">
                    <button class="btn btn-start" onclick="activities.startActivity(${activity.id})">
                        <i class="bi bi-play-fill me-1"></i> Start
                    </button>
                    <button class="btn btn-info" onclick="activities.showActivityDetails(${activity.id})">
                        <i class="bi bi-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    },

    // Load user progress
    loadProgress: function() {
        // Load from localStorage or use defaults
        const savedProgress = localStorage.getItem('activityProgress');
        if (savedProgress) {
            this.progress = JSON.parse(savedProgress);
        }

        // Update UI
        document.getElementById('completedActivities').textContent = this.progress.completedActivities;
        document.getElementById('totalTime').textContent = `${this.progress.totalTime}m`;
        document.getElementById('streakDays').textContent = this.progress.streakDays;
        document.getElementById('progressBar').style.width = `${this.progress.progressPercentage}%`;
        document.getElementById('progressText').textContent = `${this.progress.progressPercentage}%`;
    },

    // Save progress
    saveProgress: function() {
        localStorage.setItem('activityProgress', JSON.stringify(this.progress));
        this.loadProgress();
    },

    // Start an activity
    startActivity: function(id) {
        const activity = this.activities.find(a => a.id === id);
        if (!activity) return;

        // Update activity stats
        activity.timesCompleted++;
        activity.completed = true;

        // Update progress
        this.progress.completedActivities++;
        this.progress.totalTime += activity.duration;
        this.progress.progressPercentage = Math.min(100, Math.floor((this.progress.completedActivities / this.activities.length) * 100));

        // Update streak (simplified - in reality, check dates)
        this.progress.streakDays = this.progress.streakDays + 1;

        // Save progress
        this.saveProgress();

        // Set timer for this activity
        this.timer.minutes = activity.duration;
        this.timer.seconds = 0;
        this.timer.totalSeconds = activity.duration * 60;
        this.updateTimerDisplay();
        document.getElementById('currentActivityName').textContent = activity.name;

        // Show success message
        this.showNotification(`Started "${activity.name}"`, 'success');
    },

    // Show activity details in modal
    showActivityDetails: function(id) {
        const activity = this.activities.find(a => a.id === id);
        if (!activity) return;

        // Update modal content
        document.getElementById('activityModalTitle').innerHTML = `<i class="bi bi-activity me-2"></i> ${activity.name}`;
        document.getElementById('activityName').textContent = activity.name;
        document.getElementById('activityType').textContent = activity.type;
        document.getElementById('activityDuration').textContent = `${activity.duration} min`;
        document.getElementById('activityDifficulty').textContent = activity.difficulty;
        document.getElementById('activityDescription').textContent = activity.description;

        // Update steps
        const stepsList = document.getElementById('activitySteps');
        stepsList.innerHTML = '';
        activity.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });

        // Update benefits
        const benefitsGrid = document.getElementById('activityBenefits');
        benefitsGrid.innerHTML = '';
        activity.benefits.forEach(benefit => {
            const div = document.createElement('div');
            div.className = 'benefit-item';
            div.innerHTML = `
                <i class="bi bi-check-circle"></i>
                <span>${benefit}</span>
            `;
            benefitsGrid.appendChild(div);
        });

        // Update stats
        document.getElementById('timesCompleted').textContent = activity.timesCompleted;
        document.getElementById('lastCompleted').textContent = activity.completed ? 'Just now' : 'Never';
        document.getElementById('averageRating').innerHTML = `<i class="bi bi-star-fill text-warning"></i> ${activity.rating}`;

        // Set duration slider
        document.getElementById('durationSlider').value = activity.duration;
        document.getElementById('selectedDuration').textContent = `${activity.duration} min`;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('activityModal'));
        modal.show();
    },

    // Start selected activity from modal
    startSelectedActivity: function() {
        const activityName = document.getElementById('activityName').textContent;
        const duration = parseInt(document.getElementById('durationSlider').value);
        
        // Start timer with selected duration
        this.timer.minutes = duration;
        this.timer.seconds = 0;
        this.timer.totalSeconds = duration * 60;
        this.updateTimerDisplay();
        document.getElementById('currentActivityName').textContent = activityName;

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('activityModal')).hide();

        // Show notification
        this.showNotification(`Starting "${activityName}" for ${duration} minutes`, 'info');
    },

    // Start timer
    startTimer: function() {
        if (this.timer.isRunning) return;

        this.timer.isRunning = true;
        this.timer.interval = setInterval(() => this.updateTimer(), 1000);

        // Update UI
        document.getElementById('startTimerBtn').style.display = 'none';
        document.getElementById('pauseTimerBtn').style.display = 'inline-block';
    },

    // Pause timer
    pauseTimer: function() {
        if (!this.timer.isRunning) return;

        this.timer.isRunning = false;
        clearInterval(this.timer.interval);

        // Update UI
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';
    },

    // Reset timer
    resetTimer: function() {
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);

        this.timer.minutes = 5;
        this.timer.seconds = 0;
        this.timer.totalSeconds = 300;
        this.updateTimerDisplay();

        // Update UI
        document.getElementById('startTimerBtn').style.display = 'inline-block';
        document.getElementById('pauseTimerBtn').style.display = 'none';

        // Reset circle
        document.getElementById('timerCircle').style.strokeDashoffset = '0';
    },

    // Update timer every second
    updateTimer: function() {
        if (this.timer.seconds > 0) {
            this.timer.seconds--;
        } else if (this.timer.minutes > 0) {
            this.timer.minutes--;
            this.timer.seconds = 59;
        } else {
            // Timer finished
            this.timerFinished();
            return;
        }

        this.updateTimerDisplay();
    },

    // Update timer display
    updateTimerDisplay: function() {
        document.getElementById('timerMinutes').textContent = 
            this.timer.minutes.toString().padStart(2, '0');

        // Update circle progress
        const totalSeconds = this.timer.minutes * 60 + this.timer.seconds;
        const progress = 1 - (totalSeconds / this.timer.totalSeconds);
        const offset = 565.48 * (1 - progress);
        document.getElementById('timerCircle').style.strokeDashoffset = offset;
    },

    // Timer finished
    timerFinished: function() {
        this.resetTimer();
        this.showNotification('Activity completed! Great job! 🎉', 'success');

        // Play completion sound (optional)
        const audio = new Audio('assets/sounds/completion.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore if audio fails
    },

    // Start random activity
    startRandomActivity: function() {
        const randomIndex = Math.floor(Math.random() * this.activities.length);
        const randomActivity = this.activities[randomIndex];
        
        this.startActivity(randomActivity.id);
        this.showActivityDetails(randomActivity.id);
    },

    // Start breathing exercise
    startBreathing: function() {
        const breathingActivity = this.activities.find(a => a.id === 1);
        if (breathingActivity) {
            this.startActivity(1);
            this.showNotification('Starting 4-7-8 breathing exercise...', 'info');
        }
    },

    // Filter activities by category
    filterActivities: function(category) {
        const container = document.getElementById('activitiesGrid');
        container.innerHTML = '';

        let filteredActivities = this.activities;
        
        if (category !== 'all') {
            if (category === 'quick') {
                filteredActivities = this.activities.filter(a => a.duration <= 5);
            } else {
                filteredActivities = this.activities.filter(a => a.category === category);
            }
        }

        filteredActivities.forEach(activity => {
            const card = this.createActivityCard(activity);
            container.appendChild(card);
        });

        this.showNotification(`Showing ${filteredActivities.length} activities`, 'info');
    },

    // Load more activities (simulate pagination)
    loadMore: function() {
        // In a real app, this would load more from server
        this.showNotification('Loading more activities...', 'info');
        
        // Simulate loading
        setTimeout(() => {
            this.showNotification('No more activities available', 'warning');
        }, 1000);
    },

    // View progress
    viewProgress: function() {
        alert(`Your Progress:\n\nCompleted Activities: ${this.progress.completedActivities}\nTotal Time: ${this.progress.totalTime} minutes\nDay Streak: ${this.progress.streakDays} days\nProgress: ${this.progress.progressPercentage}%`);
    },

    // Reset progress
    resetProgress: function() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.progress = {
                completedActivities: 0,
                totalTime: 0,
                streakDays: 0,
                progressPercentage: 0
            };
            
            // Reset all activities
            this.activities.forEach(activity => {
                activity.completed = false;
                activity.timesCompleted = 0;
            });

            this.saveProgress();
            this.showNotification('Progress reset successfully', 'success');
        }
    },

    // Save activity for later
    saveForLater: function() {
        this.showNotification('Activity saved to your favorites', 'success');
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Duration slider
        const durationSlider = document.getElementById('durationSlider');
        if (durationSlider) {
            durationSlider.addEventListener('input', (e) => {
                document.getElementById('selectedDuration').textContent = `${e.target.value} min`;
            });
        }

        // Timer control buttons
        document.getElementById('startTimerBtn')?.addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimerBtn')?.addEventListener('click', () => this.pauseTimer());

        // Add notification styles
        this.addNotificationStyles();
    },

    // Add notification styles
    addNotificationStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--activity-card-bg);
                border: 1px solid var(--activity-border);
                border-radius: 10px;
                padding: 1rem 1.5rem;
                min-width: 300px;
                max-width: 400px;
                transform: translateX(100%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                z-index: 9999;
                box-shadow: var(--activity-shadow);
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: var(--activity-text-primary);
            }
            
            .notification-success {
                border-left: 4px solid var(--activity-success);
            }
            
            .notification-warning {
                border-left: 4px solid var(--activity-warning);
            }
            
            .notification-info {
                border-left: 4px solid var(--activity-info);
            }
            
            .notification i {
                font-size: 1.25rem;
            }
            
            .notification-success i {
                color: var(--activity-success);
            }
            
            .notification-warning i {
                color: var(--activity-warning);
            }
            
            .notification-info i {
                color: var(--activity-info);
            }
        `;
        document.head.appendChild(style);
    }
};

// Make activities object globally available
window.activities = activities;