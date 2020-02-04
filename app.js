const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

//Middleware to return files only from the given folder
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(async (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// only runs if a response was not sent untill now
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

// if used with 4 arguments and if any previous middleware yields an error
// this function will be treated as a special error handler
app.use((error, req, res, next) => {
  //If there was some error (this is error handling middleware)
  //the uploaded file is going to be delete

  //Multer package adds a new property to the request object - 'file'
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  //not sending a response if it was somehow already sent before
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occured"
  });
});

// If the connection to the db was not successfull - the server won't start
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-lhqoo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => console.log(err));
