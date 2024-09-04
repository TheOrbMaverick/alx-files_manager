import Queue from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';

// Initialize Bull queue
const fileQueue = new Queue('fileQueue');

// Process the queue
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  // Find the file document in the database
  const file = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(fileId),
    userId: new ObjectId(userId),
  });

  if (!file) throw new Error('File not found');
  if (file.type !== 'image') throw new Error('File is not an image');

  // Generate thumbnails and save them
  const sizes = [500, 250, 100];
  for (const size of sizes) {
    try {
      const thumbnail = await imageThumbnail(file.localPath, { width: size });
      const thumbnailPath = `${file.localPath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    } catch (err) {
      console.error(`Error generating thumbnail for size ${size}:`, err);
    }
  }
});

console.log('Worker started...');
