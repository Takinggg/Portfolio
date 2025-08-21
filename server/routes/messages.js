import express from 'express';
import { readJSONL, writeJSON, readJSON } from '../lib/fsdb.js';

const router = express.Router();

// Simple authentication middleware (basic auth)
const authenticateAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  next();
};

// GET /api/messages - List messages with optional search and pagination
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { q, skip = 0, take = 20 } = req.query;
    
    let messages = await readJSONL('messages.jsonl');
    
    // Search filter
    if (q) {
      const searchTerm = q.toLowerCase();
      messages = messages.filter(msg => 
        msg.name.toLowerCase().includes(searchTerm) ||
        msg.email.toLowerCase().includes(searchTerm) ||
        msg.subject.toLowerCase().includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by newest first
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = messages.length;
    const skipNum = parseInt(skip);
    const takeNum = parseInt(take);
    const paginatedMessages = messages.slice(skipNum, skipNum + takeNum);

    // Load status index for current statuses
    const statusIndex = await readJSON('messages.idx.json', {});
    const messagesWithStatus = paginatedMessages.map(msg => ({
      ...msg,
      status: statusIndex[msg.id]?.status || msg.status || 'new'
    }));

    res.json({
      success: true,
      messages: messagesWithStatus,
      total,
      skip: skipNum,
      take: takeNum
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;