import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate a JWT token for a user
 * @param {Object} user - The user object
 * @returns {string} - The JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name || user.user_metadata?.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token
 * @returns {Object} - The decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    throw new Error('Invalid token');
  }
}; 