import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getMySurveys
} from '../controllers/surveyController.js';
import { protect } from '../middlewares/auth.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = express.Router();

// Rutas públicas con caché
router.get('/', cacheMiddleware(300), getSurveys); // seconds
router.get('/:id', cacheMiddleware(600), getSurvey); // 

// Rutas protegidas
router.get('/my/surveys', protect, getMySurveys);
router.post('/', protect, createSurvey);
router.put('/:id', protect, updateSurvey);
router.delete('/:id', protect, deleteSurvey);

export default router;