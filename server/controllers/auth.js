import User from '../models/user.model.js';
import University from '../models/university.model.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email.js';
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
  try {
    const { username, email, password, university: uniData } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Check for existing university
    let university = await University.findOne({ institutionName: uniData.institutionName });

    if (!university) {
      const {
        institutionName,
        institutionType,
        affiliation,
        registrationNumber,
        yearOfEstablishment,
        website,
        logo = '',
        documents = [],
        infrastructureImages = [],
        ratingRequested = false,
        report = {},
        reportChallenged = [],
      } = uniData;

      university = new University({
        institutionName,
        institutionType,
        affiliation,
        registrationNumber,
        yearOfEstablishment,
        website,
        logo,
        documents,
        infrastructureImages,
        ratingRequested,
        report,
        reportChallenged,
      });

      await university.save();
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      username,
      email,
      password,
      provider: 'local',
      verificationToken,
      university: university._id,
    });

    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    const responseMsg = university.isverified
      ? 'User registered. Please verify your email.'
      : 'University is pending admin approval. Login after approval.';

    res.status(201).json({ message: responseMsg });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('university');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    console.log(user.university)

    if (!user.university.isverified) {
      return res.status(403).json({ message: 'University not verified yet. Contact admin.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        university: user.university.institutionName,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// POST /api/admin/verify-university
export const verifyUniversity = async (req, res) => {
  try {
    
    const { institutionName } = req.body;
    const uni = await University.findOne({ institutionName });
    if (!uni) return res.status(404).json({ message: 'University not found' });

    uni.isverified = true;
    await uni.save();

    res.json({ message: `University '${institutionName}' verified successfully.` });
  } catch (err) {
    console.error('Admin verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addUserToUniversity = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const adder = await User.findById(req.user.id);

    if (!adder || adder.role !== 'university') {
      return res.status(403).json({ message: 'Only university admins can add users' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const newUser = new User({
      username,
      email,
      password,
      university: adder.university,
      provider: 'local',
      isverified: true // optional: auto-verify if added by university
    });

    await newUser.save();

    res.status(201).json({ message: 'User added successfully under university' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/university/users
export const getUsersForUniversity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('university');

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.role !== 'university') {
      return res.status(403).json({ message: 'Access denied. Only university admins can access this.' });
    }

    const users = await User.find({ university: user.university._id }).select('-password');

    res.json(users);
  } catch (error) {
    console.error('Error fetching university users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/university/users/:userId
export const deleteUserFromUniversity = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.id);
    const { userId } = req.params;

    if (!requestingUser || requestingUser.role !== 'university') {
      return res.status(403).json({ message: 'Only university admins can delete users' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.university.toString() !== requestingUser.university.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this user' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// import User from '../models/user.model.js';
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
// import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

// // Register new user
// export const register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { username }] 
//     });
    
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: 'User with this email or username already exists' 
//       });
//     }
    
//     // Create verification token
//     const verificationToken = crypto.randomBytes(32).toString('hex');
    
//     // Create new user
//     const user = new User({
//       username,
//       email,
//       password,
//       provider: 'local',
//       verificationToken
//     });
    
//     await user.save();
    
//     // Send verification email
//     await sendVerificationEmail(user.email, verificationToken);
    
//     res.status(201).json({ 
//       message: 'User registered successfully. Please verify your email.' 
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Login user
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
    
//     // Check if user is verified (for local accounts)
//     if (user.provider === 'local' && !user.isverified) {
//       return res.status(403).json({ 
//         message: 'Please verify your email before logging in' 
//       });
//     }
    
//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }
    
//     // Generate tokens
//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
    
//     // Set refresh token in HTTP-only cookie
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     });
    
//     res.json({
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         profilePicture: user.profilePicture,
//         provider: user.provider
//       },
//       accessToken
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Logout user
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// // Verify email
// export const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
    
//     const user = await User.findOne({ verificationToken: token });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid verification token' });
//     }
    
//     user.isverified = true;
//     user.verificationToken = undefined;
//     await user.save();
    
//     res.json({ message: 'Email verified successfully. You can now login.' });
//   } catch (error) {
//     console.error('Email verification error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Forgot password
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await user.save();
    
//     await sendPasswordResetEmail(user.email, resetToken);
    
//     res.json({ message: 'Password reset link sent to your email' });
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Reset password
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
    
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }
    
//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();
    
//     res.json({ message: 'Password reset successful' });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// OAuth callback
export const oauthCallback = async (req, res) => {
  try {
    const user = req.user;
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Redirect to frontend with access token
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

// // Helper functions for token generation
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};