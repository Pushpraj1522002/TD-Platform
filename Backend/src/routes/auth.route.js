import express from 'express';
import { forgotPassword, getMe, login, logout, OAuthLogin, OAuthSignup, resetPassword, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', getMe);

// Google Authentication Routes

/**
 * Login with Google
 * This endpoint verifies the Google token and checks if the user exists
 * If the user exists, it logs them in
 * If not, it returns an error indicating the user needs to sign up
 */
router.post('/google/login', OAuthLogin);

/**
 * Signup with Google
 * This endpoint verifies the Google token and creates a new user if they don't exist
 * If the user already exists, it logs them in
 */
router.post('/google/signup', OAuthSignup);


/**
 * Set password for a Google-authenticated user
 * This endpoint allows users who signed up with Google to set a password
 * so they can also log in with email/password
 */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;