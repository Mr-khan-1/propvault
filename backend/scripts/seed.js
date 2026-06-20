require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Agent = require('../models/Agent');
const Property = require('../models/Property');

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
  'https://images.unsplash.com/photo-1605276374101-de4c16789f65?w=800'
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let admin = await Admin.findOne({ email: 'admin@propvault.pk' });
  if (!admin) {
    admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@propvault.pk',
      phone: '03001234567',
      password: 'Admin@123',
      role: 'super_admin'
    });
    console.log('✅ Admin created → admin@propvault.pk / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  let agent = await Agent.findOne({ email: 'agent@propvault.pk' });
  if (!agent) {
    agent = await Agent.create({
      name: 'Demo Agent',
      email: 'agent@propvault.pk',
      phone: '03009876543',
      password: 'Agent@123',
      company: 'PropVault Realty',
      license: 'LIC-PV-001',
      city: 'Islamabad',
      isVerified: true,
      status: 'approved',
      approvedBy: admin._id,
      approvalDate: new Date()
    });
    console.log('✅ Demo agent → agent@propvault.pk / Agent@123');
  }

  const count = await Property.countDocuments();
  if (count === 0) {
    const samples = [
      { title: 'Luxury Villa DHA Phase 6', type: 'villa', purpose: 'sale', price: 85000000, area: 500, bedrooms: 5, bathrooms: 6, city: 'Islamabad' },
      { title: 'Modern Apartment Bahria Town', type: 'apartment', purpose: 'sale', price: 22000000, area: 120, bedrooms: 3, bathrooms: 3, city: 'Rawalpindi' },
      { title: 'Commercial Plaza Blue Area', type: 'commercial', purpose: 'rent', price: 350000, area: 800, bedrooms: 0, bathrooms: 4, city: 'Islamabad' },
      { title: 'Family House F-10', type: 'house', purpose: 'sale', price: 45000000, area: 300, bedrooms: 4, bathrooms: 4, city: 'Islamabad' },
      { title: 'Studio Apartment G-11', type: 'apartment', purpose: 'rent', price: 65000, area: 45, bedrooms: 1, bathrooms: 1, city: 'Islamabad' },
      { title: 'Plot for Sale DHA Phase 2', type: 'land', purpose: 'sale', price: 18000000, area: 500, bedrooms: 0, bathrooms: 0, city: 'Islamabad' }
    ];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      await Property.create({
        ...s,
        description: `Premium ${s.type} in ${s.city}. Fully verified listing with modern amenities, prime location, and excellent investment potential.`,
        images: [SAMPLE_IMAGES[i]],
        address: { city: s.city, district: s.city },
        amenities: ['Security', 'Parking', 'Power Backup', 'Near Market'],
        agent: agent._id,
        furnished: i % 2 === 0 ? 'furnished' : 'semi-furnished',
        parking: true
      });
    }
    console.log('✅ Sample properties seeded');
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
