// backend/src/controllers/adminController.js

import User from '../models/User.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';

/**
 * @desc    Get all users with their statistics
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users excluding password field
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Calculate survey and response counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const surveyCount = await Survey.countDocuments({ creator: user._id });
        const responseCount = await Response.countDocuments({ user: user.email });
        
        return {
          ...user.toJSON(),
          surveyCount,
          responseCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a user and all their related data
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all surveys created by this user
    const deletedSurveys = await Survey.deleteMany({ creator: id });

    // Delete all responses submitted by this user
    const deletedResponses = await Response.deleteMany({ user: user.email });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: user.email,
        deletedSurveys: deletedSurveys.deletedCount,
        deletedResponses: deletedResponses.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update user role (user <-> admin)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Survey statistics
    const totalSurveys = await Survey.countDocuments();
    const activeSurveys = await Survey.countDocuments({ status: 'active' });
    const draftSurveys = await Survey.countDocuments({ status: 'draft' });
    const closedSurveys = await Survey.countDocuments({ status: 'closed' });
    
    // Response statistics
    const totalResponses = await Response.countDocuments();

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Most active users (by survey creation count)
    const topCreators = await Survey.aggregate([
      {
        $group: {
          _id: '$creator',
          surveyCount: { $sum: 1 }
        }
      },
      { $sort: { surveyCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          surveyCount: 1
        }
      }
    ]);

    // Most responded surveys
    const topSurveys = await Response.aggregate([
      {
        $group: {
          _id: '$survey',
          responseCount: { $sum: 1 }
        }
      },
      { $sort: { responseCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'surveys',
          localField: '_id',
          foreignField: '_id',
          as: 'surveyInfo'
        }
      },
      { $unwind: '$surveyInfo' },
      {
        $project: {
          _id: 0,
          surveyId: '$_id',
          title: '$surveyInfo.title',
          responseCount: 1,
          status: '$surveyInfo.status'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          regular: totalUsers - totalAdmins,
          recentSignups: recentUsers
        },
        surveys: {
          total: totalSurveys,
          active: activeSurveys,
          draft: draftSurveys,
          closed: closedSurveys
        },
        responses: {
          total: totalResponses,
          averagePerSurvey: totalSurveys > 0 ? (totalResponses / totalSurveys).toFixed(2) : 0
        },
        topCreators,
        topSurveys
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get detailed user information
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's surveys
    const surveys = await Survey.find({ creator: id })
      .select('title status createdAt')
      .sort({ createdAt: -1 });

    // Get user's responses
    const responses = await Response.find({ user: user.email })
      .populate('survey', 'title')
      .select('survey submittedAt')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        surveys: {
          count: surveys.length,
          list: surveys
        },
        responses: {
          count: responses.length,
          list: responses
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};