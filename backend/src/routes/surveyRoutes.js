/*
*Added:I analysis route (DONE)
*/

import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getMySurveys,
  getAIAnalysis
} from '../controllers/surveyController.js';
import { protect } from '../middlewares/auth.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = express.Router();

// Public routes (with caché)
router.get('/', cacheMiddleware(300), getSurveys);
router.get('/:id', cacheMiddleware(600), getSurvey);

// Protected routes
router.get('/my/surveys', protect, getMySurveys);
router.post('/', protect, createSurvey);
router.put('/:id', protect, updateSurvey);
router.delete('/:id', protect, deleteSurvey);

// AI analysis route
router.get('/:id/ai-analysis', protect, getAIAnalysis);

export default router;