// AI Integration for DeepFake Defense
class AI {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.openai.com/v1';
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 150;
        this.temperature = 0.7;
        
        this.init();
    }
    
    init() {
        // Try to get API key from localStorage
        this.apiKey = localStorage.getItem('openai-api-key');
        
        if (!this.apiKey) {
            console.warn('OpenAI API key not found. AI explanations will use fallback responses.');
        }
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('openai-api-key', apiKey);
    }
    
    async getExplanation(mediaItem) {
        if (!this.apiKey) {
            return this.getFallbackExplanation(mediaItem);
        }
        
        try {
            const prompt = this.buildPrompt(mediaItem);
            const response = await this.callOpenAI(prompt);
            return response;
        } catch (error) {
            console.error('Error getting AI explanation:', error);
            return this.getFallbackExplanation(mediaItem);
        }
    }
    
    buildPrompt(mediaItem) {
        const mediaInfo = MediaManager.getMediaInfo(mediaItem);
        
        let prompt = `Analyze this ${mediaItem.type} and explain why it might be ${mediaItem.isFake ? 'fake' : 'real'}:
        
Content: "${mediaItem.content}"
Type: ${mediaItem.type}
${mediaInfo.author ? `Author: ${mediaInfo.author}` : ''}
${mediaInfo.source ? `Source: ${mediaInfo.source}` : ''}
${mediaInfo.description ? `Description: ${mediaInfo.description}` : ''}

Please provide a brief, educational explanation (max 100 words) about why this content appears to be ${mediaItem.isFake ? 'AI-generated or fake' : 'authentic and real'}. Focus on specific indicators that help identify ${mediaItem.isFake ? 'fake' : 'real'} content.`;

        return prompt;
    }
    
    async callOpenAI(prompt) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in media literacy and deepfake detection. Provide clear, educational explanations about why content might be real or fake.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
    
    getFallbackExplanation(mediaItem) {
        const mediaInfo = MediaManager.getMediaInfo(mediaItem);
        
        if (mediaItem.isFake) {
            return this.getFakeFallbackExplanation(mediaItem, mediaInfo);
        } else {
            return this.getRealFallbackExplanation(mediaItem, mediaInfo);
        }
    }
    
    getFakeFallbackExplanation(mediaItem, mediaInfo) {
        const fakeExplanations = {
            image: [
                "This image appears to be AI-generated due to unrealistic facial features, perfect symmetry, or artificial artifacts that are common in computer-generated images.",
                "AI-generated images often have unnatural lighting, inconsistent details, or patterns that don't occur in real photographs.",
                "Look for signs like overly perfect features, strange background elements, or artifacts that indicate computer generation."
            ],
            quote: [
                "This quote appears to be fake because it's misattributed to someone who never said it, or contains modern language that wouldn't have been used in the historical context.",
                "Fake quotes often lack proper sources, contradict known facts about the person, or use contemporary language in historical contexts.",
                "Always verify quotes by checking reliable sources and historical records."
            ],
            video: [
                "This video shows signs of deepfake manipulation, such as unnatural facial movements, inconsistent lighting, or artifacts around the face.",
                "Deepfake videos often have synchronization issues between audio and video, or unrealistic facial expressions.",
                "Look for glitches, unnatural movements, or inconsistencies that indicate AI manipulation."
            ]
        };
        
        const explanations = fakeExplanations[mediaItem.type] || fakeExplanations.image;
        return explanations[Math.floor(Math.random() * explanations.length)];
    }
    
    getRealFallbackExplanation(mediaItem, mediaInfo) {
        const realExplanations = {
            image: [
                "This appears to be a real photograph with natural lighting, realistic details, and authentic characteristics that are difficult to fake convincingly.",
                "Real images typically have natural imperfections, consistent lighting, and realistic details that AI struggles to replicate perfectly.",
                "The image shows authentic characteristics and natural elements that indicate it's a genuine photograph."
            ],
            quote: [
                "This quote appears to be authentic with proper attribution, historical context, and verification from reliable sources.",
                "Real quotes are typically well-documented, have clear sources, and fit within the historical context of the person's life and work.",
                "This quote is properly attributed and has been verified through historical records and reliable sources."
            ],
            video: [
                "This video appears to be authentic with natural movements, consistent lighting, and realistic interactions that are difficult to fake.",
                "Real videos typically have natural facial expressions, consistent audio-video synchronization, and realistic environmental factors.",
                "The video shows authentic characteristics and natural elements that indicate it's genuine footage."
            ]
        };
        
        const explanations = realExplanations[mediaItem.type] || realExplanations.image;
        return explanations[Math.floor(Math.random() * explanations.length)];
    }
    
    async analyzeImage(imageUrl) {
        if (!this.apiKey) {
            return this.getImageAnalysisFallback();
        }
        
        try {
            // Convert image to base64 for API call
            const base64Image = await this.imageToBase64(imageUrl);
            
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Analyze this image and determine if it appears to be real or AI-generated. Look for signs like unnatural features, perfect symmetry, artifacts, or other indicators of AI generation. Provide a brief explanation.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 200,
                    temperature: 0.3
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error analyzing image:', error);
            return this.getImageAnalysisFallback();
        }
    }
    
    async imageToBase64(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            throw new Error('Failed to convert image to base64');
        }
    }
    
    getImageAnalysisFallback() {
        const fallbacks = [
            "Image analysis unavailable. Look for signs like unnatural symmetry, perfect features, or artifacts that might indicate AI generation.",
            "Unable to analyze image. Check for realistic details, natural imperfections, and authentic characteristics.",
            "Analysis not available. Examine the image for natural vs artificial elements to determine authenticity."
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    async generateFakeContent(type) {
        if (!this.apiKey) {
            return this.generateFakeContentFallback(type);
        }
        
        try {
            const prompt = this.buildFakeContentPrompt(type);
            const response = await this.callOpenAI(prompt);
            return response;
        } catch (error) {
            console.error('Error generating fake content:', error);
            return this.generateFakeContentFallback(type);
        }
    }
    
    buildFakeContentPrompt(type) {
        const prompts = {
            quote: 'Generate a fake quote that sounds like it could be real but is actually made up. Make it sound plausible but include subtle clues that it\'s fake. Format: "Quote" - Author',
            image_description: 'Describe an AI-generated image that would be difficult to distinguish from a real photo. Include details about what makes it look realistic but also what subtle signs might indicate it\'s fake.',
            news_headline: 'Create a fake news headline that sounds believable but is completely fabricated. Make it sound like it could be real news.'
        };
        
        return prompts[type] || prompts.quote;
    }
    
    generateFakeContentFallback(type) {
        const fallbacks = {
            quote: '"The internet is just a passing fad." - Bill Gates',
            image_description: 'A realistic-looking portrait with perfect symmetry and slightly unnatural lighting',
            news_headline: 'Scientists Discover Time Travel in Local Laboratory'
        };
        
        return fallbacks[type] || fallbacks.quote;
    }
    
    async detectDeepfakeFeatures(mediaItem) {
        const features = [];
        
        if (mediaItem.type === 'image') {
            features.push(...this.analyzeImageFeatures(mediaItem));
        } else if (mediaItem.type === 'quote') {
            features.push(...this.analyzeQuoteFeatures(mediaItem));
        } else if (mediaItem.type === 'video') {
            features.push(...this.analyzeVideoFeatures(mediaItem));
        }
        
        return features;
    }
    
    analyzeImageFeatures(mediaItem) {
        const features = [];
        
        if (mediaItem.isFake) {
            features.push(
                'Perfect facial symmetry',
                'Unrealistic lighting patterns',
                'AI artifacts around edges',
                'Overly smooth skin texture',
                'Inconsistent background details'
            );
        } else {
            features.push(
                'Natural facial asymmetry',
                'Realistic lighting and shadows',
                'Natural skin texture and pores',
                'Consistent background elements',
                'Authentic environmental details'
            );
        }
        
        return features;
    }
    
    analyzeQuoteFeatures(mediaItem) {
        const features = [];
        
        if (mediaItem.isFake) {
            features.push(
                'No historical record found',
                'Modern language in historical context',
                'Misattributed to famous person',
                'Contradicts known facts',
                'Lacks proper source citation'
            );
        } else {
            features.push(
                'Well-documented historical record',
                'Appropriate language for time period',
                'Properly attributed',
                'Consistent with known facts',
                'Multiple reliable sources'
            );
        }
        
        return features;
    }
    
    analyzeVideoFeatures(mediaItem) {
        const features = [];
        
        if (mediaItem.isFake) {
            features.push(
                'Unnatural facial movements',
                'Audio-video sync issues',
                'Inconsistent lighting',
                'Artifacts around face',
                'Unrealistic expressions'
            );
        } else {
            features.push(
                'Natural facial expressions',
                'Perfect audio-video sync',
                'Consistent lighting throughout',
                'Realistic movements',
                'Authentic environmental factors'
            );
        }
        
        return features;
    }
    
    getConfidenceScore(mediaItem) {
        // Generate a fake confidence score for demonstration
        const baseScore = mediaItem.isFake ? 85 : 78;
        const variation = Math.random() * 20 - 10; // ±10 points
        return Math.max(0, Math.min(100, Math.round(baseScore + variation)));
    }
    
    async validateMedia(mediaItem) {
        const analysis = {
            isFake: mediaItem.isFake,
            confidence: this.getConfidenceScore(mediaItem),
            features: await this.detectDeepfakeFeatures(mediaItem),
            explanation: await this.getExplanation(mediaItem)
        };
        
        return analysis;
    }
}

// Create global instance
window.AI = new AI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI;
} 