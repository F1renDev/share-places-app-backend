const multer = require("multer");
const uuid = require("uuid/v1");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};

//This a group of middlewares
const fileUpload = multer({
  //Max upload size - 500 kb
  limits: 500000,
  //Instruction to how data must be stored
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      //Setting a path where the file will be stored
      callback(null, "uploads/images");
    },
    filename: (req, file, callback) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      //Generating a name for the uploaded file
      callback(null, uuid() + "." + extension);
    }
  }),
  fileFilter: (req, file, callback) => {
    //Converting undefined or null to false
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    callback(error, isValid);
  }
});

module.exports = fileUpload;
