const { getRedisClient, getDbClient } = require('../utils/db');

// Check if Redis and MongoDB are alive
exports.getStatus = async (req, res) => {
  const redisClient = getRedisClient();
  const dbClient = getDbClient();

  const redisAlive = redisClient.isAlive();
  const dbAlive = dbClient.isAlive();

  res.status(200).json({ redis: redisAlive, db: dbAlive });
};

// Get the count of users and files in the database
exports.getStats = async (req, res) => {
  const dbClient = getDbClient();

  const usersCount = await dbClient.nbUsers();
  const filesCount = await dbClient.nbFiles();

  res.status(200).json({ users: usersCount, files: filesCount });
};
