const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Compare page (GET)
router.get('/compare', authMiddleware, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    res.render('compare', {
      title: 'Compare Companies',
      user: req.user,
      companies,
      result: null,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading compare page.');
  }
});

// Compare page (POST)
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { companyAId, companyBId } = req.body;
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });

    if (!companyAId || !companyBId || companyAId === companyBId) {
      return res.render('compare', {
        title: 'Compare Companies',
        user: req.user,
        companies,
        result: null,
        error: 'Please select two different companies.'
      });
    }

    const [companyA, companyB] = await Promise.all([
      prisma.company.findUnique({ where: { id: parseInt(companyAId) } }),
      prisma.company.findUnique({ where: { id: parseInt(companyBId) } })
    ]);

    if (!companyA || !companyB) {
      return res.render('compare', {
        title: 'Compare Companies',
        user: req.user,
        companies,
        result: null,
        error: 'One or both companies not found.'
      });
    }

    // Build result summary
    const winner = companyA.growthSignalScore >= companyB.growthSignalScore ? companyA.name : companyB.name;
    const summary = `Comparison between ${companyA.name} and ${companyB.name}. Growth leader: ${winner}.`;

    // Save to ComparisonHistory
    await prisma.comparisonHistory.create({
      data: {
        userId: req.user.id,
        companyAId: companyA.id,
        companyBId: companyB.id,
        resultSummary: summary
      }
    });

    await prisma.userActivityLog.create({
      data: {
        userId: req.user.id,
        action: 'COMPARE',
        details: `Compared ${companyA.name} vs ${companyB.name}.`
      }
    });

    res.render('compare', {
      title: 'Compare Companies',
      user: req.user,
      companies,
      result: { companyA, companyB, summary },
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error performing comparison.');
  }
});

module.exports = router;
