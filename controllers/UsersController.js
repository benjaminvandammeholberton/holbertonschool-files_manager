import dbClient from '../utils/db';

const Bull = require('bull');
const crypto = require('crypto');

const UsersController = {
  postNew: async (req, res) => {
    const userQueue = new Bull('userQueue');
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (user) {
      return res.status(400).send({ error: 'Already exist' });
    }

    const addNewUser = await usersCollection.insertOne({
      email,
      password: crypto.createHash('sha1').update(password).digest('hex'),
    });

    userQueue.add({
      userId: addNewUser.insertedId,
    });

    return res.status(201).send({ email, id: addNewUser.insertedId });
  },
};

export default UsersController;
