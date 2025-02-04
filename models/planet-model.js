import { ObjectId } from "mongodb";
import dbClient from "../config/dbClient.js"
class planetModel {

    async create(image) {
        const now = new Date();
    
        // Guarda la fecha como un objeto Date
        image.date = new Date(now.toISOString().split('T')[0]); // Solo la fecha (YYYY-MM-DD)
    
        // Guarda la hora como un string formateado (HH:mm:ss)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        image.hour = `${hours}:${minutes}:${seconds}`;
    
        const colecImages = dbClient.db.collection('images');
        return await colecImages.insertOne(image);
    }


    async findByPlanetName(planetName,  order = 'asc') {
        const colecImages = dbClient.db.collection('images');
    
        const query = planetName ? { planetName: { $regex: new RegExp(planetName, 'i') } } : {};
    
        const sortOrder = order === 'desc' ? -1 : 1;

        const planets = await colecImages.find(query).sort({ planetName: sortOrder }).toArray();
        
        return {
            totalRegisters: planets.length,
            planets: planets
        };
    }
    

    async delete(id) {
        const colecImages = dbClient.db.collection('images');
        return await colecImages.deleteOne({_id: new ObjectId(id)});
    }

    async findById(id) {
        const colecImages = dbClient.db.collection('images');
        return await colecImages.findOne({ _id: new ObjectId(id) });
    }

    async updateFavorite(id, planetFavorite) {
        const colecImages = dbClient.db.collection('images');
        
        const result = await colecImages.updateOne(
            { _id: new ObjectId(id) },
            { $set: { planetFavorite } } 
        );
    
        return result.matchedCount > 0;
    }

}

export default new planetModel();