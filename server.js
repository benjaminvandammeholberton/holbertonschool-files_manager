import bodyParser from 'body-parser';

import express from 'express';
import router from './routes';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

app.use('/', router);

app.listen(port, () => {
  console.log('Server running on port', port);
});
