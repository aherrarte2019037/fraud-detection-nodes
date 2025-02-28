import express from 'express';
import DeviceController from '../controllers/DeviceController.js';

const router = express.Router();

router.get('/', DeviceController.getAll);
router.get('/:id', DeviceController.getById);
router.post('/', DeviceController.create);
router.put('/:id', DeviceController.update);
router.delete('/:id', DeviceController.delete);

router.patch('/:id/properties', DeviceController.addProperties);
router.delete('/:id/properties', DeviceController.removeProperties);

router.patch('/batch/update', DeviceController.batchUpdate);
router.delete('/batch/delete', DeviceController.batchDelete);

router.post('/:fromId/relationship/:type/:toId', DeviceController.createRelationship);
router.put('/relationship/:id', DeviceController.updateRelationship);
router.delete('/relationship/:id', DeviceController.deleteRelationship);

router.get('/by-id/:deviceId', DeviceController.findByDeviceId);
router.get('/multiple-clients', DeviceController.findUsedByMultipleClients);
router.get('/unusual-locations', DeviceController.findWithUnusualLocations);

router.post('/query', DeviceController.executeQuery);

export default router;