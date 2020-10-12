const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/expressError');

function authenticateJWT(req, res, next) {
    try {
      const tokenFromHeader = req.headers._token;
      const payload = jwt.verify(tokenFromHeader, SECRET_KEY);
      req.user = payload;
      return next();
    } catch (e) {
      // error in this middleware isn't error -- continue on
      return next(e);
    }
  }

  function ensureLoggedIn(req, res, next) {
    try {
      const tokenFromHeader = req.headers._token;
      const payload = jwt.verify(tokenFromHeader, SECRET_KEY);
      req.user = payload;
      if(payload.username !== String(req.params.username)){
        const err = new ExpressError("Unauthorized", 401)
        return next(err)
      }
      return next();
    } catch (e) {
      return next(e);
    }
    

    // if (!req.user) {
    //   const err = new ExpressError("Unauthorized", 401);
    //   return next(err);
    // } else {
    //   return next();
    // }
  }

  function ensureAdmin(req, res, next) {
    try {
      const tokenFromHeader = req.headers._token
      const payload = jwt.verify(tokenFromHeader, SECRET_KEY)
      req.user = payload;
      if(payload.is_admin !== true){
        const err = new ExpressError("Unauthorized", 401)
        return next(err)
      }
      return next()
    } catch (e) {
      return next(e) 
    }
  }

  module.exports = {authenticateJWT, ensureAdmin, ensureLoggedIn}