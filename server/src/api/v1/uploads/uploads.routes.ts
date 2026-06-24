import { Router } from "express";
import multer from "multer";
import { signUpload, uploadProxy } from "./uploads.controller";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authenticate } from "../../../middleware/authenticate";
import { validate } from "../../../middleware/validate";
import { signUploadSchema } from "./uploads.schema";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Any authenticated user may request a signed upload URL for their own object
// path. Scope + content-type allowlist + batch cap are enforced in the schema
// and storage helper.
router.post("/sign", authenticate, validate(signUploadSchema), asyncHandler(signUpload));

// Securely proxy actual file uploads to Cloudinary from server-side to bypass client-side CORS issues
router.post(
  "/upload-proxy",
  authenticate,
  upload.single("file"),
  asyncHandler(uploadProxy)
);

export default router;
