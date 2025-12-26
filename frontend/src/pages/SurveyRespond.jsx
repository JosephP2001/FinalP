import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SurveyRespond = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  
  // Datos de ejemplo (wireframe)
  const surveyData = {
    title: 'Evaluación Docente Semestre 2024-2',
    description: 'Por favor responde las siguientes preguntas sobre la metodología y desempeño de tu docente.',
    questions: [
      {
        id: 1,
        text: '¿Cómo calificarías la metodología del docente?',
        type: 'multiple',
        options: ['Excelente', 'Buena', 'Regular', 'Mala'],
        required: true
      },
      {
        id: 2,
        text: 'El docente explica los conceptos de manera clara',
        type: 'scale',
        min: 1,
        max: 5,
        required: true
      },
      {
        id: 3,
        text: '¿Qué aspectos podrían mejorar en la clase?',
        type: 'text',
        required: false
      }
    ]
  };

  const [answers, setAnswers] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar respuestas
    setSubmitted(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Gracias por tu respuesta!
          </h2>
          <p className="text-gray-600 mb-8">
            Tu opinión es muy importante para nosotros. Hemos registrado tus respuestas exitosamente.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-2">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {surveyData.title}
            </h1>
            <p className="text-gray-600">
              {surveyData.description}
            </p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Esta encuesta es anónima. Tus respuestas serán confidenciales.
            </p>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {surveyData.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Multiple Choice */}
              {question.type === 'multiple' && (
                <div className="space-y-3 ml-11">
                  {question.options.map((option, optIndex) => (
                    <label 
                      key={optIndex}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        required={question.required}
                        className="w-5 h-5 text-primary-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Scale */}
              {question.type === 'scale' && (
                <div className="ml-11">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Muy en desacuerdo
                    </span>
                    <span className="text-sm text-gray-600">
                      Muy de acuerdo
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    {[...Array(5)].map((_, i) => (
                      <label
                        key={i}
                        className="flex-1 text-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={i + 1}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          required={question.required}
                          className="sr-only peer"
                        />
                        <div className="w-full py-3 border-2 border-gray-300 rounded-lg peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-checked:text-white hover:border-primary-400 transition-all">
                          <span className="font-semibold">{i + 1}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Input */}
              {question.type === 'text' && (
                <div className="ml-11">
                  <textarea
                    rows="4"
                    placeholder="Escribe tu respuesta aquí..."
                    className="input-field"
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required={question.required}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              type="submit"
              className="btn-primary w-full py-4 text-lg"
            >
              Enviar Respuestas
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Al enviar, aceptas que tus respuestas sean procesadas de forma anónima
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyRespond;