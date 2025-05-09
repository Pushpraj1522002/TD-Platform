import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Verify a Google ID token
 * @param {string} token - The ID token from Google
 * @returns {Promise<Object>} - The decoded token payload
 */
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Verify a Google authorization code
 * @param {string} code - The authorization code from Google
 * @returns {Promise<Object>} - The token info
 */
export const verifyGoogleCode = async (code) => {
  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'postmessage' // This is a special value for client-side flow
    });
    
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    return {
      payload: ticket.getPayload(),
      tokens
    };
  } catch (error) {
    console.error('Error verifying Google code:', error);
    throw new Error('Invalid Google authorization code');
  }
}; 