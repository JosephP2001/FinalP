import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Traditional auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user.toJSON()))}`);
    } catch (error) {
      console.error('GitHub callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }
);

export default router;