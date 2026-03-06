const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const adminMiddleware = require('../middleware/adminMiddleware');

const prisma = new PrismaClient();

// Admin dashboard
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [users, comparisons, activityLogs] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.comparisonHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: true, companyA: true, companyB: true }
      }),
      prisma.userActivityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: true }
      })
    ]);
    res.render('admin', {
      title: 'Admin Panel',
      user: req.user,
      users,
      comparisons,
      activityLogs
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading admin panel.');
  }
});

// Block/unblock user
router.post('/users/:id/toggle-block', adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).send('User not found.');

    await prisma.user.update({
      where: { id },
      data: { isBlocked: !target.isBlocked }
    });

    await prisma.userActivityLog.create({
      data: {
        userId: req.user.id,
        action: target.isBlocked ? 'UNBLOCK_USER' : 'BLOCK_USER',
        details: `Admin ${req.user.email} ${target.isBlocked ? 'unblocked' : 'blocked'} user ${target.email}.`
      }
    });

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error toggling user block status.');
  }
});

module.exports = router;
