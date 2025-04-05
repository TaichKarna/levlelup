import User from "../models/user.model.js";
 // Adjust path as needed

export const getProfile = async (req, res) => {
  try {
    // Ensure the middleware sets req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('university', 'name location logo');

    console.log('User profile:', user); // Debugging line

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, profilePicture } = req.body;
    
    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          username: username || undefined,
          profilePicture: profilePicture || undefined
        } 
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For OAuth users who don't have a password yet
    if (!user.password && user.provider !== 'local') {
      user.password = newPassword;
      await user.save();
      return res.json({ message: 'Password set successfully' });
    }
    
    // For local users, check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};