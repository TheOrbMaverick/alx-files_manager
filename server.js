import express from 'express';
import routes from './routes/index';

const app = express();

// Set the port to the environment variable PORT or default to 5000
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

app.listen(port, (err) => {
  if (err) { console.log(err); }
  console.log(`Server is running on port ${PORT}`);
});

export default app;
