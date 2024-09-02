const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    // Verify parentId
    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const userObjectId = new ObjectId(userId);
    const newFile = {
      userId: userObjectId,
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      // Add folder to DB
      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json({ id: result.insertedId, ...newFile });
    }

    // Define file saving path
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    await mkdir(folderPath, { recursive: true });
    const localPath = `${folderPath}/${uuidv4()}`;

    // Save the file content
    const decodedData = Buffer.from(data, 'base64').toString('binary');
    await writeFile(localPath, decodedData, 'binary');

    // Add file to DB
    newFile.localPath = localPath;
    const result = await dbClient.db.collection('files').insertOne(newFile);

    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId: newFile.parentId,
    });
  }
}

module.exports = FilesController;
