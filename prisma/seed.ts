import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '../lib/auth';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'N5DealDemo123!';

async function createAuthUser({
  name,
  email,
  role,
  company,
  location,
  bio,
}: {
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'MANAGER';
  company?: string;
  location?: string;
  bio?: string;
}) {
  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password: DEMO_PASSWORD,
    },
  });

  return prisma.user.update({
    where: { email },
    data: {
      role,
      status: 'ACTIVE',
      company,
      location,
      bio,
      emailVerified: true,
    },
  });
}

async function main() {
  console.log('🌱 Starting database seed...');

  // -------------------------------------------------------
  // CLEAN DATABASE
  // Auth tables must be deleted before User because of FK relations.
  // -------------------------------------------------------

  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();

  await prisma.moderationAction.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------------------------------------
  // AUTH-ENABLED DEMO ACCOUNTS
  // -------------------------------------------------------

  const manager = await createAuthUser({
    name: 'Olivia Morgan',
    email: 'manager@n5deal.demo',
    role: 'MANAGER',
    company: 'N5Deal',
    location: 'London, UK',
    bio: 'Marketplace platform manager.',
  });

  const northstar = await createAuthUser({
    name: 'Alexander Reed',
    email: 'buyer@n5deal.demo',
    role: 'BUYER',
    company: 'Northstar Capital',
    location: 'London, UK',
    bio: 'Private investment firm focused on profitable technology and B2B businesses.',
  });

  await prisma.buyerProfile.create({
    data: {
      userId: northstar.id,
      investmentThesis:
        'We acquire profitable B2B software and technology-enabled businesses with recurring revenue and strong management teams.',
      minDealSize: 2_000_000,
      maxDealSize: 20_000_000,
      industries: ['SaaS', 'Technology', 'Fintech'],
      geographies: ['DACH', 'UK', 'CEE'],
      investmentTypes: ['Private Equity', 'Strategic Acquisition'],
      preferredDealTypes: ['Majority', 'Full Acquisition'],
    },
  });

  const acme = await createAuthUser({
    name: 'Michael Braun',
    email: 'seller@n5deal.demo',
    role: 'SELLER',
    company: 'Acme Holdings',
    location: 'Berlin, Germany',
    bio: 'Founder-led technology holding company.',
  });

  // -------------------------------------------------------
  // OTHER BUYERS
  // These users exist as marketplace demo participants,
  // but they do not need login accounts for this prototype.
  // -------------------------------------------------------

  const baltic = await prisma.user.create({
    data: {
      name: 'Emma Lindberg',
      email: 'emma@balticgrowth.demo',
      emailVerified: true,
      company: 'Baltic Growth Partners',
      role: 'BUYER',
      status: 'ACTIVE',
      location: 'Stockholm, Sweden',
      bio: 'Growth investor focused on Northern and Central European companies.',
      buyerProfile: {
        create: {
          investmentThesis:
            'We invest in profitable growth companies with strong regional expansion potential.',
          minDealSize: 5_000_000,
          maxDealSize: 35_000_000,
          industries: ['Manufacturing', 'Technology', 'Logistics'],
          geographies: ['Nordics', 'CEE', 'DACH'],
          investmentTypes: ['Growth Equity', 'Private Equity'],
          preferredDealTypes: ['Majority', 'Minority'],
        },
      },
    },
  });

  const alpine = await prisma.user.create({
    data: {
      name: 'Daniel Weber',
      email: 'daniel@alpine.demo',
      emailVerified: true,
      company: 'Alpine Private Equity',
      role: 'BUYER',
      status: 'ACTIVE',
      location: 'Munich, Germany',
      bio: 'DACH-focused private equity investor.',
      buyerProfile: {
        create: {
          investmentThesis:
            'We partner with established businesses in Germany, Austria and Switzerland.',
          minDealSize: 8_000_000,
          maxDealSize: 50_000_000,
          industries: ['Manufacturing', 'Healthcare', 'Business Services'],
          geographies: ['Germany', 'Austria', 'Switzerland', 'DACH'],
          investmentTypes: ['Private Equity'],
          preferredDealTypes: ['Majority', 'Full Acquisition'],
        },
      },
    },
  });

  const eastbridge = await prisma.user.create({
    data: {
      name: 'Anna Kowalska',
      email: 'anna@eastbridge.demo',
      emailVerified: true,
      company: 'EastBridge Capital',
      role: 'BUYER',
      status: 'ACTIVE',
      location: 'Warsaw, Poland',
      bio: 'Investment group targeting fast-growing companies in Central and Eastern Europe.',
      buyerProfile: {
        create: {
          investmentThesis:
            'We invest in scalable CEE companies with strong margins and international growth opportunities.',
          minDealSize: 1_000_000,
          maxDealSize: 15_000_000,
          industries: ['SaaS', 'Logistics', 'Professional Services'],
          geographies: ['Poland', 'CEE', 'Baltics'],
          investmentTypes: ['Growth Equity', 'Acquisition'],
          preferredDealTypes: ['Majority', 'Minority'],
        },
      },
    },
  });

  const mednova = await prisma.user.create({
    data: {
      name: 'Sophie Martin',
      email: 'sophie@mednova.demo',
      emailVerified: true,
      company: 'MedNova Ventures',
      role: 'BUYER',
      status: 'ACTIVE',
      location: 'Paris, France',
      bio: 'Healthcare-focused investment company.',
      buyerProfile: {
        create: {
          investmentThesis:
            'We invest in healthcare services, medical technology and digital health companies.',
          minDealSize: 3_000_000,
          maxDealSize: 25_000_000,
          industries: ['Healthcare', 'MedTech', 'Digital Health'],
          geographies: ['France', 'Benelux', 'DACH'],
          investmentTypes: ['Growth Equity', 'Strategic Acquisition'],
          preferredDealTypes: ['Majority', 'Minority'],
        },
      },
    },
  });

  // -------------------------------------------------------
  // OTHER SELLERS
  // -------------------------------------------------------

  const nordic = await prisma.user.create({
    data: {
      name: 'Erik Hansen',
      email: 'erik@nordicindustrial.demo',
      emailVerified: true,
      company: 'Nordic Industrial Group',
      role: 'SELLER',
      status: 'ACTIVE',
      location: 'Copenhagen, Denmark',
      bio: 'Industrial business group operating across Northern Europe.',
    },
  });

  const techventures = await prisma.user.create({
    data: {
      name: 'Laura Rossi',
      email: 'laura@techventures.demo',
      emailVerified: true,
      company: 'Tech Ventures Europe',
      role: 'SELLER',
      status: 'ACTIVE',
      location: 'Milan, Italy',
      bio: 'European technology entrepreneur and investor.',
    },
  });

  const medgroup = await prisma.user.create({
    data: {
      name: 'Thomas Müller',
      email: 'thomas@medgroup.demo',
      emailVerified: true,
      company: 'HealthBridge Group',
      role: 'SELLER',
      status: 'ACTIVE',
      location: 'Frankfurt, Germany',
      bio: 'Operator of healthcare and outpatient medical businesses.',
    },
  });

  const logistics = await prisma.user.create({
    data: {
      name: 'Piotr Nowak',
      email: 'piotr@euroflow.demo',
      emailVerified: true,
      company: 'EuroFlow Logistics',
      role: 'SELLER',
      status: 'ACTIVE',
      location: 'Warsaw, Poland',
      bio: 'Founder of logistics and supply-chain businesses in CEE.',
    },
  });

  // -------------------------------------------------------
  // ASSETS
  // -------------------------------------------------------

  const saasAsset = await prisma.asset.create({
    data: {
      sellerId: acme.id,
      status: 'PUBLISHED',
      title: 'Profitable B2B SaaS Platform',
      description:
        'Established B2B SaaS company serving mid-market customers across Germany, Austria and Switzerland. The business has a recurring revenue model and strong customer retention.',
      assetType: 'BUSINESS',
      industry: 'SaaS',
      location: 'Berlin, Germany',
      askingPrice: 4_200_000,
      revenue: 3_800_000,
      ebitda: 850_000,
      employees: 34,
      foundedYear: 2017,
      dealTypes: ['Majority', 'Full Acquisition'],
      investmentHighlights: [
        'Recurring revenue business model',
        'Strong DACH customer base',
        'High customer retention',
        'Experienced management team',
      ],
      aiMatchScore: 92,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: nordic.id,
      status: 'PUBLISHED',
      title: 'Precision Manufacturing Company',
      description:
        'Established precision manufacturing business supplying industrial customers throughout Northern Europe.',
      assetType: 'BUSINESS',
      industry: 'Manufacturing',
      location: 'Denmark',
      askingPrice: 7_800_000,
      revenue: 12_400_000,
      ebitda: 1_450_000,
      employees: 78,
      foundedYear: 2004,
      dealTypes: ['Majority', 'Full Acquisition'],
      investmentHighlights: [
        'Long-standing customer relationships',
        'Strong operating margins',
        'Modern production facility',
      ],
      aiMatchScore: 84,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: techventures.id,
      status: 'PUBLISHED',
      title: 'European Fintech Payments Platform',
      description:
        'Fast-growing payments infrastructure platform serving SMEs across Southern and Central Europe.',
      assetType: 'BUSINESS',
      industry: 'Fintech',
      location: 'Milan, Italy',
      askingPrice: 12_500_000,
      revenue: 7_200_000,
      ebitda: 1_100_000,
      employees: 62,
      foundedYear: 2019,
      dealTypes: ['Majority'],
      investmentHighlights: [
        'Growing recurring transaction revenue',
        'Multi-country customer base',
        'Modern payment infrastructure',
      ],
      aiMatchScore: 88,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: medgroup.id,
      status: 'PUBLISHED',
      title: 'Private Healthcare Clinic Network',
      description:
        'Profitable network of outpatient healthcare clinics with established regional presence.',
      assetType: 'BUSINESS',
      industry: 'Healthcare',
      location: 'Frankfurt, Germany',
      askingPrice: 9_600_000,
      revenue: 11_800_000,
      ebitda: 2_050_000,
      employees: 95,
      foundedYear: 2011,
      dealTypes: ['Full Acquisition'],
      investmentHighlights: [
        'Profitable multi-site operation',
        'Experienced medical team',
        'Strong regional brand',
      ],
      aiMatchScore: 79,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: logistics.id,
      status: 'PUBLISHED',
      title: 'CEE Last-Mile Logistics Business',
      description:
        'Technology-enabled last-mile logistics provider serving e-commerce businesses across Poland and neighbouring markets.',
      assetType: 'BUSINESS',
      industry: 'Logistics',
      location: 'Warsaw, Poland',
      askingPrice: 5_300_000,
      revenue: 9_100_000,
      ebitda: 920_000,
      employees: 110,
      foundedYear: 2016,
      dealTypes: ['Majority', 'Full Acquisition'],
      investmentHighlights: [
        'Growing e-commerce customer base',
        'CEE market coverage',
        'Technology-enabled operations',
      ],
      aiMatchScore: 89,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: acme.id,
      status: 'PUBLISHED',
      title: 'Cybersecurity Managed Services Provider',
      description:
        'Cybersecurity services company providing managed security solutions to European SMEs.',
      assetType: 'BUSINESS',
      industry: 'Technology',
      location: 'Hamburg, Germany',
      askingPrice: 6_900_000,
      revenue: 5_600_000,
      ebitda: 1_250_000,
      employees: 41,
      foundedYear: 2015,
      dealTypes: ['Majority'],
      investmentHighlights: [
        'Recurring managed services contracts',
        'Growing cybersecurity demand',
        'Diversified B2B customer base',
      ],
      aiMatchScore: 95,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: nordic.id,
      status: 'PUBLISHED',
      title: 'Industrial Automation Integrator',
      description:
        'Automation engineering company delivering robotics and production optimisation solutions.',
      assetType: 'BUSINESS',
      industry: 'Manufacturing',
      location: 'Sweden',
      askingPrice: 8_400_000,
      revenue: 10_200_000,
      ebitda: 1_600_000,
      employees: 52,
      foundedYear: 2009,
      dealTypes: ['Full Acquisition'],
      investmentHighlights: [
        'Exposure to industrial automation growth',
        'Skilled engineering workforce',
        'Recurring enterprise customers',
      ],
      aiMatchScore: 82,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: techventures.id,
      status: 'PUBLISHED',
      title: 'HR Technology SaaS Company',
      description:
        'Cloud-based workforce management platform serving mid-market European businesses.',
      assetType: 'BUSINESS',
      industry: 'SaaS',
      location: 'Amsterdam, Netherlands',
      askingPrice: 3_700_000,
      revenue: 2_900_000,
      ebitda: 610_000,
      employees: 26,
      foundedYear: 2018,
      dealTypes: ['Majority', 'Full Acquisition'],
      investmentHighlights: [
        'Subscription revenue',
        'Low customer churn',
        'International growth potential',
      ],
      aiMatchScore: 91,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: medgroup.id,
      status: 'PUBLISHED',
      title: 'Digital Health Software Provider',
      description:
        'Digital health platform providing workflow software for clinics and healthcare professionals.',
      assetType: 'BUSINESS',
      industry: 'Digital Health',
      location: 'Munich, Germany',
      askingPrice: 5_900_000,
      revenue: 4_100_000,
      ebitda: 770_000,
      employees: 37,
      foundedYear: 2018,
      dealTypes: ['Majority'],
      investmentHighlights: [
        'Recurring SaaS revenue',
        'Healthcare-specific product',
        'Strong DACH presence',
      ],
      aiMatchScore: 86,
      publishedAt: new Date(),
    },
  });

  await prisma.asset.create({
    data: {
      sellerId: logistics.id,
      status: 'PUBLISHED',
      title: 'B2B Freight Forwarding Platform',
      description:
        'Digital freight forwarding business connecting manufacturers with transport providers across CEE.',
      assetType: 'BUSINESS',
      industry: 'Logistics',
      location: 'Prague, Czech Republic',
      askingPrice: 4_800_000,
      revenue: 8_700_000,
      ebitda: 830_000,
      employees: 45,
      foundedYear: 2017,
      dealTypes: ['Majority'],
      investmentHighlights: [
        'Asset-light operating model',
        'Growing freight network',
        'Strong CEE footprint',
      ],
      aiMatchScore: 87,
      publishedAt: new Date(),
    },
  });

  // Draft opportunity – intentionally hidden from public marketplace.
  await prisma.asset.create({
    data: {
      sellerId: acme.id,
      status: 'DRAFT',
      title: 'Cloud Infrastructure Consultancy',
      description:
        'Cloud transformation consultancy serving medium-sized European companies.',
      assetType: 'BUSINESS',
      industry: 'Technology',
      location: 'Germany',
      askingPrice: 2_900_000,
      revenue: 3_100_000,
      ebitda: 540_000,
      employees: 21,
      foundedYear: 2020,
      dealTypes: ['Full Acquisition'],
      investmentHighlights: [
        'Growing cloud services market',
        'Experienced technical team',
      ],
    },
  });

  // -------------------------------------------------------
  // CONTACT REQUESTS
  // -------------------------------------------------------

  await prisma.contactRequest.create({
    data: {
      senderId: northstar.id,
      recipientId: acme.id,
      assetId: saasAsset.id,
      message:
        "Hi Michael, the opportunity looks aligned with our investment criteria. We'd be interested in learning more about the business and transaction structure.",
      status: 'PENDING',
    },
  });

  await prisma.contactRequest.create({
    data: {
      senderId: eastbridge.id,
      recipientId: acme.id,
      assetId: saasAsset.id,
      message:
        'We are actively evaluating SaaS opportunities in the region and would like to discuss this business further.',
      status: 'ACCEPTED',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔐 Demo login accounts:');
  console.log(`Buyer:   buyer@n5deal.demo / ${DEMO_PASSWORD}`);
  console.log(`Seller:  seller@n5deal.demo / ${DEMO_PASSWORD}`);
  console.log(`Manager: manager@n5deal.demo / ${DEMO_PASSWORD}`);
  console.log('');
  console.log('💼 Buyers created: 5');
  console.log('🏢 Sellers created: 5');
  console.log('📊 Assets created: 11');

  // Avoid unused-variable warnings while keeping the demo data readable.
  void manager;
  void baltic;
  void alpine;
  void mednova;
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
