import express from 'express';
import TransactionController from '../controllers/TransactionController.js';

const router = express.Router();

router.get('/', TransactionController.getAll);
router.get('/:id', TransactionController.getById);
router.post('/', TransactionController.create);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

router.patch('/:id/properties', TransactionController.addProperties);
router.delete('/:id/properties', TransactionController.removeProperties);

router.patch('/batch/update', TransactionController.batchUpdate);
router.delete('/batch/delete', TransactionController.batchDelete);

router.post('/:fromId/relationship/:type/:toId', TransactionController.createRelationship);
router.put('/relationship/:id', TransactionController.updateRelationship);
router.delete('/relationship/:id', TransactionController.deleteRelationship);

router.get('/by-id/:transactionId', TransactionController.findByTransactionId);
router.get('/date-range', TransactionController.findInDateRange);
router.get('/by-amount', TransactionController.findByAmount);
router.get('/suspicious', TransactionController.findSuspicious);
router.get('/circular-patterns', TransactionController.findCircularPatterns);
router.get('/between/:fromAccountId/:toAccountId', TransactionController.findBetweenAccounts);

router.post('/query', TransactionController.executeQuery);

export default router;