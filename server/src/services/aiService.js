const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'demo',
});

const analyzeIssue = async (description) => {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: "You are an expert housing issue analyst for a tenant rights platform. Analyze the issue description and return ONLY valid JSON with: { \"category\": \"Safety|Maintenance|Harassment|Discrimination\", \"confidenceScore\": 0.0-1.0, \"reasoning\": \"brief explanation\", \"flaggedKeywords\": [\"keyword1\", \"keyword2\"], \"severitySuggestion\": 1-5 }. Do not include any text outside the JSON object.",
      messages: [{ role: 'user', content: description }],
    });

    const jsonStr = msg.content[0].text.trim();
    // In case the AI returns markdown like ```json ... ```
    const match = jsonStr.match(/\{[\s\S]*\}/);
    const parsedStr = match ? match[0] : jsonStr;
    const result = JSON.parse(parsedStr);
    
    return {
      category: result.category || 'Maintenance',
      confidenceScore: parseFloat(result.confidenceScore) || 0.5,
      reasoning: result.reasoning || '',
      flaggedKeywords: result.flaggedKeywords || [],
      severitySuggestion: parseInt(result.severitySuggestion) || 3,
    };
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      category: 'Maintenance',
      confidenceScore: 0.5,
      reasoning: 'AI analysis unavailable. Categorized manually.',
      flaggedKeywords: [],
      severitySuggestion: 3,
    };
  }
};

module.exports = { analyzeIssue };
