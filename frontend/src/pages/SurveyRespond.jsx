import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { responseService } from '../services/responseService';

const SurveyRespond = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await surveyService.getSurvey(id);
      setSurvey(response.data);
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('No se pudo cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const validateAnswers = () => {
    if (!survey) return false;
    
    for (const question of survey.questions) {
      if (question.required && !answers[question._id]) {
        setError(`La pregunta "${question.text}" es obligatoria`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateAnswers()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }));
      
      await responseService.submitResponse(id, answersArray);
      
      setSubmitted(true);
      
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading survey...</div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Go back to main page
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Thanks for your Responses!
          </h2>
          <p className="text-gray-600 mb-8">
            Your responses have been submmited.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            Finish
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
              {survey?.title}
            </h1>
            {survey?.description && (
              <p className="text-gray-600">
                {survey.description}
              </p>
            )}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Esta encuesta es anónima. Tus respuestas serán confidenciales.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey?.questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-xl shadow-lg p-6">
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
                        name={`question-${question._id}`}
                        value={option}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
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
                          name={`question-${question._id}`}
                          value={i + 1}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
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
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
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
              disabled={submitting}
              className="btn-primary w-full py-4 text-lg"
            >
              {submitting ? 'Enviando...' : 'Enviar Respuestas'}
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