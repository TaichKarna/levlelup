import universityModel from "../models/university.model.js";

// POST /api/admin/generate-report/:universityId
export const generateRatingReport = async (req, res) => {
    try {
      const { universityId } = req.params;
      const university = await universityModel.findById(universityId);
  
      // Simulated ML logic (replace with actual ML model)
      const score = Math.floor(Math.random() * 100) + 1;
      const summary = score > 70 ? 'Excellent University' : 'Needs Improvement';
  
      university.report = {
        score,
        summary,
        generatedAt: new Date(),
      };
      await university.save();
  
      res.status(200).json({ message: 'Report generated', report: university.report });
    } catch (err) {
      res.status(500).json({ message: 'Failed to generate report', error: err });
    }
  };

  
// GET /api/admin/report-challenges
export const getAllReportChallenges = async (req, res) => {
    try {
      const challengedUniversities = await universityModel.find(
        { reportChallengeHistory: { $exists: true, $not: { $size: 0 } } },
        {
          institutionName: 1,
          report: 1,
          reportChallengeHistory: 1,
        }
      );
  
      res.status(200).json({ universities: challengedUniversities });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch challenge history', error: err });
    }
  };


  // PATCH /api/admin/respond-to-challenge/:universityId/:challengeIndex
  export const respondToChallenge = async (req, res) => {
    try {
      const { universityId, challengeIndex } = req.params;
      const { response, status } = req.body; // status can be 'Resolved', 'Rejected', etc.
      
      const university = await universityModel.findById(universityId);
      if (!university || !universityModel.reportChallengeHistory[challengeIndex]) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      universityModel.reportChallengeHistory[challengeIndex].response = response;
      universityModel.reportChallengeHistory[challengeIndex].status = status;
      universityModel.reportChallengeHistory[challengeIndex].respondedAt = new Date();
      
      await university.save();
      res.status(200).json({ message: 'Challenge response updated' });
    } catch (err) {
      console.error('Respond to challenge error:', err);
      res.status(500).json({ message: 'Failed to update challenge response', error: err.message });
    }
  };