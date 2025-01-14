import { ObjectId } from "mongodb";
import dbclient from "../config/dbclient.js"
class imagesModel {

    async create(image) {
        const now = new Date();
    
        // Guarda la fecha como un objeto Date
        image.date = new Date(now.toISOString().split('T')[0]); // Solo la fecha (YYYY-MM-DD)
    
        // Guarda la hora como un string formateado (HH:mm:ss)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        image.hour = `${hours}:${minutes}:${seconds}`;
    
        const colecImages = dbclient.db.collection('images');
        return await colecImages.insertOne(image);
    }


    // Método para obtener el conteo de imágenes agrupadas por hora exacta
    async getGroupedByHour(filters) {
        const colecImages = dbclient.db.collection('images');

        // Si no hay filtros, no aplicamos ningún filtro adicional, solo agrupamos por hora
        const pipeline = [];

        if (Object.keys(filters).length > 0) {
            // Si hay filtros, aplicamos el filtro de fecha y hora
            pipeline.push({ $match: filters });
        }

        // Agrupamos por la hora exacta (HH:00) y contamos la cantidad de registros por cada hora
        pipeline.push({
            $project: {
                hour: {
                    $concat: [
                        { $substr: ["$hour", 0, 2] }, // Extraemos las primeras dos letras (HH) de la propiedad 'hour'
                        ":00" // Añadimos los minutos y segundos a 00
                    ]
                },
            }
        });

        // Agrupamos por la hora exacta y contamos los registros
        pipeline.push({
            $group: {
                _id: "$hour", // Usamos la hora formateada como clave de agrupación
                recordCount: { $sum: 1 } // Contamos los registros por cada hora exacta
            }
        });

        // Cambiar el campo _id a hour en lugar de _id
        pipeline.push({
            $addFields: {
                hour: "$_id", // Renombramos _id a hour
            }
        });

        // Eliminar el campo _id original
        pipeline.push({
            $project: {
                _id: 0, // Eliminar el campo _id
            }
        });

        // Ordenamos por hora
        pipeline.push({
            $sort: { hour: 1 } // Ordenamos las horas de forma ascendente
        });

        // Ejecutamos la agregación
        const groupedData = await colecImages.aggregate(pipeline).toArray();

        // Ahora obtenemos los registros detallados
        const records = await colecImages.find(filters).toArray();

        return {
            groupedByHour: groupedData,
            records: records
        };
    }

    async delete(id) {
        const colecImages = dbclient.db.collection('images');
        return await colecImages.deleteOne({_id: new ObjectId(id)});
    }

    async findById(id) {
        const colecImages = dbclient.db.collection('images');
        return await colecImages.findOne({ _id: new ObjectId(id) });
    }

}

export default new imagesModel();