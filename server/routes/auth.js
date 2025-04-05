import express from 'express';
import * as authController from '../controllers/auth.js';
import passport from 'passport';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Local auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/me', authenticateToken, authController.getCurrentUser);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), authController.oauthCallback);

export default router;