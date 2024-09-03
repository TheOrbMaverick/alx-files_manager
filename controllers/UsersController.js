import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

// Create a new queue for email sending
const userQueue = new Queue('email sending');

export default class UsersController {
  // Handler for POST /users endpoint
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    // Check for missing email or password
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    try {
      // Access the users collection
      const usersCollection = await dbClient.usersCollection();

      // Check if the user already exists
      const user = await usersCollection.findOne({ email });
      if (user) {
        res.status(400).json({ error: 'Already exist' });
        return;
      }

      // Hash the password
      const hashedPassword = sha1(password);

      // Insert the new user
      const insertionInfo = await usersCollection.insertOne({ email, password: hashedPassword });
      const userId = insertionInfo.insertedId.toString();

      // Add a job to the queue for email sending
      userQueue.add({ userId });

      // Return the new user with only the email and ID
      res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Handler for GET /me endpoint
  static async getMe(req, res) {
    const { user } = req;

    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
