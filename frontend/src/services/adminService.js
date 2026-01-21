import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Admin Service
 * Handles all admin-related API calls
 */
export const adminService = {
  /**
   * Get admin dashboard statistics
   * @returns {Promise} Admin stats data
   */
  getStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all users with their statistics
   * @returns {Promise} Array of users
   */
  getAllUsers: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get detailed information about a specific user
   * @param {string} userId - User ID
   * @returns {Promise} User details
   */
  getUserDetails: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users/${userId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a user and all their related data
   * @param {string} userId - User ID to delete
   * @returns {Promise} Deletion result
   */
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/admin/users/${userId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user role (user <-> admin)
   * @param {string} userId - User ID
   * @param {string} role - New role ('user' or 'admin')
   * @returns {Promise} Updated user data
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { role },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default adminService;