//import 'dotenv/config';
import express from 'express';
import routeImages from './routes/images.js';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.use('/images', routeImages);


try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=>console.log("programa ejecutado en puerto " +PORT));
} catch (e) {
    console.log(e);
} 