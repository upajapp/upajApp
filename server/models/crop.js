var mongoose = require('mongoose');

var Crop = mongoose.model('Crop', {
  cropname: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  croptype: {
    type: String,
    trim: true
  },
  croppic: {
    type: String,
    trim: true
  },
  cropaddress: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  cropdate: {
    type: Number,
    default: Date.now
  },
  cropqty: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Crop};
