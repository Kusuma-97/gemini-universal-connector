/**
 * Local development server for Vid2Quiz AI
 * Run: node server.js
 * No API keys needed — generates mock quizzes locally.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.webm': 'audio/webm',
};

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, apikey');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function json(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// ── Mock quiz generation ──
function generateMockQuiz(text, numQuestions, difficulty, focusTopic) {
  const n = Math.min(Math.max(numQuestions || 5, 1), 20);
  const topic = focusTopic || (text && text.startsWith('__DIRECT__') ? text.slice(10) : 'General Knowledge');
  
  const questionBank = [
    {
      question: `What is a key concept related to ${topic}?`,
      options: ['Fundamental principle', 'Unrelated idea', 'Random concept', 'None of these'],
      correct: 0, explanation: 'This tests understanding of core concepts.'
    },
    {
      question: `Which of the following best describes ${topic}?`,
      options: ['An incorrect description', 'A precise and accurate definition', 'A vague statement', 'An outdated view'],
      correct: 1, explanation: 'Accurate definitions help build strong foundations.'
    },
    {
      question: `What is an important application of ${topic}?`,
      options: ['Cooking recipes', 'Fashion design', 'Scientific research and real-world problem solving', 'Interior decoration'],
      correct: 2, explanation: 'Understanding applications helps connect theory to practice.'
    },
    {
      question: `Who is commonly associated with major contributions to ${topic}?`,
      options: ['A fictional character', 'A random celebrity', 'An unrelated politician', 'Pioneering researchers and scientists'],
      correct: 3, explanation: 'Knowing key contributors provides historical context.'
    },
    {
      question: `What is a common misconception about ${topic}?`,
      options: ['That it is simple and requires no study', 'That it was discovered recently', 'That it has no practical use', 'All of the above can be misconceptions'],
      correct: 3, explanation: 'Identifying misconceptions deepens understanding.'
    },
    {
      question: `In which field is ${topic} most commonly studied?`,
      options: ['Science and technology', 'Ancient mythology', 'Culinary arts', 'Sports management'],
      correct: 0, explanation: 'This topic has strong roots in scientific disciplines.'
    },
    {
      question: `What skill is essential for mastering ${topic}?`,
      options: ['Memorization only', 'Critical thinking and analysis', 'Physical strength', 'Musical talent'],
      correct: 1, explanation: 'Critical thinking is key to deep understanding.'
    },
    {
      question: `How has ${topic} evolved over time?`,
      options: ['It has remained unchanged', 'It has become simpler', 'It has grown more complex with new discoveries', 'It was abandoned'],
      correct: 2, explanation: 'Most fields evolve as new knowledge is discovered.'
    },
    {
      question: `What is a good resource for learning more about ${topic}?`,
      options: ['Gossip magazines', 'Textbooks and academic papers', 'Comic books', 'Restaurant menus'],
      correct: 1, explanation: 'Academic resources provide reliable, in-depth information.'
    },
    {
      question: `Why is ${topic} considered important?`,
      options: ['It is not important', 'It only matters to experts', 'It impacts many areas of knowledge and daily life', 'It is purely theoretical'],
      correct: 2, explanation: 'Understanding its importance motivates deeper study.'
    },
    {
      question: `What type of thinking does ${topic} primarily require?`,
      options: ['Emotional responses only', 'Logical and analytical reasoning', 'Guesswork', 'Artistic expression'],
      correct: 1, explanation: 'Analytical thinking is fundamental to this subject.'
    },
    {
      question: `Which method is best for studying ${topic}?`,
      options: ['Passive reading only', 'Active recall and practice problems', 'Watching unrelated videos', 'Skipping fundamentals'],
      correct: 1, explanation: 'Active recall is one of the most effective study techniques.'
    },
    {
      question: `What makes ${topic} challenging for beginners?`,
      options: ['It requires no effort', 'The terminology and foundational concepts', 'It is too easy', 'There are no resources available'],
      correct: 1, explanation: 'New terminology can be a barrier but becomes easier with practice.'
    },
    {
      question: `How does ${topic} relate to everyday life?`,
      options: ['It has no relation', 'It influences technology, decisions, and understanding', 'Only professionals encounter it', 'It is purely abstract'],
      correct: 1, explanation: 'Many topics have surprising everyday applications.'
    },
    {
      question: `What is the best way to test your knowledge of ${topic}?`,
      options: ['Avoid testing', 'Take quizzes and explain concepts to others', 'Read passively', 'Memorize without understanding'],
      correct: 1, explanation: 'Quizzes and teaching others are powerful learning tools.'
    },
  ];

  // Shuffle and pick n questions
  const shuffled = questionBank.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateMockSummary(text) {
  const preview = (text || '').slice(0, 200).replace(/\n/g, ' ');
  return `## Summary (Demo Mode)\n\nThis is a **mock summary** generated locally without an API key.\n\n**Content preview:** ${preview}...\n\n### Key Points\n- This summary is auto-generated for local development\n- Connect to Lovable Cloud for AI-powered summaries\n- The full content has been received and would be processed by AI in production`;
}

// ── Route handler ──
async function handleAPI(req, res, urlPath) {
  const body = await readBody(req);

  switch (urlPath) {
    case '/quiz':
      return json(res, 200, {
        quiz: generateMockQuiz(body.text, body.num_questions || body.numQuestions, body.difficulty, body.focus_topic || body.focusTopic)
      });

    case '/summary':
      return json(res, 200, { summary: generateMockSummary(body.text) });

    case '/feedback':
      return json(res, 200, { status: 'ok' });

    case '/api/login': {
      const email = body.email || '';
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const initials = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
      return json(res, 200, { status: 'ok', user: { id: Date.now(), email, name, initials, avatar: 'gradient', signedIn: true } });
    }

    case '/api/signup': {
      const name = body.name || body.email?.split('@')[0] || 'User';
      const initials = body.initials || name.slice(0, 2).toUpperCase();
      return json(res, 200, { status: 'ok', user: { id: Date.now(), email: body.email, name, initials, avatar: 'gradient', signedIn: true } });
    }

    case '/api/save_quiz':
      return json(res, 200, { status: 'ok' });

    case '/api/get_profile':
      return json(res, 200, { status: 'ok', profile: null });

    case '/api/save_profile':
      return json(res, 200, { status: 'ok' });

    default:
      return json(res, 404, { error: 'Not found' });
  }
}

// ── Server ──
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const urlPath = url.pathname;

  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }

  // API routes
  const apiRoutes = ['/quiz', '/summary', '/feedback', '/api/login', '/api/signup', '/api/save_quiz', '/api/get_profile', '/api/save_profile'];
  if (req.method === 'POST' && apiRoutes.some(r => urlPath === r)) {
    return handleAPI(req, res, urlPath);
  }

  // Static files from public/
  let filePath = urlPath === '/' ? '/landing.html' : urlPath;
  const fullPath = path.join(__dirname, 'public', filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      // Try without public prefix
      const altPath = path.join(__dirname, filePath);
      if (fs.existsSync(altPath)) {
        const data = fs.readFileSync(altPath);
        const ext = path.extname(altPath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        return res.end(data);
      }
      res.writeHead(404); return res.end('Not found');
    }
    const data = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(500); res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✨ Vid2Quiz AI — Local Dev Server`);
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📝 No API keys needed — using mock quiz generation`);
  console.log(`  🚀 For AI-powered quizzes, deploy on Lovable\n`);
});
