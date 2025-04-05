import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema({
    institutionName: { type: String, required: true },
    institutionType: {
      type: String,
      enum: ['Private', 'Public', 'Government', 'Autonomous'],
      required: true
    },
    affiliation: String,
    registrationNumber: String,
    yearOfEstablishment: Number,
    website: String,
    logo: String, 
     documents: [
      {
        filename: String,
        url: String,
        key: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ], // ✅ changed from embedded to string
    infrastructureImages: [String],
    isverified : {type : Boolean, default : false}, // ✅ same
    ratingRequested: Boolean,
    report: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    reportChallenged: [mongoose.Schema.Types.Mixed]
  });

  export default mongoose.model('University', UniversitySchema);