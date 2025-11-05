const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateUserPreferences, validateObjectId } = require('../middleware/validation');
const { cacheService } = require('../utils/cache');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        preferences: req.user.preferences,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching your profile'
    });
  }
});

// Update user preferences
router.put('/preferences', auth, validateUserPreferences, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    );

    // Clear user-specific cache
    cacheService.clearUserCache(req.user._id);

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: 'An error occurred while updating your preferences'
    });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    // Try to get from cache first
    const cachedPreferences = cacheService.getCachedUserPreferences(req.user._id);
    if (cachedPreferences) {
      return res.json({ preferences: cachedPreferences });
    }

    const user = await User.findById(req.user._id).select('preferences');
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Cache the preferences
    cacheService.cacheUserPreferences(req.user._id, user.preferences);

    res.json({
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch preferences',
      message: 'An error occurred while fetching your preferences'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = {};

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Username already taken'
        });
      }
      updateData.username = username;
    }

    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already registered'
        });
      }
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating your profile'
    });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing your password'
    });
  }
});

// Deactivate account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password is required to deactivate account'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Password is incorrect'
      });
    }

    // Deactivate account
    user.isActive = false;
    await user.save();

    // Clear user cache
    cacheService.clearUserCache(req.user._id);

    res.json({
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({
      error: 'Failed to deactivate account',
      message: 'An error occurred while deactivating your account'
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedArticles', 'title publishedAt')
      .populate('bookmarkedArticles', 'title publishedAt');

    const stats = {
      totalSavedArticles: user.savedArticles.length,
      totalBookmarkedArticles: user.bookmarkedArticles.length,
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      preferences: {
        categories: user.preferences.categories?.length || 0,
        sources: user.preferences.sources?.length || 0,
        keywords: user.preferences.keywords?.length || 0
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'An error occurred while fetching your statistics'
    });
  }
});

module.exports = router;
