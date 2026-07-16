const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentProfile, CompanyProfile } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const { email, password, role, full_name, company_name } = req.body;

    // Validate role
    if (!['student', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({ email, password_hash, role });

    // Create role-specific profile
    if (role === 'student') {
      await StudentProfile.create({ user_id: user.id, full_name: full_name || '' });
    } else if (role === 'company') {
      await CompanyProfile.create({ user_id: user.id, company_name: company_name || '' });
    }

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: { id: req.user.id, email: req.user.email, role: req.user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };