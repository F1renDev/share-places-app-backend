const express = require("express");
const router = express.Router();

const TEST_PLACES = [
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

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = TEST_PLACES.find(p => {
    return p.creator === userId;
  });
  if (!place) {
    res.status(404).json({
      message: "Could not find a place for this user id"
    });
  } else {
    res.json({
      place: place
    });
  }
});

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = TEST_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    res.status(404).json({
      message: "Could not find a place for this id"
    });
  } else {
    res.json({
      place: place
    });
  }
});

module.exports = router;
