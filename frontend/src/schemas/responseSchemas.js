import { z } from 'zod';

export const responseSchema = z.object({
  respondentEmail: z
    .string()
    .min(1, 'El email es obligatorio para responder')
    .email('Email inválido')
    .refine(
      (email) => email.endsWith('@uce.edu.ec') || email.includes('@'),
      'Debe usar un email válido'
    ),
  answers: z.record(z.any()).refine(
    (answers) => Object.keys(answers).length > 0,
    'Debes responder al menos una pregunta'
  )
});