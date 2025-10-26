// Suvarna

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/database.js';
import { generateDeviceFingerprint } from '../utils/helpers.js';
import { SESSION_TIMEOUT } from '../utils/constants.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiry

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          role,
          is_email_verified: false, // <-- CHANGED
          verification_token: verificationToken, // <-- ADDED
          verification_token_expires: verificationTokenExpires, // <-- ADDED
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // --- Send verification email ---
    const verificationURL = `${process.env.SITE_URL}/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Quiz App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm Your Signup',
      html: `
        <h2>Confirm your signup</h2>
        <p>Follow this link to confirm your user:</p>
        <p><a href="${verificationURL}">Confirm your mail</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    // --- End of email sending ---

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.', // <-- CHANGED
      data: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // --- ADD THIS CHECK ---
    if (!user.is_email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }
    // --- END OF ADDED CHECK ---

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Deactivate any existing active sessions (single device login)
    await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Create new session
    const deviceFingerprint = generateDeviceFingerprint(req);
    const sessionExpiry = new Date(Date.now() + SESSION_TIMEOUT);

    await supabaseAdmin.from('user_sessions').insert([
      {
        user_id: user.id,
        device_fingerprint: deviceFingerprint,
        session_token: token,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        expires_at: sessionExpiry,
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('<h1>Verification token is missing.</h1>');
    }

    // Find user by token
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, verification_token_expires')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return res.status(400).send('<h1>Invalid verification token.</h1>');
    }

    // Check if token is expired
    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).send('<h1>Verification token has expired.</h1>');
    }

    // Update user to be verified
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_email_verified: true,
        verification_token: null, // Clear the token
        verification_token_expires: null, // Clear the expiry
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Redirect user to your frontend login page with a success message
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?verified=false`);
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Deactivate session
    await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('session_token', token);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error!=null) throw error;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};

export {
  register,
  login,
  logout,
  verifyEmail,
  getProfile
};