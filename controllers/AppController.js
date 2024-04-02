import dbClient from '../utils/db';

const AppController = {
  getStatus: async (req, res) => {
    const dbStatus = await dbClient.isAlive();
    res.json({ db: dbStatus });
  },
  getStats: async (req, res) => {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    res.json({ users: nbUsers, files: nbFiles });
  },
};
export default AppController;
