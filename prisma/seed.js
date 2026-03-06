const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Data pools ─────────────────────────────────────────────────────────────

const industries = [
  'E-Commerce', 'SaaS', 'FinTech', 'HealthTech', 'EdTech',
  'Logistics', 'Retail', 'Media', 'Cybersecurity', 'AI & ML',
  'Gaming', 'Travel', 'Real Estate', 'Food & Beverage', 'Automotive'
];

const countries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
  'Australia', 'India', 'Brazil', 'Netherlands', 'Sweden',
  'Singapore', 'Japan', 'South Korea', 'Spain', 'Italy'
];

const alertTypes = [
  'PRICE_CHANGE', 'NEW_PROMOTION', 'TRAFFIC_SPIKE', 'REVENUE_DROP',
  'COMPETITOR_LAUNCH', 'MARKET_ENTRY', 'PARTNERSHIP', 'FUNDING_ROUND'
];

const alertSeverities = ['LOW', 'MEDIUM', 'HIGH'];

const promotionTitles = [
  'Summer Sale', 'Black Friday Deal', 'Flash Discount', 'Loyalty Reward',
  'New User Offer', 'Bundle Deal', 'Clearance Sale', 'Holiday Special',
  'Referral Bonus', 'Anniversary Offer'
];

// ─── Company name generator ──────────────────────────────────────────────────

const prefixes = [
  'Nova', 'Apex', 'Zenith', 'Titan', 'Vortex', 'Nexus', 'Pulse', 'Orbit',
  'Flux', 'Core', 'Edge', 'Peak', 'Prism', 'Sigma', 'Helix', 'Axon',
  'Blaze', 'Crest', 'Drift', 'Echo', 'Forge', 'Grid', 'Haven', 'Ionic',
  'Jade', 'Kite', 'Lumen', 'Mira', 'Neon', 'Onyx', 'Pixel', 'Quest',
  'Raven', 'Solar', 'Terra', 'Ultra', 'Valor', 'Wave', 'Xenon', 'Yield',
  'Zeal', 'Arch', 'Bolt', 'Cyan', 'Dawn', 'Ember', 'Fable', 'Glow',
  'Halo', 'Iris'
];

const suffixes = [
  'Tech', 'Labs', 'Works', 'Hub', 'Corp', 'Systems', 'Solutions', 'Group',
  'Digital', 'Cloud', 'AI', 'Net', 'Soft', 'Data', 'Ventures', 'Analytics',
  'Media', 'Dynamics', 'Platforms', 'Services'
];

function generateCompanyName(index) {
  return `${prefixes[index % prefixes.length]} ${suffixes[index % suffixes.length]}`;
}

