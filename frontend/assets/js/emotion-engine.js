// Emotion Detection Engine for MindCare-AI
export class EmotionEngine {
    constructor() {
        this.emotionsData = null;
        this.responsesData = null;
        this.currentEmotion = null;
        this.emotionHistory = [];
        this.loadData();
    }

    async loadData() {
        try {
            const [emotionsRes, responsesRes] = await Promise.all([
                fetch('assets/data/emotions.json'),
                fetch('assets/data/chat_responses.json')
            ]);
            
            this.emotionsData = await emotionsRes.json();
            this.responsesData = await responsesRes.json();
            console.log('Emotion engine data loaded successfully');
        } catch (error) {
            console.error('Failed to load emotion data:', error);
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        this.emotionsData = {
            emotions: [
                {id: 1, name: "Stressed", level: 8, keywords: ["stress", "overwhelmed"]},
                {id: 2, name: "Anxious", level: 7, keywords: ["anxious", "worried"]}
            ]
        };
        this.responsesData = {
            responses: [
                {id: 1, emotion_id: 1, text: "I hear you're feeling stressed."}
            ]
        };
    }

    analyzeText(text) {
        if (!this.emotionsData) return this.getDefaultEmotion();
        
        const words = text.toLowerCase().split(/\W+/);
        let detectedEmotions = [];
        
        // Analyze keywords
        this.emotionsData.emotions.forEach(emotion => {
            const matches = emotion.keywords.filter(keyword => 
                words.some(word => word.includes(keyword.toLowerCase()))
            ).length;
            
            if (matches > 0) {
                detectedEmotions.push({
                    ...emotion,
                    confidence: matches / emotion.keywords.length,
                    matches
                });
            }
        });
        
        // Sort by confidence and matches
        detectedEmotions.sort((a, b) => {
            if (b.confidence !== a.confidence) return b.confidence - a.confidence;
            return b.matches - a.matches;
        });
        
        return detectedEmotions.length > 0 ? detectedEmotions[0] : this.getDefaultEmotion();
    }

    getDefaultEmotion() {
        return {
            id: 9,
            name: "Calm",
            level: 2,
            color: "#10b981",
            icon: "🌿",
            confidence: 0.5
        };
    }

    getResponseForEmotion(emotionId) {
        if (!this.responsesData) return this.getDefaultResponse();
        
        const response = this.responsesData.responses.find(r => r.emotion_id === emotionId);
        return response || this.getDefaultResponse();
    }

    getDefaultResponse() {
        return {
            text: "Thank you for sharing. How are you feeling about this?",
            suggestions: ["Talk more", "Try activity", "Take break"],
            follow_up: "What's on your mind?"
        };
    }

    suggestActivity(emotionLevel) {
        const activities = {
            high: ["Box Breathing", "Progressive Relaxation", "Digital Detox"],
            medium: ["Mindful Walking", "5-4-3-2-1 Grounding", "Gratitude Journaling"],
            low: ["Study Pomodoro", "Priority Matrix", "Self-Compassion Break"]
        };
        
        if (emotionLevel >= 7) return activities.high;
        if (emotionLevel >= 4) return activities.medium;
        return activities.low;
    }

    updateEmotionHistory(emotion) {
        this.emotionHistory.push({
            emotion: emotion.name,
            level: emotion.level,
            timestamp: new Date().toISOString(),
            color: emotion.color
        });
        
        // Keep last 50 entries
        if (this.emotionHistory.length > 50) {
            this.emotionHistory = this.emotionHistory.slice(-50);
        }
        
        // Update localStorage for dashboard
        localStorage.setItem('mindcare_emotion_history', JSON.stringify(this.emotionHistory));
    }

    getEmotionTrend() {
        if (this.emotionHistory.length < 3) return "stable";
        
        const recent = this.emotionHistory.slice(-3);
        const avg = recent.reduce((sum, e) => sum + e.level, 0) / recent.length;
        const first = this.emotionHistory[0]?.level || 5;
        
        if (avg < first - 1) return "improving";
        if (avg > first + 1) return "worsening";
        return "stable";
    }
}

// Export singleton instance
export const emotionEngine = new EmotionEngine();