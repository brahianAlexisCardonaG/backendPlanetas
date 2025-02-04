import planetModel from '../models/planet-model.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs'; // Para manejar archivos temporales
class planetController {
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
            const { planetName, planetMass, planetDescription, planetFavorite} = req.body;
            const newImage = {
                planetName,
                planetMass,
                planetDescription,
                planetFavorite,
                imageUrl: result.secure_url,
            };

            const data = await planetModel.create(newImage);

            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async get(req, res) {
        try {
            const { planetName, order } = req.query;
    
            const data = await planetModel.findByPlanetName(planetName, order);
    
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'El planeta no existe.' });
            }
    
            res.status(200).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
    
            // Busca el planeta por id en la base de datos
            const imageRecord = await planetModel.findById(id);
            if (!imageRecord) {
                return res.status(404).json({ error: 'planeta no encontrado.' });
            }
    
            // Obtén el public_id de la imagen (necesario para eliminar de Cloudinary)
            const publicId = imageRecord.imageUrl.split('/').slice(-1)[0].split('.')[0]; // Ejemplo de cómo extraer el public_id
    
            // Elimina la imagen de Cloudinary
            await cloudinary.uploader.destroy(`imagenes/${publicId}`); // Incluye la carpeta si la usaste al subir
    
            // Elimina el registro de la base de datos
            await planetModel.delete(id);
    
            res.status(200).json({ message: 'planeta eliminado correctamente.' });
        } catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    }

    async updateFavorite(req, res) {
        try {
            const { id, planetFavorite } = req.body;

            if (![0, 1].includes(planetFavorite)) {
                return res.status(400).json({ error: 'El valor de planetFavorite debe ser 1 o 0.' });
            }
            const updatedPlanet = await planetModel.updateFavorite(id, planetFavorite);
    
            if (!updatedPlanet) {
                return res.status(404).json({ error: 'El planeta no fue encontrado.' });
            }
    
            res.status(200).json({ message: 'El campo planetFavorite se actualizó correctamente.' });
        } catch (e) {
            res.status(500).send(e);
        }
    }
}

export default new planetController();