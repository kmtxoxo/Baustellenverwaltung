const express = require('express');
const path = require("path");

/** File import */
const router = require('./controller/router');


/** Initialize express */
const app = express();
var cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-ui/openapi.json');
const environment = require('./environment');

/** Initialize File explorer */
const fs = require('fs');
const imagePath = './public/uploads';
 
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


/** Middleware */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());
app.use(cors({credentials: false, origin: true}))

/** Routes */

app.use('/', router.router);
app.use('/image',express.static(path.resolve('./public/uploads')));

console.log('Server is listening on', environment.serverPort);


if (!fs.existsSync(imagePath)){
    console.log('public image folder does not exit.');
    console.log('creating image folder.');
    fs.mkdirSync(imagePath,{ recursive: true });
}

app.listen(environment.serverPort);

/** Exports */
module.exports = app;
