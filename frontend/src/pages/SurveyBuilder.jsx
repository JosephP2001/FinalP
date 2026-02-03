import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/layout/Navbar';
import { Plus, Trash2, Save, Eye } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { surveySchema } from '../schemas/surveySchemas';
import FormInput from '../components/common/FormInput';
import FormTextarea from '../components/common/FormTextarea';
import FormSelect from '../components/common/FormSelect';
import { combineDateAndTime, validateSurveyData, formatSurveyDataForAPI } from '../utils';

const SurveyBuilder = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      settings: {
        startDate: '',
        endDate: '',
        startTime: '00:00',
        endTime: '23:59',
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('⚠️ Validation Errors:', errors);
    }
  }, [errors]);

  const questionTypes = [
    { value: 'text', label: '📝 Free Text' },
    { value: 'multiple', label: '☑️ Multiple Choice' },
    { value: 'scale', label: '📊 Scale (1-10)' },
    { value: 'date', label: '📅 Date' }
  ];

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
      console.log('🚀 [SUBMIT] Starting submission...');
      setApiError('');

      // Validate survey data using utility
      const validation = validateSurveyData(data);
      if (!validation.valid) {
        setApiError(validation.errors[0]);
        return;
      }

      // Format survey data for API
      const surveyData = formatSurveyDataForAPI(data, publishNow);

      // Add combined date and time
      surveyData.settings.startDate = combineDateAndTime(
        data.settings.startDate,
        data.settings.startTime
      );
      surveyData.settings.endDate = combineDateAndTime(
        data.settings.endDate,
        data.settings.endTime
      );

      console.log('✅ [SUBMIT] Sending to API:', JSON.stringify(surveyData, null, 2));

      await surveyService.createSurvey(surveyData);

      console.log('✅ [SUBMIT] Success!');

      alert(publishNow 
        ? 'Survey published successfully!' 
        : 'Survey saved as draft!'
      );

      navigate('/surveys');
    } catch (err) {
      console.error('❌ [SUBMIT] Error:', err);
      setApiError(err.response?.data?.message || 'Error creating survey');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Survey</h1>
          <p className="text-gray-600">Design your survey step by step</p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {apiError}
          </div>
        )}

        <form>
          {/* General Information */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">General Information</h2>

            <div className="space-y-4">
              <FormInput
                label="Survey Title *"
                placeholder="E.g.: Library Service Evaluation"
                {...register('title')}
                error={errors.title?.message}
              />

              <FormTextarea
                label="Description"
                rows={3}
                placeholder="Describe the purpose of this survey..."
                {...register('description')}
                error={errors.description?.message}
              />

              {/* Start Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time (Ecuador Time - UTC-5)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Date"
                    type="date"
                    {...register('settings.startDate')}
                    error={errors.settings?.startDate?.message}
                  />
                  <FormInput
                    label="Time"
                    type="time"
                    {...register('settings.startTime')}
                    error={errors.settings?.startTime?.message}
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time (Ecuador Time - UTC-5)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Date"
                    type="date"
                    {...register('settings.endDate')}
                    error={errors.settings?.endDate?.message}
                  />
                  <FormInput
                    label="Time"
                    type="time"
                    {...register('settings.endTime')}
                    error={errors.settings?.endTime?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Access"
                  {...register('settings.access')}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                    { value: 'token', label: 'Token Required' }
                  ]}
                  error={errors.settings?.access?.message}
                />

                <FormInput
                  label="Maximum Responses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  {...register('settings.maxResponses')}
                  error={errors.settings?.maxResponses?.message}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Questions ({fields.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Question</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4">❓</div>
                <p>No questions yet. Click "Add Question" to start.</p>
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
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              <Save size={18} className="inline mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              <Eye size={18} className="inline mr-2" />
              {isSubmitting ? 'Publishing...' : 'Publish Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Question Item Component
const QuestionItem = ({ qIndex, control, register, remove, watch, errors, questionTypes }) => {
  const questionType = watch(`questions.${qIndex}.type`);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-gray-600">
          Question {qIndex + 1}
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
          placeholder="Write your question here..."
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
            <span className="text-sm text-gray-700">Required</span>
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
      <label className="block text-sm font-medium text-gray-700">Options:</label>
      {value.map((option, oIndex) => (
        <div key={oIndex} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder={`Option ${oIndex + 1}`}
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
        + Add Option
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SurveyBuilder;