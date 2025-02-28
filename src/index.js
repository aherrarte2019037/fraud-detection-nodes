import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import * as db from './config/db.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

app.use((err, _, res, __) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong'
  });
});

const startServer = async () => {
  try {
    const connected = await db.verifyConnectivity();
    
    if (connected) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      });
    } else {
      console.error('Failed to start server due to database connection error');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await db.closeDriver();
  process.exit(0);
});

startServer(); 