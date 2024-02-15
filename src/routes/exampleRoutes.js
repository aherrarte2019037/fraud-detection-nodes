import express from 'express';
import exampleController from '../controllers/exampleController.js';

const router = express.Router();

router.get('/', exampleController.getAll);

router.get('/:id', exampleController.getById);

router.post('/', exampleController.create);

router.post('/query', exampleController.executeQuery);

export default router; 