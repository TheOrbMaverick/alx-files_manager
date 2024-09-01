import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('sending an email');

async function postNew(req, res) {
  const email = req.body ? req.body.email : null;
  const password = req.body ? req.body.password : null;

  if (email === undefined) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (password === undefined) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    const existingUser = await (await dbClient.usersCollection()).findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const insertInfo = await (
      await dbClient.usersCollection()
    ).insertOne( { email, hashedPassword });

    const id = insertInfo.insertedId.toString();
    userQueue.add({ id });

    res.status(201).json({ id: id, email });
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server error' });
  }
}

module.exports = { postNew };
