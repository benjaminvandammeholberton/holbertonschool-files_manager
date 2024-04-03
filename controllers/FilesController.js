import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FilesController = {
  postUpload: async (req, res) => {
    // Get the user based on the token
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const _id = new ObjectId(userId);
    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ _id });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verification of the request data
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const fileTpes = ['folder', 'file', 'image'];
    if (!type || !fileTpes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId) {
      const filesCollection = dbClient.db.collection('files');
      const parent = await filesCollection.findOne({ parentId });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // If folder, add to database
    if (type === 'folder') {
      const filesCollection = dbClient.db.collection('files');
      const newFolder = {
        userId: user._id,
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
      };
      await filesCollection.insertOne(newFolder);
      newFolder.id = newFolder._id;
      return res.status(201).json({
        id: newFolder.id,
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
    }

    // File creation
    const uuid = uuidv4();
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filePath = `${folderPath}/${uuid}`;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const decryptedData = Buffer.from(data, 'base64').toString('utf-8');
    fs.writeFile(filePath, decryptedData);

    // File to database
    const newFile = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: filePath,
    };
    const filesCollection = dbClient.db.collection('files');
    await filesCollection.insertOne(newFile);
    newFile.id = newFile._id;
    return res.status(201).json({
      id: newFile.id,
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    });
  },

};

export default FilesController;
