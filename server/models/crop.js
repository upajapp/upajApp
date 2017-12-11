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
  pic: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  date: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Crop};
