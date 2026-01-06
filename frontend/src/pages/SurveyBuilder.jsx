import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Plus, Trash2, GripVertical, Eye, Save } from 'lucide-react';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    access: 'public',
    questions: []
  });

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'multiple',
      text: '¿Cómo calificarías la metodología del docente?',
      options: ['Excelente', 'Buena', 'Regular', 'Mala'],
      required: true
    }
  ]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple',
      text: '',
      options: ['Opción 1', 'Opción 2'],
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para guardar la encuesta
    alert('Encuesta guardada exitosamente');
    navigate('/surveys');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Top Actions Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/surveys')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver
            </button>
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Eye size={18} />
                <span>Vista Previa</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Save size={18} />
                <span>Guardar Borrador</span>
              </button>
              <button 
                onClick={handleSubmit}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Publicar Encuesta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Crear Nueva Encuesta
        </h1>

        {/* General Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Información General
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Encuesta *
              </label>
              <input
                type="text"
                placeholder="Ej: Evaluación Docente 2024-2"
                className="input-field"
                value={survey.title}
                onChange={(e) => setSurvey({...survey, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                placeholder="Describe el objetivo de esta encuesta..."
                className="input-field"
                rows="3"
                value={survey.description}
                onChange={(e) => setSurvey({...survey, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={survey.startDate}
                  onChange={(e) => setSurvey({...survey, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Cierre
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={survey.endDate}
                  onChange={(e) => setSurvey({...survey, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuración de Acceso
              </label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="access" 
                    value="public"
                    checked={survey.access === 'public'}
                    onChange={(e) => setSurvey({...survey, access: e.target.value})}
                    className="text-primary-600"
                  />
                  <span>Pública (cualquiera con el link)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="access" 
                    value="private"
                    checked={survey.access === 'private'}
                    onChange={(e) => setSurvey({...survey, access: e.target.value})}
                    className="text-primary-600"
                  />
                  <span>Privada (requiere autenticación)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Preguntas</h2>
            <button 
              onClick={addQuestion}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Agregar Pregunta</span>
            </button>
          </div>

          {/* Question Cards */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="card border-l-4 border-primary-500">
                {/* Question Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="text-gray-400 cursor-move" size={20} />
                    <span className="font-semibold text-gray-700">
                      Pregunta {index + 1}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                      {question.type === 'multiple' ? 'Opción Múltiple' : 'Texto Libre'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta aquí..."
                    className="input-field"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  />
                </div>

                {/* Options (for multiple choice) */}
                {question.type === 'multiple' && (
                  <div className="ml-6 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          disabled 
                          className="text-primary-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[optIndex] = e.target.value;
                            updateQuestion(question.id, 'options', newOptions);
                          }}
                          className="input-field flex-1"
                        />
                        <button className="text-gray-400 hover:text-red-600">
                          ✕
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newOptions = [...question.options, `Opción ${question.options.length + 1}`];
                        updateQuestion(question.id, 'options', newOptions);
                      }}
                      className="text-primary-600 text-sm hover:text-primary-700"
                    >
                      + Agregar opción
                    </button>
                  </div>
                )}

                {/* Required Checkbox */}
                <div className="mt-4 pt-4 border-t">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm text-gray-600">Pregunta obligatoria</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/surveys')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <div className="flex gap-3">
            <button className="btn-secondary">
              Guardar como Borrador
            </button>
            <button 
              onClick={handleSubmit}
              className="btn-primary"
            >
              Publicar Encuesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;