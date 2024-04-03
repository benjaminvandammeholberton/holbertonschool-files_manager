import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FilesController = {
  postUpload: async (req, res) => {
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
    if (type === 'folder') {
      const document = {
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
        userId: user._id,
      };
      console.log(document)
    }
  },
};

export default FilesController;
