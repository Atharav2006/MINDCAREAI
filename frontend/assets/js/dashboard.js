// Dashboard Controller
class DashboardController {
    constructor() {
        this.charts = {};
        this.stats = {};
        this.dateRange = {
            start: moment().subtract(29, 'days'),
            end: moment()
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderStats();
        this.initCharts();
        this.renderInsights();
        this.renderRecentActivity();
        this.renderRecommendations();
        this.renderGoals();
        this.updateTotals();
        this.setupEventListeners();
    }

    async loadData() {
        // Load data from localStorage
        try {
            // Chat data
            const chatHistory = JSON.parse(localStorage.getItem('mindcare_chat_history') || '[]');
            this.stats.chats = chatHistory.length;
            
            // Emotion data
            const emotionHistory = JSON.parse(localStorage.getItem('mindcare_emotion_history') || '[]');
            this.stats.emotions = this.processEmotionData(emotionHistory);
            
            // Activities data
            const activitiesData = JSON.parse(localStorage.getItem('mindcare_activities_data') || '{}');
            this.stats.activities = {
                completed: activitiesData.completed?.length || 0,
                favorites: activitiesData.favorites?.length || 0
            };
            
            // Games data
            const gamesData = JSON.parse(localStorage.getItem('mindcare_game_stats') || '{}');
            this.stats.games = this.processGamesData(gamesData);
            
            // Generate sample data for demo
            this.generateSampleData();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.generateSampleData();
        }
    }

    processEmotionData(emotionHistory) {
        if (!Array.isArray(emotionHistory) || emotionHistory.length === 0) {
            return {
                average: 5,
                trend: 'stable',
                distribution: { calm: 0, stressed: 0, anxious: 0, other: 0 },
                timeline: this.generateEmotionTimeline()
            };
        }

        const last30Days = emotionHistory.filter(e => {
            const date = new Date(e.timestamp || Date.now());
            return date >= this.dateRange.start.toDate() && date <= this.dateRange.end.toDate();
        });

        const average = last30Days.length > 0 ? 
            last30Days.reduce((sum, e) => sum + (e.level || 5), 0) / last30Days.length : 5;

        const distribution = {
            calm: last30Days.filter(e => e.level <= 3).length,
            stressed: last30Days.filter(e => e.level >= 7 && e.level <= 8).length,
            anxious: last30Days.filter(e => e.level >= 9).length,
            other: last30Days.filter(e => e.level > 3 && e.level < 7).length
        };

        // Calculate trend
        const firstHalf = last30Days.slice(0, Math.floor(last30Days.length / 2));
        const secondHalf = last30Days.slice(Math.floor(last30Days.length / 2));
        
        const avgFirst = firstHalf.length > 0 ? 
            firstHalf.reduce((sum, e) => sum + (e.level || 5), 0) / firstHalf.length : 5;
        const avgSecond = secondHalf.length > 0 ? 
            secondHalf.reduce((sum, e) => sum + (e.level || 5), 0) / secondHalf.length : 5;
        
        let trend = 'stable';
        if (avgSecond < avgFirst - 1) trend = 'improving';
        else if (avgSecond > avgFirst + 1) trend = 'worsening';

        return {
            average: Math.round(average * 10) / 10,
            trend,
            distribution,
            timeline: this.generateEmotionTimeline(emotionHistory)
        };
    }

    processGamesData(gamesData) {
        if (!gamesData || Object.keys(gamesData).length === 0) {
            return {
                totalPlays: 0,
                totalScore: 0,
                favoriteGame: 'None',
                performance: this.generateGamePerformance()
            };
        }

        let totalPlays = 0;
        let totalScore = 0;
        let maxPlays = 0;
        let favoriteGame = 'None';

        Object.entries(gamesData).forEach(([gameId, stats]) => {
            totalPlays += stats.plays || 0;
            totalScore += stats.highScore || 0;
            
            if (stats.plays > maxPlays) {
                maxPlays = stats.plays;
                favoriteGame = `Game ${gameId}`;
            }
        });

        return {
            totalPlays,
            totalScore,
            favoriteGame,
            performance: this.generateGamePerformance(gamesData)
        };
    }

    generateSampleData() {
        // Generate sample data for demonstration
        if (!this.stats.emotions) {
            this.stats.emotions = {
                average: 4.2,
                trend: 'improving',
                distribution: { calm: 12, stressed: 5, anxious: 3, other: 10 },
                timeline: this.generateEmotionTimeline()
            };
        }

        if (!this.stats.activities) {
            this.stats.activities = {
                completed: 8,
                favorites: 3
            };
        }

        if (!this.stats.games) {
            this.stats.games = {
                totalPlays: 15,
                totalScore: 2450,
                favoriteGame: 'Breathing Bubble',
                performance: this.generateGamePerformance()
            };
        }

        // Add other sample stats
        this.stats = {
            ...this.stats,
            moodImprovement: '+25%',
            stressReduction: '-18%',
            focusImprovement: '+32%',
            consistencyScore: '78%',
            streakDays: 7
        };
    }

    generateEmotionTimeline(emotionHistory = null) {
        const timeline = [];
        const days = 30;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = moment().subtract(i, 'days');
            
            if (emotionHistory && emotionHistory.length > 0) {
                const dayEmotions = emotionHistory.filter(e => {
                    const eDate = moment(e.timestamp || Date.now());
                    return eDate.isSame(date, 'day');
                });
                
                const avgLevel = dayEmotions.length > 0 ? 
                    dayEmotions.reduce((sum, e) => sum + (e.level || 5), 0) / dayEmotions.length : 
                    Math.random() * 3 + 4;
                    
                timeline.push({
                    date: date.format('MMM D'),
                    level: Math.round(avgLevel * 10) / 10
                });
            } else {
                // Generate realistic emotion data
                const base = 4 + Math.sin(i / 3) * 2;
                const random = (Math.random() - 0.5) * 1.5;
                timeline.push({
                    date: date.format('MMM D'),
                    level: Math.round((base + random) * 10) / 10
                });
            }
        }
        
        return timeline;
    }

