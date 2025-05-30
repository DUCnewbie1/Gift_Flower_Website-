import express from "express";
import {
  getAllPromotions,
  createPromotion,
  deletePromotion,
  updatePromotion,
} from "../controllers/promotionController.js";

const router = express.Router();

router.get("/", getAllPromotions);
router.post("/", createPromotion);
router.delete("/:id", deletePromotion);
router.put("/:id", updatePromotion);

export default router;
