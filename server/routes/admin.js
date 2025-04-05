import express from 'express';
import { generateRatingReport, getAllReportChallenges, respondToChallenge } from "../controllers/admin.js";
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin);

router.get('/generate-report/:universityId', generateRatingReport);
router.get('/getallchallengereports', getAllReportChallenges);
router.post('/respondToChallenge/:challengeId', respondToChallenge);
// router.get('/getAllReports', getAllReportChallenges);

export default router;