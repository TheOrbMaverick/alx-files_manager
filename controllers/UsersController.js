import dbClient from '../utils/db';
import sha1 from 'sha1';

class UsersController {
  // Handler for POST /users endpoint
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check for missing email or password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the user already exists
    const existingUser = await dbClient.client
      .db()
      .collection('users')
      .findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Create the new user
    const newUser = await dbClient.client
      .db()
      .collection('users')
      .insertOne({ email, password: hashedPassword });

    // Return the new user with only the id and email
    return res.status(201).json({ id: newUser.insertedId, email });
  }
}

export default UsersController;
