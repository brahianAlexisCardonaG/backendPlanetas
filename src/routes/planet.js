import express from 'express';
import planetController from '../controllers/planet-controller.js';
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

route.post('/save', upload.single('image'), planetController.create);

route.get('/get-by-filters', planetController.get);

route.delete('/delete/:id', planetController.delete);

route.patch('/update-favorite', planetController.updateFavorite);

export default route;