import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  getConnect: async (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    if (!b64auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const auth = Buffer.from(b64auth, 'base64').toString('utf-8');
    const email = auth.split(':')[0];
    const hashedPassword = sha1(auth.split(':')[1]);

    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (user.password !== hashedPassword) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const value = user._id.toString();
    const duration = 24 * 60 * 60;
    await redisClient.set(key, value, duration);
    res.json({ token });
  },

  getDisconnect: async (req, res) => {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401).end();
      return;
    }
    await redisClient.del(token);
    res.status(200).end();
  },
};

export default AuthController;
