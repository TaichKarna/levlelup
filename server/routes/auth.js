import express from 'express';
import  {login, register, verifyUniversity, addUserToUniversity, logout, oauthCallback, getUsersForUniversity, deleteUserFromUniversity,getCurrentUser } from '../controllers/auth.js';
import passport from 'passport';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// Local auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-university', authenticateToken, isAdmin, verifyUniversity);
router.post('/add-user', authenticateToken, addUserToUniversity);

router.get('/get-users', authenticateToken, getUsersForUniversity)
router.delete('/delete/:userId' , authenticateToken, deleteUserFromUniversity)
router.get('/me', authenticateToken, getCurrentUser)

// router.get('/verify-email/:token', authController.verifyEmail);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password/:token', authController.resetPassword);
// router.get('/me', authenticateToken, authController.getCurrentUser);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), oauthCallback);

export default router;