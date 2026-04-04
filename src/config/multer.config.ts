import multer from 'multer';

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 5MB
  },
});
