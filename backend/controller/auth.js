const jwt = require('jsonwebtoken');
const path = require("path");
const fs = require("fs");


exports.verifyToken = (req, res, next) => {
    
    if (!req.headers.authorization) {
      return res.status(401).send({ auth: false, message: 'No token provided.' });
    }
    var token =  req.headers.authorization.split(' ')[1];
    var cert = fs.readFileSync(path.resolve(__dirname, '../public.key'));
    jwt.verify(token, cert, (err, decoded) => {
      if (err) {
        return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
      }
        
      // if everything good, save to request for use in other routes
      req.userId = decoded.userId;
      req.name = decoded.name;
      next();
    });
}