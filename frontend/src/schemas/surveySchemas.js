import { z } from 'zod';

// "Sndividual question" Validetion
const questionSchema = z.object({
  text: z
    .string()
    .min(1, 'El texto de la pregunta es obligatorio')
    .min(5, 'La pregunta debe tener al menos 5 caracteres'),
  type: z.enum(['text', 'multiple', 'scale', 'date']),
  options: z
    .array(z.string())
    .optional()
    .default([]),
  required: z.boolean().default(false)
});

// "MAIN SURVEY" validation
export const surveySchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  settings: z.object({
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    access: z.enum(['public', 'private', 'token']),
    maxResponses: z
      .union([z.string(), z.number()])
      .optional()
      .transform(val => {
        if (!val || val === '') return null;
        return typeof val === 'string' ? parseInt(val) : val;
      })
  }),
  // CRÍTICO: Add question validation
  questions: z
    .array(questionSchema)
    .min(1, 'Debes agregar al menos una pregunta')
}).refine(data => {
  // Date validation
  if (data.settings.startDate && data.settings.endDate) {
    return new Date(data.settings.endDate) > new Date(data.settings.startDate);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['settings', 'endDate']
}).refine(data => {
  // "Multiple choise Questions" Validation
  const multipleQuestions = data.questions.filter(q => q.type === 'multiple');
  return multipleQuestions.every(q => {
    // "Empty Options" Filter
    const validOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
    return validOptions.length >= 2;
  });
}, {
  message: 'Las preguntas de opción múltiple deben tener al menos 2 opciones válidas',
  path: ['questions']
});

export { questionSchema };