import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
    constructor() {
        // Create a Redis client
        this.client = redis.createClient();

        // Display error in console
        this.client.on('error', (error) => {
            console.error(`Redis client not connected to the server: ${error.message}`)
        });

        // Promisify Redis methods for asynchronous usage
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    // Returns true if the connection to Redis is successful, otherwise false
    isAlive() {
        return this.client.connected;
    }

    // Asynchronous function to get the value of a key in Redis
    async get(key){
        try {
            const value = await this.getAsync(key);
            return value;
        } catch (error) {
            console.error(`Error getting key ${key}: ${error.message}`);
            return null;
        }
    }

    // Asynchronous function to set a key-value pair in Redis with an expiration
    async set(key, value, duration) {
        try {
            await this.setAsync(key, value, 'EX', duration)
        } catch (error) {
            console.error(`Error setting key ${key}: ${error.message}`);
        }
    }

    // Asynchronous function to delete a key in Redis
    async del(key) {
        try {
            await this.delAsync(key)
        } catch {
            console.log(`Error deleting key ${key}: ${error.message}`);
        }
    }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
