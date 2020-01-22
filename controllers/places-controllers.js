const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../utility/locations");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = TEST_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Could not find a place for provided id", 404);
  }

  res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = TEST_PLACES.filter(p => {
    return p.creator === userId;
  });
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for provided user id", 404)
    );
  } else {
    res.json({ places: places });
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

  const createdPlace = {
    id: uuid(),
    title: title,
    description: description,
    location: coordinates,
    address: address,
    creator: creator
  };

  TEST_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs, please check your data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...TEST_PLACES.find(p => p.id === placeId) };
  const placeIndex = TEST_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  TEST_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!TEST_PLACES.find(p => p.id === placeId)) {
    throw new HttpError("No such place!", 404);
  }
  TEST_PLACES = TEST_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
