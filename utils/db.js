import { MongoClient } from 'mongodb';

// Set default values for environment variables if not set
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;

    // Connect to MongoDB and set the database instance
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DB_DATABASE);
      })
      .catch((error) => {
        console.error(`MongoDB client not connected to the server: ${error.message}`);
      });
  }

  // Returns true if the connection to MongoDB is successful, otherwise false
  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  // Asynchronous function to return the number of documents in the 'users' collection
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  // Asynchronous function to return the number of documents in the 'files' collection
  async nbFiles() {
    if (!this.isAlive()) return 0;
    return this.db.collection('files').countDocuments();
  }

  usersCollection() {
    return this.client.db().collection('users');
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
