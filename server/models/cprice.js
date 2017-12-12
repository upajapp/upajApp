var mongoose = require('mongoose');

var Cprice = mongoose.model('Cprice', {
  cname: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    unique: true
  },
  csp: {
    type: Number,
    default: null
  },
  cnp: {
    type: Number,
    default: null
  },
  cp: {
    type: Number,
    default: null
  },
  cpdate: {
    type: Number,
    default: Date.now
  }
});

module.exports = {Cprice};
