
import Survey from '../models/Survey.js';

// Verify user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden acceder a este recurso'
    });
  }
  next();
};

// Verify user owns the resource OR is admin
export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Encuesta no encontrada'
      });
    }

    const isOwner = survey.creator.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar esta encuesta'
      });
    }

    req.survey = survey; // Attach to request for reuse
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};