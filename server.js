var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var path = require("path");
var mysql = require("mysql");

//mailchimp variables
const Mailchimp = require('mailchimp-api-v3');
require('dotenv').config();

var app = express();
var PORT = process.env.PORT || 2000;



// Parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// tried to serve it up using static file path, but just used get request  instead (not best practicie?)
app.get('/css/style.css', function(req, res){
  res.sendFile(__dirname + '/public/css/style.css');
});



app.use(methodOverride("_method"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//mailchimp api
var mc_api_key = process.env.MAILCHIMP_API_KEY;
var list_id = process.env.MAILING_LIST_ID;
const mailchimp = new Mailchimp(mc_api_key);

//mailchimp route
app.get('/api/memberList', (req, res) => {
  mailchimp.get(`/lists/${list_id}/members`)
  .then(function(results){
    res.send(results);
  })
  .catch(function(err){
    res.send(err);
  });
});

var connection = mysql.createConnection({
  host: "us-cdbr-iron-east-05.cleardb.net",
  port: 3306,
  user: "b9fa8f55bc4889",
  password: "2c1cee2b",
  database: "heroku_1e1a3ef17e3ba90"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// ======================================================

app.get("/", function(req, res){
    connection.query("SELECT * FROM truckloads", function(err, data){
        if (err) throw err;
        res.render("index", { truckloads: data });
    });
});

// POST BUTTON
// ======================================================

var k = 0

app.post("/", function(req, res) {
    connection.query("INSERT INTO truckloads (lane, pickupdate, pickupnumber, ponumber, additional_info) VALUES (?, ?, ?, ?, ?)", 
    [req.body.truckloads, req.body.pickupdate, req.body.pickupnumber, req.body.ponumber, req.body.additional_info], function(err, result) {
      if (err) {
        throw err;
      }
      res.redirect("/");
    });
  });

  app.delete("/:id", function(req, res) {
    connection.query("DELETE FROM truckloads WHERE id = ?", [req.params.id], function(err, result) {
      if (err) {
        throw err;
      }
      res.redirect("/");
    });
  });

  app.put("/", function(req, res) {
      connection.query("UPDATE truckloads SET status = ? WHERE id = ?", [req.body.status, req.body.id], function(err, result) {
        if (err) {
          throw err;
        }
        res.redirect("/");
      });
    });
    
    app.listen(PORT);
console.log("listening on localhost:"+ PORT);