// Suvarna

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database.js';
import { generateDeviceFingerprint } from '../utils/helpers.js';
import { SESSION_TIMEOUT } from '../utils/constants.js';

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser!=null) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          role,
          is_email_verified: true,
        },
      ])
      .select()
      .single();

    if (error!=null) throw error;

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now login.',
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

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if ((error!=null) || (user==null)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
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
  getProfile
};