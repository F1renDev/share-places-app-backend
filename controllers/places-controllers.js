const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../utility/locations");
const Place = require("../models/place");

let TEST_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world",
    location: {
      lat: 40.7483405,
      lng: -73.9858531
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1"
  }
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    // This error goes off if there is somethig wrong woth the request
    const error = new HttpError("Could not find a place", 500);
    return next(error);
  }

  if (!place) {
    //This error goes off if there is no such place with given id
    const error = new HttpError("Could not find a place for provided id", 404);
    return next(error);
  }

  // Turning the mongoose object into a normal JavaScript object
  // and { getters: true } => adding the id property without and
  // underscore (the _id will still be there, we just add a new prop)
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    // This error goes off if there is somethig wrong woth the request in general
    const error = new HttpError(
      "Fetching places faild, please try again later",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for provided user id", 404)
    );
  } else {
    res.json({
      places: places.map(place => place.toObject({ getters: true }))
    });
  }
};

// Simulating the delay of getting some data from the google maps api
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check your data", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates = await getCoordsFromAddress(address);

  const createdPlace = new Place({
    title: title,
    description: description,
    address: address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/The_lonely_skyscraper_%28Unsplash%29.jpg/1200px-The_lonely_skyscraper_%28Unsplash%29.jpg",
    creator: creator
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed, try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check your data", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update palce",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
