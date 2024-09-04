import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import Bull from 'bull';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Bull('fileQueue');

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const parentFile = await dbClient.db.collection('files')
        .findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : new ObjectId(parentId),
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const localPath = path.join(folderPath, uuidv4());
      const decodedData = Buffer.from(data, 'base64');

      try {
        fs.writeFileSync(localPath, decodedData);
      } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      fileDocument.localPath = localPath;
    }

    try {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      fileDocument.id = result.insertedId;

      if (type === 'image') {
        fileQueue.add({
          userId,
          fileId: fileDocument.id,
        });
      }

      return res.status(201).json(fileDocument);
    } catch (err) {
      console.error('Error inserting file into Database:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = 0, page = 0 } = req.query;

    const pageSize = 20;
    const paginationSkip = page * pageSize;

    const files = await dbClient.db.collection('files').aggregate([
      { $match: { parentId: parentId === '0' ? 0 : new ObjectId(parentId), userId: new ObjectId(userId) } },
      { $skip: paginationSkip },
      { $limit: pageSize },
    ]).toArray();
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.db.collection('files').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isPublic: true } },
    );

    const updatedFile = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id) });

    return res.status(200).json(updatedFile);
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.db.collection('files').updateOne(
      { _id: new ObjectId(id) },
      { },
    );

    const updatedFile = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id) });

    return res.status(200).json(updatedFile);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const { size } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const file = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    const token = req.headers['x-token'];
    const userId = token ? await redisClient.get(`auth_${token}`) : null;

    if (!file.isPublic && (!userId || userId !== file.userId.toString())) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    let filePath = file.localPath;

    if (size) {
      const allowedSizes = ['500', '250', '100'];
      if (!allowedSizes.includes(size)) {
        return res.status(400).json({ error: 'Invalid size' });
      }
      filePath = `${file.localPath}_${size}`;
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    const fileContent = fs.readFileSync(filePath);
    return res.status(200).send(fileContent);
  }
}
