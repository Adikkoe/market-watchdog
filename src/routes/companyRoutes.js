const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Companies list
router.get('/companies', authMiddleware, async (req, res) => {
  try {
    const { search, industry } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { country: { contains: search } }
      ];
    }
    if (industry) {
      where.industry = industry;
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    const industries = await prisma.company.findMany({
      select: { industry: true },
      distinct: ['industry'],
      orderBy: { industry: 'asc' }
    });

    res.render('companies', {
      title: 'Companies',
      user: req.user,
      companies,
      industries: industries.map(i => i.industry),
      search: search || '',
      selectedIndustry: industry || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading companies.');
  }
});

// Single company
router.get('/companies/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        promotions: { orderBy: { createdAt: 'desc' }, take: 10 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
        snapshots: { orderBy: { snapshotDate: 'desc' }, take: 6 }
      }
    });
    if (!company) {
      return res.status(404).send('Company not found.');
    }
    res.render('company', { title: company.name, user: req.user, company });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading company.');
  }
});

module.exports = router;
