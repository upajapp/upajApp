require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Crop} = require('./models/crop');
var {User} = require('./models/user');
var {Cprice} = require('./models/cprice');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------------
// cprice
// --------------------------------

app.post('/addCprice', (req, res) => {
  var cprice = new Cprice({
    cname: req.body.cname,
    csp: req.body.csp,
    cnp: req.body.cnp,
    cp: req.body.cp
  });

  cprice.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getAllCprice', (req, res) => {
  Cprice.find({
  }).then((doc) => {
    res.send({doc});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getCpriceByName', (req, res) => {
  var cname = req.body.cname;

  Cprice.findOne({
    cname
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/removeCprice', (req, res) => {
  var cname = req.body.cname;

  Cprice.findOneAndRemove({
    cname
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
    
  });
});

app.post('/updateCprice', (req, res) => {

  var cname = req.body.cname;
  var body = _.pick(req.body, ['cname', 'csp','cnp', 'cp']);

  Cprice.findOneAndUpdate({cname}, {$set: body}, {new: true}).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.send({doc});
  }).catch((e) => {
    res.status(400).send();
  })
});

// --------------------------------
// crop
// --------------------------------


app.post('/addCrop', authenticate, (req, res) => {
  var crop = new Crop({
    cropname: req.body.cropname,
    croptype: req.body.croptype,
    croppic: req.body.croppic,
    cropaddress: req.body.cropaddress,
    cropqty: req.body.cropqty,
    _creator: req.user._id
  });

  crop.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getAllMyCrops', authenticate, (req, res) => {
  Crop.find({
    _creator: req.user._id
  }).then((doc) => {
    res.send({doc});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/getCropById', authenticate, (req, res) => {
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
  var body = _.pick(req.body, ['cropname', 'croptype','croppic', 'cropaddress','cropqty']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
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
  var body = _.pick(req.body, ['name', 'mobile', 'password','lat','lng','acre','cultivation']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({token,user});
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.post('/profileUser', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/loginUser', (req, res) => {
  var body = _.pick(req.body, ['mobile', 'password']);

  User.findByCredentials(body.mobile, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({token,user});
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/logoutUser', authenticate, (req, res) => {
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
