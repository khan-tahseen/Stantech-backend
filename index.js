import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './models/user.js';
import connectDB from './database.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

// Database connection
connectDB();

// Routes
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log('user => ', user )

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('isPasswordMatch', isPasswordMatch);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    console.log('token => ', token);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
