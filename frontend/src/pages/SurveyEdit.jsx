import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/layout/Navbar';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { surveySchema } from '../schemas/surveySchemas';
import FormInput from '../components/common/FormInput';
import FormTextarea from '../components/common/FormTextarea';
import FormSelect from '../components/common/FormSelect';

const SurveyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      settings: {
        startDate: '',
        endDate: '',
        access: 'public',
        maxResponses: ''
      },
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const questionTypes = [
    { value: 'text', label: ' Texto Libre' },
    { value: 'multiple', label: ' Opción Múltiple' },
    { value: 'scale', label: ' Escala (1-10)' },
    { value: 'date', label: ' Fecha' }
  ];

  // Load existing survey data
  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await surveyService.getSurvey(id);
      const survey = data.data;

      // Check if user can edit (only drafts)
      if (survey.status !== 'draft') {
        setApiError('Solo puedes editar encuestas en borrador');
        setTimeout(() => navigate('/surveys'), 2000);
        return;
      }

      // Format data for form
      const formData = {
        title: survey.title || '',
        description: survey.description || '',
        settings: {
          startDate: survey.settings?.startDate 
            ? new Date(survey.settings.startDate).toISOString().split('T')[0] 
            : '',
          endDate: survey.settings?.endDate 
            ? new Date(survey.settings.endDate).toISOString().split('T')[0] 
            : '',
          access: survey.settings?.access || 'public',
          maxResponses: survey.settings?.maxResponses?.toString() || ''
        },
        questions: survey.questions || []
      };

      reset(formData);
    } catch (err) {
      console.error('Error loading survey:', err);
      setApiError(err.response?.data?.message || 'Error al cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    append({
      text: '',
      type: 'text',
      options: [],
      required: false
    });
  };

  const onSubmit = async (data, publishNow = false) => {
    try {
      setApiError('');

      // Validate at least one question
      if (data.questions.length === 0) {
        setApiError('Debes agregar al menos una pregunta');
        return;
      }

      // Validate multiple choice questions
      const invalidMultiple = data.questions.filter(
        q => q.type === 'multiple' && (!q.options || q.options.length < 2)
      );

      if (invalidMultiple.length > 0) {
        setApiError('Las preguntas de opción múltiple deben tener al menos 2 opciones');
        return;
      }

      // Prepare data
      const surveyData = {
        ...data,
        status: publishNow ? 'active' : 'draft',
        questions: data.questions.map((q, idx) => ({
          ...q,
          order: idx
        }))
      };

      await surveyService.updateSurvey(id, surveyData);

      alert(publishNow 
        ? '¡Encuesta publicada exitosamente!' 
        : '¡Encuesta actualizada como borrador!'
      );

      navigate('/surveys');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al actualizar encuesta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <p className="text-gray-600">Cargando encuesta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Encuesta</h1>
          <p className="text-gray-600">Modifica tu encuesta antes de publicarla</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {apiError}
          </div>
        )}

        <form>
          {/* General Information */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>

            <div className="space-y-4">
              <FormInput
                label="Título de la Encuesta *"
                placeholder="Ej: Evaluación del Servicio de Biblioteca"
                {...register('title')}
                error={errors.title?.message}
              />

              <FormTextarea
                label="Descripción"
                rows={3}
                placeholder="Describe el propósito de esta encuesta..."
                {...register('description')}
                error={errors.description?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Fecha de Inicio"
                  type="date"
                  {...register('settings.startDate')}
                  error={errors.settings?.startDate?.message}
                />

                <FormInput
                  label="Fecha de Fin"
                  type="date"
                  {...register('settings.endDate')}
                  error={errors.settings?.endDate?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Acceso"
                  {...register('settings.access')}
                  options={[
                    { value: 'public', label: 'Público' },
                    { value: 'private', label: 'Privado' },
                    { value: 'token', label: 'Con Token' }
                  ]}
                  error={errors.settings?.access?.message}
                />

                <FormInput
                  label="Máximo de Respuestas"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  {...register('settings.maxResponses')}
                  error={errors.settings?.maxResponses?.message}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Preguntas ({fields.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Agregar Pregunta</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4">❓</div>
                <p>No hay preguntas aún. Haz clic en "Agregar Pregunta" para comenzar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, qIndex) => (
                  <QuestionItem
                    key={field.id}
                    qIndex={qIndex}
                    control={control}
                    register={register}
                    remove={remove}
                    watch={watch}
                    errors={errors}
                    questionTypes={questionTypes}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/surveys')}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              <Save size={18} className="inline mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              <Eye size={18} className="inline mr-2" />
              {isSubmitting ? 'Publicando...' : 'Publicar Encuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Question Item Component (reused from SurveyBuilder)
const QuestionItem = ({ qIndex, control, register, remove, watch, errors, questionTypes }) => {
  const questionType = watch(`questions.${qIndex}.type`);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-gray-600">
          Pregunta {qIndex + 1}
        </span>
        <button
          type="button"
          onClick={() => remove(qIndex)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <FormInput
          placeholder="Escribe tu pregunta aquí..."
          {...register(`questions.${qIndex}.text`)}
          error={errors.questions?.[qIndex]?.text?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            {...register(`questions.${qIndex}.type`)}
            options={questionTypes}
            error={errors.questions?.[qIndex]?.type?.message}
          />

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              {...register(`questions.${qIndex}.required`)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700">Obligatoria</span>
          </label>
        </div>

        {/* Options for multiple choice questions */}
        {questionType === 'multiple' && (
          <Controller
            name={`questions.${qIndex}.options`}
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <OptionsManager
                value={field.value}
                onChange={field.onChange}
                error={errors.questions?.[qIndex]?.options?.message}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

// Options Manager Component
const OptionsManager = ({ value = [], onChange, error }) => {
  const addOption = () => {
    onChange([...value, '']);
  };

  const updateOption = (index, newValue) => {
    const newOptions = [...value];
    newOptions[index] = newValue;
    onChange(newOptions);
  };

  const deleteOption = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-3 space-y-2">
      <label className="block text-sm font-medium text-gray-700">Opciones:</label>
      {value.map((option, oIndex) => (
        <div key={oIndex} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder={`Opción ${oIndex + 1}`}
            value={option}
            onChange={(e) => updateOption(oIndex, e.target.value)}
          />
          <button
            type="button"
            onClick={() => deleteOption(oIndex)}
            className="btn-secondary px-3"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="btn-secondary text-sm"
      >
        + Agregar Opción
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SurveyEdit;