import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { upload } from "../services/uploadService.js";

const router = express.Router();

// ЗАХИЩЕНИЙ: Завантаження файлу (зображення або відео) у Cloudinary
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Cloudinary повертає URL у властивості path або secure_url
  // multer-storage-cloudinary зазвичай кладе його в path
  const fileUrl = (req.file as any).path || (req.file as any).secure_url;
  
  res.json({ url: fileUrl });
});

export default router;
