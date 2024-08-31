import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const { email } = req.body;
  const { password } = req.body;

  if (email === undefined) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (password === undefined) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    const existingUser = await dbClient.findUser(email);
    if (existingUser) {                                               return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const _id = await dbClient.saveUser(email, password);

    res.status(201).json({ id: _id, email });
  } catch {
    res.status(500).json({ error: 'Internal Server error' });
  }
}

module.exports = { postNew };
