// pages/api/expert/register.js

import { Expert } from '@/model/expert';
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import { OTP } from '@/model/otp';
import { hash } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  await connectDB();
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
//   Time:{
//   start: Date,
//   end: Date,
// },
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      skills,
      Time
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp ||
      !skills
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and ConfirmPassword values do not match',
      });
    }

    const ifExist = await Expert.findOne({ email });
    if (ifExist) {
      return res.status(400).json({
        success: false,
        message: 'Expert Already Exists',
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found',
      });
    } else if (otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const hashedPassword = await hash(password, 12);
    const newExpert = await Expert.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      skills, // Assuming skills is an array of tag IDs
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      Time

    });

    if (newExpert) {
      return res.status(200).json({
        success: true,
        message: 'Expert account created successfully',
        newExpert
      });
    }
  } catch (err) {
    console.log('Error in register (server) => ', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please retry later!',
    });
  }
}
