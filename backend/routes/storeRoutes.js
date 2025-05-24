import express from 'express';
import {
    getAvailableRegions,
  getAllStores,
  getStoreById,
  getNearestStore,
  createStore,
  updateStore,
  deleteStore
} from '../controllers/storeController.js';

const router = express.Router();

router.get('/', getAllStores);
router.get('/nearest', getNearestStore);
router.get('/regions', getAvailableRegions);
router.get('/:id', getStoreById);
router.post('/', createStore);
router.put('/:id', updateStore);
router.delete('/:id', deleteStore);

export default router;