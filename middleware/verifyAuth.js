const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: err.message });
        }
        req.userId = decoded.userId;
        req.email = decoded.userId;
        next();
      });
}

module.exports = verifyAuth