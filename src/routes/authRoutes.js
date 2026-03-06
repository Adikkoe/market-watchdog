const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Home page
router.get('/', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (e) {}
  }
  res.render('index', { title: 'Market Watchdog', user: null });
});

// Register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.render('register', { title: 'Register', error: 'Email already in use.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'USER' }
    });
    await prisma.userActivityLog.create({
      data: { userId: user.id, action: 'REGISTER', details: `User ${email} registered.` }
    });
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('register', { title: 'Register', error: 'Registration failed. Try again.' });
  }
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
    }
    if (user.isBlocked) {
      return res.render('login', { title: 'Login', error: 'Your account has been blocked.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    await prisma.userActivityLog.create({
      data: { userId: user.id, action: 'LOGIN', details: `User ${email} logged in.` }
    });
    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('login', { title: 'Login', error: 'Login failed. Try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [totalCompanies, totalAlerts, totalPromotions, totalComparisons, recentAlerts] = await Promise.all([
      prisma.company.count(),
      prisma.alert.count(),
      prisma.promotion.count(),
      prisma.comparisonHistory.count(),
      prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { company: true }
      })
    ]);
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      totalCompanies,
      totalAlerts,
      totalPromotions,
      totalComparisons,
      recentAlerts
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard.');
  }
});

// Alerts page
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true }
    });
    res.render('alerts', { title: 'Alerts', user: req.user, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading alerts.');
  }
});

module.exports = router;
