import express from 'express';
import {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getMySurveys,
  getAIAnalysis,
  getAllSurveysAdmin
} from '../controllers/surveyController.js';
import { protect } from '../middlewares/auth.js';
import { isAdmin, isOwnerOrAdmin } from '../middlewares/authorize.js'; // ✅ NEW
import { cacheMiddleware } from '../middlewares/cache.js';

const router = express.Router();

// Public routes (with cache)
router.get('/', cacheMiddleware(300), getSurveys);
router.get('/:id', cacheMiddleware(600), getSurvey);

// Protected routes - All authenticated users
router.get('/my/surveys', protect, getMySurveys);
router.post('/', protect, createSurvey); // Anyone can create

// Protected routes - Owner or Admin only
router.put('/:id', protect, isOwnerOrAdmin, updateSurvey);
router.delete('/:id', protect, isOwnerOrAdmin, deleteSurvey);
router.get('/:id/ai-analysis', protect, isOwnerOrAdmin, getAIAnalysis);

// Admin-only routes
router.get('/admin/all-surveys', protect, isAdmin, getAllSurveysAdmin);

export default router;