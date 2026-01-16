import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { surveyService } from '../services/surveyService';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [],
    settings: {
      startDate: '',
      endDate: '',
      access: 'public',
      maxResponses: ''
    },
    status: 'draft'
  });

  const questionTypes = [
    { value: 'text', label: 'Texto Libre', icon: '📝' },
    { value: 'multiple', label: 'Opción Múltiple', icon: '☑️' },
    { value: 'scale', label: 'Escala (1-10)', icon: '📊' },
    { value: 'date', label: 'Fecha', icon: '📅' }
  ];

  const addQuestion = () => {
    setSurvey({
      ...survey,
      questions: [
        ...survey.questions,
        {
          text: '',
          type: 'text',
          options: [],
          required: false,
          order: survey.questions.length
        }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = survey.questions.filter((_, i) => i !== index);
    // Reordenar
    updatedQuestions.forEach((q, i) => q.order = i);
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...survey.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options.push('');
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const handleSubmit = async (publishNow = false) => {
    try {
      setLoading(true);
      setError('');

      // Validaciones
      if (!survey.title.trim()) {
        setError('El título es obligatorio');
        return;
      }

      if (survey.questions.length === 0) {
        setError('Debes agregar al menos una pregunta');
        return;
      }

      // Validar que las preguntas tengan texto
      const emptyQuestions = survey.questions.filter(q => !q.text.trim());
      if (emptyQuestions.length > 0) {
        setError('Todas las preguntas deben tener texto');
        return;
      }

      // Validar opciones en preguntas de opción múltiple
      const invalidMultiple = survey.questions.filter(
        q => q.type === 'multiple' && (!q.options || q.options.length < 2)
      );
      if (invalidMultiple.length > 0) {
        setError('Las preguntas de opción múltiple deben tener al menos 2 opciones');
        return;
      }

      // Preparar datos para enviar
      const surveyData = {
        ...survey,
        status: publishNow ? 'active' : 'draft',
        settings: {
          ...survey.settings,
          maxResponses: survey.settings.maxResponses ? parseInt(survey.settings.maxResponses) : null
        }
      };

      // Crear encuesta
      const response = await surveyService.createSurvey(surveyData);
      
      alert(publishNow 
        ? '¡Encuesta publicada exitosamente!' 
        : '¡Encuesta guardada como borrador!'
      );
      
      navigate('/surveys');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear encuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Nueva Encuesta</h1>
          <p className="text-gray-600">Diseña tu encuesta paso a paso</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Survey Info */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Encuesta *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Evaluación del Servicio de Biblioteca"
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Describe el propósito de esta encuesta..."
                value={survey.description}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={survey.settings.startDate}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, startDate: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={survey.settings.endDate}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, endDate: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceso
                </label>
                <select
                  className="input-field"
                  value={survey.settings.access}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, access: e.target.value }
                  })}
                >
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                  <option value="token">Con Token</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Respuestas
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ilimitado"
                  min="1"
                  value={survey.settings.maxResponses}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, maxResponses: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Preguntas ({survey.questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Agregar Pregunta</span>
            </button>
          </div>

          {survey.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">❓</div>
              <p>No hay preguntas aún. Haz clic en "Agregar Pregunta" para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {survey.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-gray-600">
                      Pregunta {qIndex + 1}
                    </span>
                    <button
                      onClick={() => deleteQuestion(qIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Escribe tu pregunta aquí..."
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="input-field"
                        value={question.type}
                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-700">Obligatoria</span>
                      </label>
                    </div>

                    {/* Opciones para preguntas de opción múltiple */}
                    {question.type === 'multiple' && (
                      <div className="mt-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Opciones:
                        </label>
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <input
                              type="text"
                              className="input-field flex-1"
                              placeholder={`Opción ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            />
                            <button
                              onClick={() => deleteOption(qIndex, oIndex)}
                              className="btn-secondary px-3"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(qIndex)}
                          className="btn-secondary text-sm"
                        >
                          + Agregar Opción
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/surveys')}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            <Save size={18} className="inline mr-2" />
            {loading ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="btn-primary flex-1"
            disabled={loading}
          >
            <Eye size={18} className="inline mr-2" />
            {loading ? 'Publicando...' : 'Publicar Encuesta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;