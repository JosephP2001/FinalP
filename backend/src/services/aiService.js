
/**
 * ------ANALYZE SURVEY's RESPONSE USING Groq AI------
 * @param {Object} survey - survey :v, there's no too much cience
 * @param {Array} responses - Responses Array
 * @returns {Object} Complete analysis with insights 
 */

export const getAIAnalysis = async (survey, responses) => {
  try {
    const analysisData = prepareAnalysisData(survey, responses);
    const prompt = createAnalysisPrompt(analysisData);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Eres un analista experto de encuestas. Proporciona análisis claros y útiles en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const analysis = parseAIResponse(aiResponse);

    return {
      success: true,
      analysis: {
        summary: analysis.summary,
        keyInsights: analysis.keyInsights,
        sentiment: analysis.sentiment,
        recommendations: analysis.recommendations,
        statistics: calculateStatistics(responses),
        generatedAt: new Date()
      }
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return generateQuickSummary(survey, responses);
  }
};

const prepareAnalysisData = (survey, responses) => {
  const questionAnalysis = survey.questions.map(question => {
    const questionResponses = responses.map(response => {
      const answer = response.answers.find(a => a.questionId.toString() === question._id.toString());
      return answer ? answer.value : null;
    }).filter(v => v !== null);

    return {
      questionId: question._id,
      questionText: question.text,
      questionType: question.type,
      totalResponses: questionResponses.length,
      responses: questionResponses
    };
  });

  return {
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    totalResponses: responses.length,
    questions: questionAnalysis
  };
};

const createAnalysisPrompt = (data) => {
  return `Analiza los siguientes datos de una encuesta y proporciona insights valiosos.

ENCUESTA: "${data.surveyTitle}"
DESCRIPCIÓN: "${data.surveyDescription}"
TOTAL DE RESPUESTAS: ${data.totalResponses}

PREGUNTAS Y RESPUESTAS:
${data.questions.map((q, i) => `
${i + 1}. ${q.questionText} (Tipo: ${q.questionType})
   Respuestas recibidas: ${q.totalResponses}
   ${formatResponses(q.responses, q.questionType)}
`).join('\n')}

Por favor, proporciona tu análisis en el siguiente formato JSON (SOLO JSON, sin texto adicional):

{
  "summary": "Resumen general de los resultados en 2-3 oraciones",
  "keyInsights": [
    "Insight 1: descripción detallada",
    "Insight 2: descripción detallada",
    "Insight 3: descripción detallada"
  ],
  "sentiment": {
    "overall": "positive",
    "score": 75,
    "explanation": "Explicación del sentimiento detectado"
  },
  "recommendations": [
    "Recomendación 1 basada en los datos",
    "Recomendación 2 basada en los datos",
    "Recomendación 3 basada en los datos"
  ]
}`;
};

const formatResponses = (responses, type) => {
  if (type === 'multiple') {
    const frequency = {};
    responses.forEach(r => {
      frequency[r] = (frequency[r] || 0) + 1;
    });
    return Object.entries(frequency)
      .map(([option, count]) => `   - "${option}": ${count} veces`)
      .join('\n');
  } else if (type === 'scale') {
    const avg = responses.reduce((a, b) => a + Number(b), 0) / responses.length;
    return `   Promedio: ${avg.toFixed(2)} | Valores: [${responses.join(', ')}]`;
  } else if (type === 'text') {
    return responses.slice(0, 10).map((r, i) => `   ${i + 1}. "${r}"`).join('\n');
  }
  return '   ' + responses.join(', ');
};

const parseAIResponse = (response) => {
  try {
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      summary: "Análisis generado automáticamente de las respuestas.",
      keyInsights: [
        "Se han recopilado múltiples respuestas",
        "Los datos están disponibles para revisión",
        "Se recomienda análisis manual detallado"
      ],
      sentiment: {
        overall: "neutral",
        score: 50,
        explanation: "No se pudo analizar el sentimiento automáticamente"
      },
      recommendations: [
        "Revisar las respuestas manualmente",
        "Identificar patrones comunes",
        "Tomar acciones basadas en feedback"
      ]
    };
  }
};

const calculateStatistics = (responses) => {
  const responsesByDay = {};

  responses.forEach(response => {
    const date = new Date(response.createdAt).toLocaleDateString();
    responsesByDay[date] = (responsesByDay[date] || 0) + 1;
  });

  return {
    totalResponses: responses.length,
    averagePerDay: Object.values(responsesByDay).reduce((a, b) => a + b, 0) / Object.keys(responsesByDay).length || 0,
    responsesByDay,
    latestResponse: responses[0]?.createdAt || null,
    oldestResponse: responses[responses.length - 1]?.createdAt || null
  };
};

export const generateQuickSummary = (survey, responses) => {
  const totalQuestions = survey.questions.length;
  const multipleChoiceQuestions = survey.questions.filter(q => q.type === 'multiple').length;
  const textQuestions = survey.questions.filter(q => q.type === 'text').length;

  return {
    success: true,
    analysis: {
      summary: `Se han recopilado ${responses.length} respuestas para la encuesta "${survey.title}". La encuesta contiene ${totalQuestions} preguntas en total.`,
      keyInsights: [
        `Total de participantes: ${responses.length}`,
        `Preguntas de opción múltiple: ${multipleChoiceQuestions}`,
        `Preguntas de texto libre: ${textQuestions}`,
        `Tasa de participación actual: ${((responses.length / (survey.settings.maxResponses || 100)) * 100).toFixed(1)}%`
      ],
      sentiment: {
        overall: "neutral",
        score: 50,
        explanation: "Análisis básico sin procesamiento de IA. Configure GROQ_API_KEY para análisis avanzado."
      },
      recommendations: [
        "Revisar respuestas individuales para obtener insights detallados",
        "Considerar patrones en las respuestas de opción múltiple",
        "Analizar comentarios de texto libre manualmente",
        "Configurar API de Groq para análisis automático con IA"
      ],
      statistics: calculateStatistics(responses),
      generatedAt: new Date()
    }
  };
};