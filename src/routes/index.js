import express from 'express';
import clientRoutes from './clientRoutes.js';
import accountRoutes from './accountRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import locationRoutes from './locationRoutes.js';
import fraudDetectionRoutes from './fraudDetectionRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Fraud Detection System API',
    version: '1.0.0'
  });
});

router.use('/clients', clientRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/devices', deviceRoutes);
router.use('/locations', locationRoutes);
router.use('/fraud-detection', fraudDetectionRoutes);

export default router;