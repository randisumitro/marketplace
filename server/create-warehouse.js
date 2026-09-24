import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from './dist/config/env.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'warehouse' },
});

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const existing = await User.findOne({ email: 'gudang@oneshop.com' });
  if (existing) {
    existing.role = 'warehouse';
    await existing.save();
    console.log('User already exists, updated role to warehouse.');
  } else {
    const password = await bcrypt.hash('gudang123', 10);
    await User.create({
      name: 'Tim Gudang',
      email: 'gudang@oneshop.com',
      password,
      role: 'warehouse'
    });
    console.log('Warehouse account created: gudang@oneshop.com / gudang123');
  }
  
  await mongoose.disconnect();
}
run().catch(console.error);