    generateGamePerformance(gamesData = null) {
        const games = ['Breathing Bubble', 'Focus Flow', 'Calm Waters', 'Pattern Match'];
        const performance = [];
        
        games.forEach(game => {
            if (gamesData) {
                // Real data logic would go here
                performance.push({
                    game,
                    score: Math.floor(Math.random() * 1000) + 500,
                    plays: Math.floor(Math.random() * 10) + 1
                });
            } else {
                performance.push({
                    game,
                    score: Math.floor(Math.random() * 1000) + 500,
                    plays: Math.floor(Math.random() * 10) + 1
                });
            }
        });
        
        return performance;
    }

    renderStats() {
        const container = document.getElementById('statsOverview');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card stat-card-animated">
                <div class="stat-icon" style="background: var(--primary);">
                    <i class="bi bi-emoji-smile"></i>
                </div>
                <div class="stat-content">
                    <h3>${this.stats.emotions?.average || 5}/10</h3>
                    <h5>Average Mood</h5>
                    <div class="stat-trend">
                        <i class="bi ${this.stats.emotions?.trend === 'improving' ? 'bi-arrow-up-right trend-up' : 
                                       this.stats.emotions?.trend === 'worsening' ? 'bi-arrow-down-right trend-down' : 
                                       'bi-dash trend-neutral'}"></i>
                        <span>${this.stats.emotions?.trend === 'improving' ? 'Improving' : 
                               this.stats.emotions?.trend === 'worsening' ? 'Declining' : 'Stable'}</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card stat-card-animated">
                <div class="stat-icon" style="background: var(--success);">
                    <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>${this.stats.activities?.completed || 0}</h3>
                    <h5>Activities Completed</h5>
                    <div class="stat-trend">
                        <i class="bi bi-arrow-up-right trend-up"></i>
                        <span>+${Math.floor(Math.random() * 5) + 1} this week</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card stat-card-animated">
                <div class="stat-icon" style="background: var(--info);">
                    <i class="bi bi-trophy"></i>
                </div>
                <div class="stat-content">
                    <h3>${this.stats.games?.totalPlays || 0}</h3>
                    <h5>Games Played</h5>
                    <div class="stat-trend">
                        <i class="bi bi-arrow-up-right trend-up"></i>
                        <span>High Score: ${this.stats.games?.totalScore || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="stat-card stat-card-animated">
                <div class="stat-icon" style="background: var(--purple);">
                    <i class="bi bi-lightning"></i>
                </div>
                <div class="stat-content">
                    <h3>${this.stats.streakDays || 0} days</h3>
                    <h5>Current Streak</h5>
                    <div class="stat-trend">
                        <i class="bi bi-fire trend-up"></i>
                        <span>Keep it up!</span>
                    </div>
                </div>
            </div>
        `;
    }

    initCharts() {
        this.initEmotionTimelineChart();
        this.initMoodDistributionChart();
        this.initActivityCompletionChart();
        this.initGamePerformanceChart();
    }

    initEmotionTimelineChart() {
        const ctx = document.getElementById('emotionTimelineChart');
        if (!ctx) return;

        const timeline = this.stats.emotions?.timeline || this.generateEmotionTimeline();
        
        // Destroy existing chart
        if (this.charts.emotionTimeline) {
            this.charts.emotionTimeline.destroy();
        }

        this.charts.emotionTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(d => d.date),
                datasets: [{
                    label: 'Mood Level',
                    data: timeline.map(d => d.level),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Mood: ${context.parsed.y}/10`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 10,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + '/10';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 0
                        }
                    }
                }
            }
        });
    }

    initMoodDistributionChart() {
        const ctx = document.getElementById('moodDistributionChart');
        if (!ctx) return;

        const distribution = this.stats.emotions?.distribution || { calm: 0, stressed: 0, anxious: 0, other: 0 };
        
        if (this.charts.moodDistribution) {
            this.charts.moodDistribution.destroy();
        }

        this.charts.moodDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Calm', 'Stressed', 'Anxious', 'Other'],
                datasets: [{
                    data: [distribution.calm, distribution.stressed, distribution.anxious, distribution.other],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(148, 163, 184, 0.8)'
                    ],
                    borderColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#94a3b8'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    initActivityCompletionChart() {
        const ctx = document.getElementById('activityCompletionChart');
        if (!ctx) return;

        // Sample activity data
        const activities = ['Breathing', 'Mindfulness', 'Relaxation', 'Academic', 'Movement'];
        const completions = activities.map(() => Math.floor(Math.random() * 10) + 1);
        
        if (this.charts.activityCompletion) {
            this.charts.activityCompletion.destroy();
        }

        this.charts.activityCompletion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: activities,
                datasets: [{
                    label: 'Completions',
                    data: completions,
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    borderColor: '#0ea5e9',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 2
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    initGamePerformanceChart() {
        const ctx = document.getElementById('gamePerformanceChart');
        if (!ctx) return;

        const performance = this.stats.games?.performance || this.generateGamePerformance();
        
        if (this.charts.gamePerformance) {
            this.charts.gamePerformance.destroy();
        }

        this.charts.gamePerformance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: performance.map(p => p.game),
                datasets: [{
                    label: 'Performance Score',
                    data: performance.map(p => p.score / 100),
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#cbd5e1',
                            font: {
                                size: 11
                            }
                        },
                        ticks: {
                            display: false,
                            stepSize: 2
                        },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderInsights() {
        const container = document.getElementById('aiInsights');
        if (!container) return;

        const insights = [
            {
                icon: 'bi-arrow-up-right',
                title: 'Mood Improvement Detected',
                text: 'Your average mood has improved by 15% over the last 2 weeks. Keep practicing the breathing exercises!'
            },
            {
                icon: 'bi-clock',
                title: 'Consistent Morning Practice',
                text: 'You\'re most consistent with activities between 8-10 AM. Try scheduling your sessions during this time.'
            },
            {
                icon: 'bi-heart',
                title: 'Stress Reduction Progress',
                text: 'Stress levels have decreased by 22% this month. The mindfulness games seem to be helping.'
            },
            {
                icon: 'bi-lightbulb',
                title: 'Try Something New',
                text: 'Based on your patterns, you might enjoy trying the "Focus Flow" game to improve concentration.'
            }
        ];

        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <h5><i class="bi ${insight.icon}"></i> ${insight.title}</h5>
                <p>${insight.text}</p>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const activities = [
            {
                type: 'chat',
                icon: 'bi-chat-dots',
                color: '#10b981',
                title: 'Chat Session',
                description: 'Discussed exam stress with MindCare AI',
                time: '2 hours ago'
            },
            {
                type: 'activity',
                icon: 'bi-activity',
                color: '#0ea5e9',
                title: 'Activity Completed',
                description: 'Finished "Box Breathing" exercise',
                time: 'Yesterday'
            },
            {
                type: 'game',
                icon: 'bi-controller',
                color: '#8b5cf6',
                title: 'Game Played',
                description: 'Achieved high score in "Breathing Bubble"',
                time: '2 days ago'
            },
            {
                type: 'mood',
                icon: 'bi-emoji-smile',
                color: '#f59e0b',
                title: 'Mood Check-in',
                description: 'Recorded mood as "Calm" (4/10)',
                time: '3 days ago'
            },
            {
                type: 'goal',
                icon: 'bi-flag',
                color: '#ec4899',
                title: 'Goal Progress',
                description: 'Completed weekly activity goal',
                time: '4 days ago'
            }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color};">
                    <i class="bi ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h6>${activity.title}</h6>
                    <p>${activity.description}</p>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    renderRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        const recommendations = [
            {
                icon: 'bi-wind',
                title: 'Morning Breathing Routine',
                text: 'Try 5 minutes of box breathing each morning to start your day calmly.',
                action: 'Start Routine'
            },
            {
                icon: 'bi-journal',
                title: 'Evening Journaling',
                text: 'Reflect on your day with 3 things you\'re grateful for.',
                action: 'Start Journaling'
            },
            {
                icon: 'bi-moon',
                title: 'Sleep Wind-Down',
                text: 'Practice the sleep routine activity 1 hour before bed.',
                action: 'View Activity'
            }
        ];

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <h6><i class="bi ${rec.icon}"></i> ${rec.title}</h6>
                <p>${rec.text}</p>
                <a href="#" class="recommendation-action">
                    ${rec.action} <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        `).join('');
    }

    renderGoals() {
        const container = document.getElementById('goalsList');
        if (!container) return;

        const goals = [
            {
                icon: 'bi-activity',
                title: 'Daily Activities',
                progress: 80,
                target: '5/week',
                due: 'Ends in 3 days'
            },
            {
                icon: 'bi-chat',
                title: 'Chat Sessions',
                progress: 60,
                target: '3/week',
                due: 'Ends in 1 week'
            },
            {
                icon: 'bi-trophy',
                title: 'Game Mastery',
                progress: 40,
                target: 'All games',
                due: 'Ends in 2 weeks'
            }
        ];

        container.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <h6><i class="bi ${goal.icon}"></i> ${goal.title}</h6>
                    <span class="badge bg-primary">${goal.target}</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-text">${goal.progress}%</div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                <div class="goal-due">${goal.due}</div>
            </div>
        `).join('');
    }

    updateTotals() {
        document.getElementById('totalChats').textContent = this.stats.chats || 0;
        document.getElementById('totalActivities').textContent = this.stats.activities?.completed || 0;
        document.getElementById('totalGames').textContent = this.stats.games?.totalPlays || 0;
    }

    updateDateRange(start, end) {
        this.dateRange = { start, end };
        this.refreshData();
    }

    refreshData() {
        this.loadData().then(() => {
            this.renderStats();
            this.refreshCharts();
            this.updateTotals();
            this.showNotification('Dashboard updated successfully', 'success');
        });
    }

    refreshCharts() {
        Object.keys(this.charts).forEach(chartName => {
            if (this.charts[chartName]) {
                this.charts[chartName].destroy();
            }
        });
        this.initCharts();
    }

    exportData() {
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    }

    processExport() {
        const exportChats = document.getElementById('exportChats').checked;
        const exportActivities = document.getElementById('exportActivities').checked;
        const exportGames = document.getElementById('exportGames').checked;
        const exportEmotions = document.getElementById('exportEmotions').checked;
        const format = document.getElementById('exportFormat').value;

        // Collect data
        const data = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                user: 'Anonymous'
            }
        };

        if (exportChats) {
            data.chats = JSON.parse(localStorage.getItem('mindcare_chat_history') || '[]');
        }

        if (exportActivities) {
            data.activities = JSON.parse(localStorage.getItem('mindcare_activities_data') || '{}');
        }

        if (exportGames) {
            data.games = JSON.parse(localStorage.getItem('mindcare_game_stats') || '{}');
        }

        if (exportEmotions) {
            data.emotions = JSON.parse(localStorage.getItem('mindcare_emotion_history') || '[]');
        }

        // Process based on format
        let blob, filename, mimeType;

        if (format === 'json') {
            const jsonString = JSON.stringify(data, null, 2);
            blob = new Blob([jsonString], { type: 'application/json' });
            filename = `mindcare-export-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else if (format === 'csv') {
            // Convert to CSV (simplified)
            const csvData = this.convertToCSV(data);
            blob = new Blob([csvData], { type: 'text/csv' });
            filename = `mindcare-export-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            // PDF - in real implementation, use a PDF library
            this.showNotification('PDF export coming soon!', 'info');
            return;
        }

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);

        const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        modal.hide();

        this.showNotification('Data exported successfully', 'success');
    }

    convertToCSV(data) {
        // Simplified CSV conversion
        const rows = [];
        
        // Add headers
        rows.push(['Type', 'Count', 'Date']);
        
        // Add data
        if (data.chats) {
            rows.push(['Chat Sessions', data.chats.length, new Date().toISOString()]);
        }
        
        if (data.activities && data.activities.completed) {
            rows.push(['Activities Completed', data.activities.completed.length, new Date().toISOString()]);
        }
        
        if (data.games) {
            const totalPlays = Object.values(data.games).reduce((sum, game) => sum + (game.plays || 0), 0);
            rows.push(['Games Played', totalPlays, new Date().toISOString()]);
        }
        
        if (data.emotions) {
            rows.push(['Emotion Records', data.emotions.length, new Date().toISOString()]);
        }
        
        return rows.map(row => row.join(',')).join('\n');
    }

    clearData() {
        if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            localStorage.removeItem('mindcare_chat_history');
            localStorage.removeItem('mindcare_emotion_history');
            localStorage.removeItem('mindcare_activities_data');
            localStorage.removeItem('mindcare_game_stats');
            
            this.refreshData();
            this.showNotification('All data cleared successfully', 'success');
        }
    }

    setNewGoal() {
        const modal = new bootstrap.Modal(document.getElementById('goalModal'));
        modal.show();
    }

    saveGoal() {
        const goalType = document.getElementById('goalType').value;
        const goalTarget = document.getElementById('goalTarget').value;
        const goalDuration = document.getElementById('goalDuration').value;
        const goalReminders = document.getElementById('goalReminders').checked;

        // Save goal to localStorage
        const goals = JSON.parse(localStorage.getItem('mindcare_goals') || '[]');
        goals.push({
            id: Date.now(),
            type: goalType,
            target: goalTarget,
            duration: parseInt(goalDuration),
            reminders: goalReminders,
            createdAt: new Date().toISOString(),
            progress: 0
        });

        localStorage.setItem('mindcare_goals', JSON.stringify(goals));

        const modal = bootstrap.Modal.getInstance(document.getElementById('goalModal'));
        modal.hide();

        this.showNotification('New goal set successfully!', 'success');
        this.renderGoals();
    }

    showEmotionReport() {
        this.showNotification('Opening emotion report...', 'info');
        // In full implementation, this would show a detailed report
    }

    showProgressReport() {
        this.showNotification('Opening progress report...', 'info');
    }

    showTrends() {
        this.showNotification('Showing trend analysis...', 'info');
    }

    showAchievements() {
        this.showNotification('Showing achievements...', 'info');
    }

    showDataPolicy() {
        this.showNotification('Opening data policy...', 'info');
    }

    setupEventListeners() {
        // Timeline type selector
        const timelineType = document.getElementById('timelineType');
        if (timelineType) {
            timelineType.addEventListener('change', (e) => {
                // Update chart based on selected type
                this.refreshCharts();
            });
        }

        // Settings toggles
        const analyticsToggle = document.getElementById('analyticsToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const weeklyReportToggle = document.getElementById('weeklyReportToggle');

        if (analyticsToggle) {
            analyticsToggle.checked = localStorage.getItem('analyticsEnabled') !== 'false';
            analyticsToggle.addEventListener('change', (e) => {
                localStorage.setItem('analyticsEnabled', e.target.checked);
            });
        }

        if (notificationsToggle) {
            notificationsToggle.checked = localStorage.getItem('notificationsEnabled') !== 'false';
            notificationsToggle.addEventListener('change', (e) => {
                localStorage.setItem('notificationsEnabled', e.target.checked);
            });
        }

        if (weeklyReportToggle) {
            weeklyReportToggle.checked = localStorage.getItem('weeklyReports') === 'true';
            weeklyReportToggle.addEventListener('change', (e) => {
                localStorage.setItem('weeklyReports', e.target.checked);
            });
        }

        // Goal duration slider
        const goalDurationSlider = document.getElementById('goalDuration');
        const selectedDuration = document.getElementById('selectedDuration');
        
        if (goalDurationSlider && selectedDuration) {
            goalDurationSlider.addEventListener('input', (e) => {
                selectedDuration.textContent = `${e.target.value} days`;
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : 
                               type === 'warning' ? 'bi-exclamation-triangle' :
                               type === 'danger' ? 'bi-x-circle' : 'bi-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize dashboard controller
const dashboard = new DashboardController();
window.dashboard = dashboard;