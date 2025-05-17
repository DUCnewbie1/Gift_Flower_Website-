import express from 'express';
import {
  getRegionalPrices,
  setRegionalPrice,
  deleteRegionalPrice
} from '../controllers/regionalPriceController.js';

const router = express.Router();

router.get('/', getRegionalPrices);
router.post('/', setRegionalPrice);
router.delete('/:id', deleteRegionalPrice);

export default router;