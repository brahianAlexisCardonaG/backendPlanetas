import { MongoClient } from "mongodb";
import 'dotenv/config';

class dbClient {
    
    constructor() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority&appName=Images`;
        this.client = new MongoClient(queryString);
        this.connectDB();
    }

    async connectDB(){
        try{
            await this.client.connect();
            this.db = this.client.db('images');
            console.log("conectado el servidor de DB")
        }catch(e){
            console.log(e)
        }
    }
}

export default new dbClient;