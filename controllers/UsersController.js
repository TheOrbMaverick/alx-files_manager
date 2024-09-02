import dbClient from '../utils/db';
import sha1 from 'sha1'; // Import the SHA1 hashing library

class UsersController {
  // Handler for the POST /users endpoint
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is missing
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists in the database
    const existingUser = await dbClient.client.db().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create the new user and insert it into the users collection
    const newUser = await dbClient.client.db().collection('users').insertOne({ email, password: hashedPassword });

    // Return the new user with only the id and email
    return res.status(201).json({ id: newUser.insertedId, email });
  }
}

export default UsersController;
