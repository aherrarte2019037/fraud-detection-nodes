import express from 'express';
import ClientController from '../controllers/ClientController.js';

const router = express.Router();

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.post('/', ClientController.create);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);

router.patch('/:id/properties', ClientController.addProperties);
router.delete('/:id/properties', ClientController.removeProperties);

router.patch('/batch/update', ClientController.batchUpdate);
router.delete('/batch/delete', ClientController.batchDelete);

router.post('/:fromId/relationship/:type/:toId', ClientController.createRelationship);
router.put('/relationship/:id', ClientController.updateRelationship);
router.delete('/relationship/:id', ClientController.deleteRelationship);

router.get('/identification/:idNumber', ClientController.findByIdentificationNumber);
router.get('/multiple-accounts', ClientController.findClientsWithMultipleAccounts);
router.get('/risk-score', ClientController.findClientsByRiskScore);

router.post('/query', ClientController.executeQuery);

export default router;