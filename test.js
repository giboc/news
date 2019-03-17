let express = require("express");
let mongoose = require("mongoose");
let axios = require("axios");
let app = express();
const cheerio = require('cheerio')
const PORT = 3001;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    let newsObject = new mongoose.Schema({
        title: String,
        link: String,
        thumbnail: String
    });

    let newsModel = mongoose.model("newsModel", newsObject);

    app.get("/", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.nytimes.com/section/world").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            let $ = cheerio.load(response.data);
            
            // Now, we grab every h2 within an article tag, and do the following:
            $("article h2").each(function (i, element) {

                // Save an empty result object
                // console.log(element);
                let result = {};
                
                // Add the text and href of every link, and save them as properties of the result object
                
               
                
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");
                result.thumbnail = $(this).parent().parent().children("figure").children("a").children("img").attr("src");
                
                let article = new newsModel({title: result.title, link: result.link, thumbnail: result.thumbnail})

                // console.log(article); 

                article.save();
                
            });
            newsModel.find().exec( (data) => {
                console.log(data);
            })
            // Send a message to the client
            res.send("stop");
        });
    });
        
    

});



app.listen(process.env.PORT || PORT);