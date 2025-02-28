import express from 'express';
import FraudDetectionController from '../controllers/FraudDetectionController.js';

const router = express.Router();

router.post('/query', FraudDetectionController.executeQuery);

router.get('/money-laundering', FraudDetectionController.findPotentialMoneyLaundering);
router.get('/unusual-device-usage', FraudDetectionController.findUnusualDeviceUsage);
router.get('/rapid-transactions', FraudDetectionController.findRapidSuccessiveTransactions);
router.get('/unusual-patterns', FraudDetectionController.findUnusualTransactionPatterns);
router.get('/unusual-activity-increase', FraudDetectionController.findAccountsWithUnusualActivityIncrease);
router.get('/risk-categories', FraudDetectionController.aggregateTransactionsByRiskCategory);

export default router;