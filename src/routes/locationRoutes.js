import express from 'express';
import LocationController from '../controllers/LocationController.js';

const router = express.Router();

router.get('/', LocationController.getAll);
router.get('/:id', LocationController.getById);
router.post('/', LocationController.create);
router.put('/:id', LocationController.update);
router.delete('/:id', LocationController.delete);

router.patch('/:id/properties', LocationController.addProperties);
router.delete('/:id/properties', LocationController.removeProperties);

router.patch('/batch/update', LocationController.batchUpdate);
router.delete('/batch/delete', LocationController.batchDelete);

router.post('/:fromId/relationship/:type/:toId', LocationController.createRelationship);
router.put('/relationship/:id', LocationController.updateRelationship);
router.delete('/relationship/:id', LocationController.deleteRelationship);

router.get('/coordinates', LocationController.findByCoordinates);
router.get('/high-risk', LocationController.findHighRiskLocations);
router.get('/unusual/:clientId', LocationController.findUnusualTransactionLocations);

router.post('/query', LocationController.executeQuery);

export default router;