import express from 'express';
import routePlanet from './routes/planet.js';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.use('/planet', routePlanet);


try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=>console.log("programa ejecutado en puerto " +PORT));
} catch (e) {
    console.log(e);
} 