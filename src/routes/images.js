import express from 'express';
import imagesController from '../controllers/images-controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const route = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join('uploads/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); 
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

route.post('/save', upload.single('image'), imagesController.create);

route.get('/get-by-filters', imagesController.get);

route.delete('/delete/:id', imagesController.delete);

export default route;