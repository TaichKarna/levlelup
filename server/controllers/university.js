import universityModel from "../models/university.model.js";
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer for S3 document uploads
const documentUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'documents/' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure multer for S3 infrastructure image uploads
const infrastructureUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'infrastructure/' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware for document uploads
export const documentUploadMiddleware = documentUpload.array('documents', 10); // Max 10 files

// Middleware for infrastructure image uploads
export const infrastructureUploadMiddleware = infrastructureUpload.array('images', 10); // Max 10 files

// Controller function for document uploads
export const uploadDocuments = async (req, res) => {
  try {
    const universityId = req.user.university;
    
    // Files are already uploaded to S3 by multer-s3
    const uploaded = req.files.map(file => ({
      filename: file.originalname,
      url: file.location, // S3 URL is stored in the location property
      key: file.key,      // Store S3 key for potential deletion later
      uploadedAt: new Date()
    }));
    
    await universityModel.findByIdAndUpdate(universityId, {
      $push: { documents: { $each: uploaded } },
    });
    
    res.status(200).json({ message: 'Documents uploaded successfully', files: uploaded });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// Controller function for infrastructure image uploads
export const uploadInfrastructure = async (req, res) => {
  try {
    const universityId = req.user.university;
    
    const images = req.files.map(file => ({
      filename: file.originalname,
      url: file.location, // S3 URL is stored in the location property
      key: file.key,      // Store S3 key for potential deletion later
      uploadedAt: new Date()
    }));
    
    await universityModel.findByIdAndUpdate(universityId, {
      $push: { infrastructureImages: { $each: images } },
    });
    
    res.status(200).json({ message: 'Infrastructure images uploaded successfully', images });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// GET /api/university/docs - Fetch all documents for a university
export const getUniversityDocs = async (req, res) => {
  try {
    const universityId = req.user.university;
    const university = await universityModel.findById(universityId);
    
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.status(200).json({ documents: university.documents });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
};

// GET /api/university/infrastructure - Fetch all infrastructure images
export const getInfrastructureImages = async (req, res) => {
  try {
    const universityId = req.user.university;
    const university = await universityModel.findById(universityId);
    
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.status(200).json({ images: university.infrastructureImages });
  } catch (err) {
    console.error('Error fetching infrastructure images:', err);
    res.status(500).json({ message: 'Error fetching infrastructure images', error: err.message });
  }
};

// DELETE /api/university/docs/:docId - Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const universityId = req.user.university;
    const { docId } = req.params;
    
    const university = await universityModel.findById(universityId);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    const docToDelete = university.documents.id(docId);
    if (!docToDelete) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete from S3 if key exists
    if (docToDelete.key) {
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: docToDelete.key
      };
      
      await s3.deleteObject(deleteParams).promise();
    }
    
    // Remove from database
    university.documents.pull(docId);
    await university.save();
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete document', error: err.message });
  }
};

// POST /api/university/request-rating
export const requestRating = async (req, res) => {
  try {
    const universityId = req.user.university;
    
    const university = await universityModel.findById(universityId);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    if (university.ratingRequested) {
      return res.status(400).json({ message: 'Rating already requested' });
    }
    
    university.ratingRequested = true;
    await university.save();
    
    res.status(200).json({ message: 'Rating request submitted to admin' });
  } catch (err) {
    console.error('Rating request error:', err);
    res.status(500).json({ message: 'Failed to request rating', error: err.message });
  }
};

// POST /api/university/challenge-report
export const challengeReport = async (req, res) => {
  try {
    const universityId = req.user.university;
    const { reason } = req.body;
    
    const university = await universityModel.findById(universityId);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    if (!university.report?.score) {
      return res.status(400).json({ message: 'No report to challenge' });
    }
    
    university.reportChallengeHistory.push({
      reason,
      challengedAt: new Date(),
      status: 'Pending',
    });
    
    await university.save();
    res.status(200).json({ message: 'Report challenge submitted' });
  } catch (err) {
    console.error('Challenge report error:', err);
    res.status(500).json({ message: 'Challenge submission failed', error: err.message });
  }
};