// ─── Main seed function ──────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.userActivityLog.deleteMany();
  await prisma.comparisonHistory.deleteMany();
  await prisma.snapshot.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin users ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('123456', 10);

  const admin1 = await prisma.user.create({
    data: {
      name: 'Admin One',
      email: 'admin1@marketwatchdog.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      name: 'Admin Two',
      email: 'admin2@marketwatchdog.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // ── Regular users ────────────────────────────────────────────────────────
  const userNames = [
    'Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown',
    'Eva Martinez', 'Frank Wilson', 'Grace Lee', 'Henry Taylor',
    'Isla Anderson', 'Jack Thomas'
  ];

  const regularUsers = [];
  for (let i = 0; i < userNames.length; i++) {
    const firstName = userNames[i].split(' ')[0].toLowerCase();
    const u = await prisma.user.create({
      data: {
        name: userNames[i],
        email: `${firstName}@example.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'USER'
      }
    });
    regularUsers.push(u);
  }

  console.log(`Created ${2 + regularUsers.length} users`);

  // ── Companies ────────────────────────────────────────────────────────────
  const companies = [];
  for (let i = 0; i < 100; i++) {
    const name = generateCompanyName(i);
    const industry = industries[i % industries.length];
    const country = countries[i % countries.length];
    const revenue = parseFloat(rand(50000, 5000000).toFixed(2));
    const traffic = randInt(10000, 2000000);
    const conversionRate = parseFloat(rand(0.5, 8.0).toFixed(2));
    const avgOrderValue = parseFloat(rand(20, 500).toFixed(2));
    const marketActivityScore = parseFloat(rand(1, 10).toFixed(1));
    const growthSignalScore = parseFloat(rand(1, 10).toFixed(1));

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        country,
        website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
        estimatedMonthlyRevenue: revenue,
        trafficEstimate: traffic,
        conversionRate,
        averageOrderValue: avgOrderValue,
        marketActivityScore,
        growthSignalScore,
        createdAt: daysAgo(randInt(30, 365))
      }
    });
    companies.push(company);
  }

  console.log(`Created ${companies.length} companies`);

  // ── Promotions ───────────────────────────────────────────────────────────
  let promotionCount = 0;
  for (const company of companies) {
    const count = randInt(1, 4);
    for (let j = 0; j < count; j++) {
      const startOffset = randInt(1, 60);
      const duration = randInt(7, 30);
      await prisma.promotion.create({
        data: {
          companyId: company.id,
          title: pick(promotionTitles),
          description: `Special offer from ${company.name}: save big this season.`,
          discount: parseFloat(rand(5, 50).toFixed(1)),
          startDate: daysAgo(startOffset + duration),
          endDate: daysAgo(startOffset),
          createdAt: daysAgo(startOffset + duration)
        }
      });
      promotionCount++;
    }
  }

  console.log(`Created ${promotionCount} promotions`);

  // ── Alerts ───────────────────────────────────────────────────────────────
  let alertCount = 0;
  for (const company of companies) {
    const count = randInt(1, 5);
    for (let j = 0; j < count; j++) {
      const type = pick(alertTypes);
      const severity = pick(alertSeverities);
      await prisma.alert.create({
        data: {
          companyId: company.id,
          type,
          message: `${company.name}: ${type.replace(/_/g, ' ').toLowerCase()} detected.`,
          severity,
          createdAt: daysAgo(randInt(0, 90))
        }
      });
      alertCount++;
    }
  }

  console.log(`Created ${alertCount} alerts`);

  // ── Snapshots ────────────────────────────────────────────────────────────
  let snapshotCount = 0;
  for (const company of companies) {
    for (let month = 5; month >= 0; month--) {
      const variance = rand(0.85, 1.15);
      await prisma.snapshot.create({
        data: {
          companyId: company.id,
          revenue: parseFloat((company.estimatedMonthlyRevenue * variance).toFixed(2)),
          traffic: Math.floor(company.trafficEstimate * variance),
          conversionRate: parseFloat((company.conversionRate * rand(0.9, 1.1)).toFixed(2)),
          marketActivityScore: parseFloat((company.marketActivityScore * rand(0.9, 1.1)).toFixed(1)),
          growthSignalScore: parseFloat((company.growthSignalScore * rand(0.9, 1.1)).toFixed(1)),
          snapshotDate: daysAgo(month * 30)
        }
      });
      snapshotCount++;
    }
  }

  console.log(`Created ${snapshotCount} snapshots`);

  // ── Comparison History ───────────────────────────────────────────────────
  const allUsers = [admin1, admin2, ...regularUsers];
  let comparisonCount = 0;
  for (let i = 0; i < 30; i++) {
    const user = pick(allUsers);
    const idxA = randInt(0, 98);
    const idxB = randInt(idxA + 1, 99);
    const cA = companies[idxA];
    const cB = companies[idxB];
    const winner = cA.growthSignalScore >= cB.growthSignalScore ? cA.name : cB.name;
    await prisma.comparisonHistory.create({
      data: {
        userId: user.id,
        companyAId: cA.id,
        companyBId: cB.id,
        resultSummary: `Comparison between ${cA.name} and ${cB.name}. Growth leader: ${winner}.`,
        createdAt: daysAgo(randInt(0, 60))
      }
    });
    comparisonCount++;
  }

  console.log(`Created ${comparisonCount} comparison history records`);

  // ── Activity Logs ────────────────────────────────────────────────────────
  const actions = ['LOGIN', 'VIEW_COMPANY', 'COMPARE', 'VIEW_ALERTS'];
  let logCount = 0;
  for (const user of allUsers) {
    for (let i = 0; i < randInt(3, 8); i++) {
      const action = pick(actions);
      await prisma.userActivityLog.create({
        data: {
          userId: user.id,
          action,
          details: `User ${user.email} performed ${action}.`,
          createdAt: daysAgo(randInt(0, 30))
        }
      });
      logCount++;
    }
  }

  console.log(`Created ${logCount} activity log entries`);
  console.log('\nSeed complete!');
  console.log('\nAdmin credentials:');
  console.log('  admin1@marketwatchdog.com / 123456');
  console.log('  admin2@marketwatchdog.com / 123456');
  console.log('\nSample user credentials:');
  console.log('  alice@example.com / password123');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
