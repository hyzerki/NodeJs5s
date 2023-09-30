import bodyParser from "body-parser";
import express from 'express';
import swaggerUi from "swagger-ui-express";
import swaggerConfig from "./config.json" assert { "type": "json" };
import routes from "./routes.mjs";

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.json());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use('/ts', routes);

app.listen(3000, () => console.log(`Listening to http://localhost:3000/swagger`));
