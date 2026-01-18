import { z } from 'zod';

export const surveySchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  settings: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    access: z.enum(['public', 'private', 'token']),
    maxResponses: z
      .string()
      .optional()
      .transform(val => val ? parseInt(val) : null)
  })
}).refine(data => {
  // Validar que endDate sea después de startDate
  if (data.settings.startDate && data.settings.endDate) {
    return new Date(data.settings.endDate) > new Date(data.settings.startDate);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['settings', 'endDate']
});

export const questionSchema = z.object({
  text: z
    .string()
    .min(1, 'El texto de la pregunta es obligatorio')
    .min(5, 'La pregunta debe tener al menos 5 caracteres'),
  type: z.enum(['text', 'multiple', 'scale', 'date']),
  options: z
    .array(z.string())
    .optional()
    .refine((opts) => {
      // Si el tipo es multiple, debe haber al menos 2 opciones
      return true; // La validación se hace en el componente
    }),
  required: z.boolean()
});