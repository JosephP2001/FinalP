import express from 'express';
import {
  submitResponse,
  getSurveyResponses,
  getSurveyStats
} from '../controllers/responseController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Ruta pública - submit response
router.post('/', submitResponse);

// Rutas protegidas - ver respuestas
router.get('/survey/:surveyId', protect, getSurveyResponses);
router.get('/survey/:surveyId/stats', protect, getSurveyStats);

export default router;