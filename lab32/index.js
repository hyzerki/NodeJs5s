const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

app.use(bodyParser.json());
const routes = require('./routes');
const swaggerConfig = require('./config.json');

app.use(bodyParser.json());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use('/ts', routes);

app.listen(3000, () => console.log(`Listening to http://localhost:3000/`));
