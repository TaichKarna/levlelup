import express from 'express';
import * as userController from '../controllers/user.js';

const router = express.Router();

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;