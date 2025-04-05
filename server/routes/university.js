import express from 'express';
import { 
  documentUploadMiddleware, 
  infrastructureUploadMiddleware,
  uploadDocuments, 
  uploadInfrastructure,
  getUniversityDocs,
  getInfrastructureImages,
  deleteDocument,
  requestRating,
  challengeReport
} from '../controllers/university.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// University document routes
router.post('/upload-documents', authenticateToken, documentUploadMiddleware, uploadDocuments);
router.get('/docs', authenticateToken, getUniversityDocs);
router.delete('/docs/:docId', authenticateToken, deleteDocument);

// University infrastructure routes
router.post('/upload-infrastructure', authenticateToken, infrastructureUploadMiddleware, uploadInfrastructure);
router.get('/infrastructure', authenticateToken, getInfrastructureImages);

// Rating and challenge routes
router.post('/request-rating', authenticateToken, requestRating);
router.post('/challenge-report', authenticateToken, challengeReport);
export default router;