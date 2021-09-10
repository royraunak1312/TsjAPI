const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');


AdminBro.registerAdapter(AdminBroMongoose);

const app = express();

app.set("view-engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

const itemSchema = new mongoose.Schema({
  name : String,
  price : Number,
  units : Number,
});

const Item = new mongoose.model("Item", itemSchema);


const run = async () => {
  var connection = await mongoose.connect("mongodb://localhost:27017/tsjDB", {useNewUrlParser: true, useUnifiedTopology: true});
  const adminBro = new AdminBro({
    resources: [Item],
    databases: [connection],
    rootPath: '/admin'
  });
  const router = AdminBroExpress.buildRouter(adminBro);
  app.use(adminBro.options.rootPath, router);
}
run();










app.route("/tsj")
  .get(function(req, res){
    Item.find({}, function(err, foundItems){
      if (err){
        console.log(err);
      } else {
      console.log(foundItems);
      }
    });
  })
  .post(function(req, res){
    const newItem = new Item ({
      name : req.body.itemName,
      price : req.body.itemPrice,
      units : req.body.itemUnits
    });
    newItem.save(function(err){
      if (err){
        console.log(err);
      }
      else {
        console.log("Successfully added item to Database");
      }
    });
  })
  .delete(function(req, res){
    Item.deleteMany({}, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted everything from the database.");
      }
    });
  });

app.route("/tsj/:nameOfItem")
  .get(function(req, res){
    Item.findOne({name : req.params.nameOfItem}, function(err, foundItem){
      if (!err){
        console.log(foundItem);
      } else {
        console.log(err);
      }
    })
  })
  .put(function(req, res){
    Item.updateOne({name : req.params.nameOfItem}, {name : req.body.name, price : req.body.price, units : req.body.units}, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully replaced the item!");
      }
    })
  })
  .patch(function(req, res){
    Item.updateOne({name : req.params.nameOfItem},
      {$set : req.body},
      function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Successfully updated the item!");
        }
      })
  })
  .delete(function(req, res){
    Item.deleteOne({name : req.params.nameOfItem}, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted the item");
      }
    })
  });

app.listen(3000, function() {
  console.log("Server running successfully on port 3000");
});
