import express from 'express';
import exampleRoutes from './exampleRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Neo4j AuraDB REST API',
    version: '1.0.0'
  });
});

router.use('/examples', exampleRoutes);

export default router; 