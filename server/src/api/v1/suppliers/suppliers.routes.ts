import { Router } from "express";
import { getSuppliers, getSupplierById, createSupplier } from "./suppliers.controller";
import { asyncHandler } from "../../../utils/asyncHandler";
import { validateQueryParams, validate } from "../../../middleware/validate";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { createSupplierSchema } from "./suppliers.schema";

const router = Router();

// POST /api/v1/suppliers — ADMIN and STAFF only
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "STAFF"]),
  validate(createSupplierSchema),
  asyncHandler(createSupplier)
);

// GET /api/v1/suppliers — ADMIN and STAFF only
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "STAFF"]),
  validateQueryParams,
  asyncHandler(getSuppliers)
);

// GET /api/v1/suppliers/:id — ADMIN and STAFF only
router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "STAFF"]),
  asyncHandler(getSupplierById)
);

export default router;
