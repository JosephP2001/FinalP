// backend/src/services/aiService.js

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Get AI Analysis for survey responses
 * Uses Groq API (llama3-70b-8192) for intelligent analysis
 * 
 * @param {Object} survey - Survey document
 * @param {Array} responses - Array of response documents
 * @returns {Promise<Object>} Analysis results
 */
export const getAIAnalysis = async (survey, responses) => {
  try {
    console.log('🤖 Starting AI analysis...');
    console.log(`📊 Survey: ${survey.title}`);
    console.log(`📝 Responses: ${responses.length}`);

    // Prepare data for AI analysis
    const surveyData = prepareSurveyData(survey, responses);

    // Create prompt for Groq
    const prompt = createAnalysisPrompt(surveyData);

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un analista experto en encuestas y feedback. Tu trabajo es analizar respuestas de encuestas y proporcionar insights valiosos, claros y accionables en español.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile', // Updated to current model
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const analysis = parseAIResponse(aiResponse);

    console.log('✅ AI analysis completed successfully');

    return {
      success: true,
      analysis,
      metadata: {
        model: 'llama-3.3-70b-versatile',
        responsesAnalyzed: responses.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    throw new Error(`Error generating AI analysis: ${error.message}`);
  }
};

/**
 * Prepare survey data for AI analysis
 */
const prepareSurveyData = (survey, responses) => {
  const data = {
    title: survey.title,
    description: survey.description,
    totalResponses: responses.length,
    questions: survey.questions.map(q => ({
      id: q._id,
      text: q.text,
      type: q.type,
      responses: []
    }))
  };

  // Organize responses by question
  responses.forEach(response => {
    response.answers.forEach(answer => {
      const questionIndex = data.questions.findIndex(
        q => q.id.toString() === answer.questionId.toString()
      );

      if (questionIndex !== -1) {
        data.questions[questionIndex].responses.push(answer.answer);
      }
    });
  });

  return data;
};

/**
 * Create analysis prompt for AI
 */
const createAnalysisPrompt = (surveyData) => {
  let prompt = `Analiza la siguiente encuesta y sus respuestas:\n\n`;
  prompt += `**Encuesta:** ${surveyData.title}\n`;
  prompt += `**Descripción:** ${surveyData.description}\n`;
  prompt += `**Total de respuestas:** ${surveyData.totalResponses}\n\n`;
  prompt += `**Preguntas y Respuestas:**\n\n`;

  surveyData.questions.forEach((question, index) => {
    prompt += `${index + 1}. **${question.text}** (${question.type})\n`;
    prompt += `   Respuestas (${question.responses.length}):\n`;
    
    if (question.responses.length > 0) {
      question.responses.forEach((response, idx) => {
        prompt += `   - ${response}\n`;
      });
    } else {
      prompt += `   - (Sin respuestas)\n`;
    }
    prompt += `\n`;
  });

  prompt += `\nProporciona un análisis completo en el siguiente formato JSON:\n\n`;
  prompt += `{\n`;
  prompt += `  "summary": "Un resumen ejecutivo del análisis (2-3 párrafos)",\n`;
  prompt += `  "keyInsights": ["insight 1", "insight 2", "insight 3"],\n`;
  prompt += `  "sentiment": {\n`;
  prompt += `    "overall": "positivo/neutral/negativo",\n`;
  prompt += `    "score": 0-100,\n`;
  prompt += `    "explanation": "explicación del sentimiento"\n`;
  prompt += `  },\n`;
  prompt += `  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"]\n`;
  prompt += `}\n\n`;
  prompt += `Responde SOLO con el JSON, sin texto adicional.`;

  return prompt;
};

/**
 * Parse AI response into structured format
 */
const parseAIResponse = (aiResponse) => {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      return {
        summary: parsed.summary || 'No summary available',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        sentiment: {
          overall: parsed.sentiment?.overall || 'neutral',
          score: parsed.sentiment?.score || 50,
          explanation: parsed.sentiment?.explanation || 'No explanation available'
        },
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    }

    // Fallback: return raw response as summary
    return {
      summary: aiResponse,
      keyInsights: [],
      sentiment: {
        overall: 'neutral',
        score: 50,
        explanation: 'Unable to determine sentiment'
      },
      recommendations: []
    };

  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Return raw response as fallback
    return {
      summary: aiResponse,
      keyInsights: [],
      sentiment: {
        overall: 'neutral',
        score: 50,
        explanation: 'Parse error'
      },
      recommendations: []
    };
  }
};

export default { getAIAnalysis };