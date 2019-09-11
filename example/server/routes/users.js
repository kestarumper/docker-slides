var express = require("express");
var router = express.Router();
var os = require('os');

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://mongo/mydb";

router.get("/", function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");

    dbo.createCollection("customers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
    });

    var query = {};
    dbo.collection("customers").find(query).toArray(function(err, result) {
      result.push(os.hostname())
      res.json(result);
      db.close();
    });
  });
});

module.exports = router;
