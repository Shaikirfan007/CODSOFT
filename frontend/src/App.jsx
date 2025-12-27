import { createContext, useContext, useState, useEffect } from 'react';

// API Setup
const API_URL = 'http://localhost:5000/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };
  const response = await fetch(`${API_URL}${endpoint}`, config);
  if (!response.ok) throw await response.json();
  return response.json();
}

// Router Context
const RouterContext = createContext();
const useRouter = () => useContext(RouterContext);

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const register = async (name, email, password) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Navbar
function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const { goTo } = useRouter();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <button onClick={() => goTo('dashboard')} className="text-2xl font-bold hover:opacity-80 transition cursor-pointer">
          Quizify
        </button>
        <div className="flex gap-4 items-center">
          {isAuth ? (
            <>
              <span className="text-sm font-medium">👤 {user?.name}</span>
              <button onClick={() => goTo('create')} className="hover:text-blue-200 transition font-medium">
                ➕ Create Quiz
              </button>
              <button
                onClick={() => { logout(); goTo('dashboard'); }}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => goTo('login')} className="hover:text-blue-200 transition font-medium">
                Login
              </button>
              <button
                onClick={() => goTo('register')}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition font-medium"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Login Page
function Login() {
  const { login } = useAuth();
  const { goTo } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      goTo('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <button onClick={() => goTo('register')} className="text-blue-600 hover:underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

// Register Page
function Register() {
  const { register } = useAuth();
  const { goTo } = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be 6+ characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      goTo('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Register</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Have an account?{' '}
          <button onClick={() => goTo('login')} className="text-blue-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { isAuth } = useAuth();
  const { goTo } = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/quizzes')
      .then((data) => {
        setQuizzes(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-xl text-gray-500">
        ⏳ Loading quizzes...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Available Quizzes</h1>
          <p className="text-gray-600">Test your knowledge and improve your skills</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No quizzes available yet</p>
            {isAuth && (
              <button
                onClick={() => goTo('create')}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                ➕ Create First Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-800">{q.title}</h3>
                <p className="text-gray-600 mb-4 text-sm min-h-10">
                  {q.description}
                </p>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    ❓ {q.questionCount} Questions
                  </span>
                  <button
                    onClick={() => goTo(`quiz-${q._id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Start →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Create Quiz Page
function CreateQuiz() {
  const { isAuth } = useAuth();
  const { goTo } = useRouter();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-lg mb-4">🔒 Please login to create a quiz</p>
          <button
            onClick={() => goTo('login')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    if (!desc.trim()) {
      setError('Quiz description is required');
      return false;
    }
    if (questions.length < 3) {
      setError('Minimum 3 questions required');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          setError(`Question ${i + 1}, Option ${j + 1} is required`);
          return false;
        }
      }
    }
    return true;
  };

  const submitQuiz = async () => {
    if (!validateQuiz()) return;

    setLoading(true);
    setError('');
    try {
      await apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify({ title, description: desc, questions })
      });
      alert('✅ Quiz created successfully!');
      goTo('dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✏️ Create New Quiz</h1>
          <p className="text-gray-600">Create an engaging quiz with multiple-choice questions</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            ❌ {error}
          </div>
        )}

        {/* Quiz Title and Description */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📝 Quiz Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                placeholder="e.g., General Knowledge Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Write a brief description of your quiz..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="bg-white p-6 rounded-lg shadow border-2 border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ❓ Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <input
                  placeholder={`Enter question ${qIndex + 1}`}
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Multiple Choice Options * (Select the correct answer)
                </label>
                <div className="space-y-3">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex gap-3 items-start">
                      <div className="flex items-center pt-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={addQuestion}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
          >
            ➕ Add Question
          </button>
          <button
            onClick={() => goTo('dashboard')}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 transition font-semibold text-lg"
          >
            ← Cancel
          </button>
          <button
            onClick={submitQuiz}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Creating...' : '✅ Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Take Quiz Page
function TakeQuiz({ quizId }) {
  const { goTo } = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(`/quizzes/${quizId}`)
      .then((data) => {
        setQuiz(data.data);
        setAnswers(new Array(data.data.questions.length).fill(null));
        setLoading(false);
      })
      .catch(() => {
        alert('❌ Quiz not found');
        goTo('dashboard');
      });
  }, [quizId]);

  const selectAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[current] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert('⚠️ Please answer all questions before submitting');
      return;
    }

    const data = await apiCall(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    localStorage.setItem('result', JSON.stringify(data.data));
    goTo('result');
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl text-gray-500">
        ⏳ Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const q = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">{quiz.title}</h2>
            <div className="mb-2">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {current + 1} / {quiz.questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Answered: {answeredCount} / {quiz.questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="mb-8 border-2 border-blue-200 p-6 rounded-lg bg-blue-50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {current + 1}. {q.questionText}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[current] === index
                      ? 'border-blue-600 bg-blue-100 shadow-md'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[current] === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {answers[current] === index && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg text-gray-800">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Previous
            </button>

            {current === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-lg"
              >
                ✅ Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrent(Math.min(quiz.questions.length - 1, current + 1))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Result Page
function Result() {
  const { goTo } = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const r = localStorage.getItem('result');
    if (r) {
      setResult(JSON.parse(r));
      localStorage.removeItem('result');
    }
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-xl mb-4 text-gray-700">
            No results found
          </p>
          <button
            onClick={() => goTo('dashboard')}
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPassed = result.score >= 60;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
            {result.quizTitle}
          </h1>

          {/* Score Card */}
          <div
            className={`text-center py-12 mb-8 rounded-lg border-4 ${
              isPassed
                ? 'bg-green-100 border-green-500'
                : 'bg-red-100 border-red-500'
            }`}
          >
            <div className="text-7xl font-bold mb-3">
              {result.score}%
            </div>
            <div className="text-3xl font-bold mb-2">
              {isPassed ? '🎉 Excellent!' : '📚 Keep Learning!'}
            </div>
            <p className="text-xl font-semibold">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
          </div>

          {/* Detailed Results */}
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📊 Detailed Results
          </h2>
          <div className="space-y-4 mb-8">
            {result.results.map((item, i) => (
              <div
                key={i}
                className={`border-2 p-6 rounded-lg ${
                  item.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <h3 className="font-bold mb-4 flex items-start gap-2 text-lg">
                  <span className="text-3xl">
                    {item.isCorrect ? '✅' : '❌'}
                  </span>
                  <span>
                    Q{i + 1}: {item.questionText}
                  </span>
                </h3>

                <div className="ml-12 space-y-2">
                  {item.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`p-3 rounded ${
                        item.correctAnswer === j
                          ? 'bg-green-200 font-semibold'
                          : item.userAnswer === j
                          ? 'bg-red-200'
                          : 'bg-gray-100'
                      }`}
                    >
                      {opt}
                      {item.correctAnswer === j && <span className="ml-2 text-green-700 font-bold">✓</span>}
                      {item.userAnswer === j && item.userAnswer !== item.correctAnswer && (
                        <span className="ml-2 text-red-700 font-bold">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => goTo('dashboard')}
            className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Router
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [quizId, setQuizId] = useState(null);

  const goTo = (page) => {
    if (page.startsWith('quiz-')) {
      setQuizId(page.split('-')[1]);
      setCurrentPage('quiz');
    } else {
      setCurrentPage(page);
    }
  };

  let pageComponent;
  switch (currentPage) {
    case 'login':
      pageComponent = <Login />;
      break;
    case 'register':
      pageComponent = <Register />;
      break;
    case 'create':
      pageComponent = <CreateQuiz />;
      break;
    case 'quiz':
      pageComponent = <TakeQuiz quizId={quizId} />;
      break;
    case 'result':
      pageComponent = <Result />;
      break;
    default:
      pageComponent = <Dashboard />;
  }

  return (
    <AuthProvider>
      <RouterContext.Provider value={{ goTo, currentPage }}>
        <Navbar />
        {pageComponent}
      </RouterContext.Provider>
    </AuthProvider>
  );
}