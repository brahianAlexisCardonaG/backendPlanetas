import imagesModel from '../models/images-model.js';
import cloudinary from '../config/cloudinaty.js';
import fs from 'fs'; // Para manejar archivos temporales
class imagesController {
    constructor() {

    }

    async create(req, res) {
        try {
            // Verifica que se haya enviado un archivo
            if (!req.file) {
                return res.status(400).json({ error: 'No se envió ninguna imagen.' });
            }

            // Sube la imagen a Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'imagenes', // Carpeta opcional en Cloudinary
            });

            // Elimina el archivo temporal del servidor
            fs.unlinkSync(req.file.path);

            // Guarda los datos en la base de datos
            const { personName } = req.body;
            const newImage = {
                personName,
                imageUrl: result.secure_url, // URL segura devuelta por Cloudinary
            };

            const data = await imagesModel.create(newImage);

            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async get(req, res) {
        try {
            const { dateInitial, dateFinal, hour } = req.query;

            const filters = {};

            if (dateInitial) {
                filters.date = { $gte: new Date(dateInitial) };
            }

            if (dateFinal) {
                filters.date = filters.date || {};
                filters.date.$lte = new Date(dateFinal);
            }

            if (hour) {
                filters.hour = hour; // Hora exacta
            }

             // Llamamos al modelo para obtener las imágenes agrupadas por hora
             const data = await imagesModel.getGroupedByHour(filters);


             if (!data || data.records.length === 0) {
                return res.status(200).json({ groupedByHour: [], records: [] });
            }

             // Respondemos con los datos obtenidos
             res.status(200).json(data);

        } catch (e) {
            res.status(500).send(e);
        }
    }


    async delete(req, res) {
        try {
            const { id } = req.params;
    
            // Busca la imagen en la base de datos
            const imageRecord = await imagesModel.findById(id);
            if (!imageRecord) {
                return res.status(404).json({ error: 'Imagen no encontrada.' });
            }
    
            // Obtén el public_id de la imagen (necesario para eliminar de Cloudinary)
            const publicId = imageRecord.imageUrl.split('/').slice(-1)[0].split('.')[0]; // Ejemplo de cómo extraer el public_id
    
            // Elimina la imagen de Cloudinary
            await cloudinary.uploader.destroy(`imagenes/${publicId}`); // Incluye la carpeta si la usaste al subir
    
            // Elimina el registro de la base de datos
            await imagesModel.delete(id);
    
            res.status(200).json({ message: 'Imagen eliminada correctamente.' });
        } catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    }
}

export default new imagesController();