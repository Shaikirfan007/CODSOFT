require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ MongoDB Error:', err); process.exit(1); });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: { type: [String], required: true, validate: v => v.length === 4 },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 }
  }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

// Auth Middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ============= AUTH ROUTES =============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
    
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ============= QUIZ ROUTES =============

// Get all quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .select('title description createdAt questions')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });
    
    const data = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      creator: q.creator,
      createdAt: q.createdAt,
      questionCount: q.questions?.length || 0
    }));
    
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// Get single quiz (without answers)
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'name');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    
    const data = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      creator: quiz.creator,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options
      }))
    };
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// Create quiz (protected)
app.post('/api/quizzes', protect, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    if (questions.length < 3) {
      return res.status(400).json({ success: false, message: 'Minimum 3 questions required' });
    }
    
    const quiz = await Quiz.create({ title, description, questions, creator: req.user._id });
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
});

// Submit quiz
app.post('/api/quizzes/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid answers' });
    }
    
    let correctCount = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionText: q.questionText,
        options: q.options,
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });
    
    res.json({
      success: true,
      data: {
        quizTitle: quiz.title,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        score: Math.round((correctCount / quiz.questions.length) * 100),
        results
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

// Health check
app.get('/', (req, res) => res.json({ success: true, message: 'Quizify API Running 🚀' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));