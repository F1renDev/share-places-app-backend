const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  //Before sending an actual POST request, the browser sends an OPTIONS request
  // and this check ensures that this OPTIONS request is not blocked
  if (req.method === "OPTIONS") {
    return next();
  }

  //Extracting token from the headers sent from the frontend
  try {
    //Token comes looking like this: Authorization: "Bearer TOKEN"
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authorization failed!");
    }
    //If the token is there, it is checked for being the correct one
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //Dynamically adding data (the userId) to the request
    req.userData = { userId: decodedToken.userId };
    //At this point the user is authenticated and the request can continue it's journey
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 403);
    return next(error);
  }
};
