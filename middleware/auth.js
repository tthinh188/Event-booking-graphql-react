const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    const token = req.get('Authorization');
    
    if (!token || token == '') {
        req.isAuth = false;
        return next();
    }
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);

    } catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decoded) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.user = decoded;
    next();
}