require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Crop} = require('./models/crop');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --------------------------------
// crop
// --------------------------------

app.post('/addCrop', authenticate, (req, res) => {
  var crop = new Crop({
    text: req.body.text,
    _creator: req.user._id
  });

  crop.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getAllCrops', authenticate, (req, res) => {
  Crop.find({
    _creator: req.user._id
  }).then((doc) => {
    res.send({doc});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getMyCrop', authenticate, (req, res) => {
  var id = req.body.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Crop.findOne({
    _id: id,
    _creator: req.user._id
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/removeCrop', authenticate, (req, res) => {
  var id = req.body.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Crop.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
    
  });
});

app.post('/updateCrop', authenticate, (req, res) => {
  var id = req.body.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Crop.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  })
});

// --------------------------------
// user
// --------------------------------

app.post('/registerUser', (req, res) => {
  var body = _.pick(req.body, ['name', 'mobile', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/loginUser', (req, res) => {
  var body = _.pick(req.body, ['name','mobile', 'password']);

  User.findByCredentials(body.name, body.mobile, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});


// --------------------------------
// listen
// --------------------------------

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
