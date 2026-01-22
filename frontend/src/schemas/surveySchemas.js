import { z } from 'zod';

// Individual question validation
const questionSchema = z.object({
  text: z
    .string()
    .min(1, 'Question text is required')
    .min(5, 'Question must be at least 5 characters'),
  type: z.enum(['text', 'multiple', 'scale', 'date']),
  options: z
    .array(z.string())
    .optional()
    .default([]),
  required: z.boolean().default(false)
});

// Main survey validation
export const surveySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  settings: z.object({
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    startTime: z.string().optional().or(z.literal('')),
    endTime: z.string().optional().or(z.literal('')),
    access: z.enum(['public', 'private', 'token']),
    maxResponses: z
      .union([z.string(), z.number()])
      .optional()
      .transform(val => {
        if (!val || val === '') return null;
        return typeof val === 'string' ? parseInt(val) : val;
      })
  }),
  
  // Critical: Add question validation
  questions: z
    .array(questionSchema)
    .min(1, 'You must add at least one question')
}).refine(data => {
  // Date validation: end date must be after start date
  if (data.settings.startDate && data.settings.endDate) {
    const startDateTime = `${data.settings.startDate}T${data.settings.startTime || '00:00'}`;
    const endDateTime = `${data.settings.endDate}T${data.settings.endTime || '23:59'}`;
    return new Date(endDateTime) > new Date(startDateTime);
  }
  return true;
}, {
  message: 'End date and time must be after start date and time',
  path: ['settings', 'endDate']
}).refine(data => {
  // Multiple choice questions validation
  const multipleQuestions = data.questions.filter(q => q.type === 'multiple');
  return multipleQuestions.every(q => {
    // Filter empty options
    const validOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
    return validOptions.length >= 2;
  });
}, {
  message: 'Multiple choice questions must have at least 2 valid options',
  path: ['questions']
});

export { questionSchema };