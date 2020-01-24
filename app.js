const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

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
    "mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/places?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => console.log(err));
