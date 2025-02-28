import express from 'express';
import AccountController from '../controllers/AccountController.js';

const router = express.Router();

router.get('/', AccountController.getAll);
router.get('/:id', AccountController.getById);
router.post('/', AccountController.create);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

router.patch('/:id/properties', AccountController.addProperties);
router.delete('/:id/properties', AccountController.removeProperties);

router.patch('/batch/update', AccountController.batchUpdate);
router.delete('/batch/delete', AccountController.batchDelete);

router.post('/:fromId/relationship/:type/:toId', AccountController.createRelationship);
router.put('/relationship/:id', AccountController.updateRelationship);
router.delete('/relationship/:id', AccountController.deleteRelationship);

router.get('/number/:accountNumber', AccountController.findByAccountNumber);
router.get('/with-owner', AccountController.findAccountsWithOwner);
router.get('/high-balance-change', AccountController.findAccountsWithHighBalanceChange);
router.get('/recent', AccountController.findRecentAccounts);

router.post('/query', AccountController.executeQuery);

export default router;