const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const getToday = require(__dirname + "/getDate.js");

const mongoose = require("mongoose");


//TODO: Add new lists (create a name for the list and button to create it)
//TODO: routing for dinamicly created pages.
//TODO: add Delete button next to items
//TODO: query data from database and populate the lists

const port = 3000;

const listItems = []; // this will go away
const workListItems = []; // this will go away

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

function dbAdd(dataObj, collection) {
    const url = "mongodb://localhost:27017/todoList";
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    mongoose.connect(url, options);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", () => {
        console.log("db connection open");
        const todoSchema = new mongoose.Schema({
            todoListItem: {
                type: String,
                required: [true, "no list item name"]
            },
            todoDone: {
                type: Boolean,
                required: [true, "is it finished or not"]
            }
        });
        todoSchema.methods.getisFinished = function() {
            return this.todoFinished;
        };
        todoSchema.methods.getListItem = function() {
            return this.todoListItem;
        }
        const Todo = mongoose.model(collection, todoSchema);

        const todo = new Todo({todoListItem: dataObj.name , todoDone: dataObj.isDone });
        todo.save((err) => {console.log(err)});
    });
}

app.get("/", (req, res) => {

    let ejsObj = {
        listTitle: getToday.getToday(),
        listItems: listItems
    };
    res.render("list", ejsObj);
})

app.get("/work", (req, res) => {
    let ejsObjs = {
        listTitle: "Work",
        listItems: workListItems
    }
    res.render("list", ejsObjs);
})

app.get("/about", (req, res) => {
    res.render("about");
})


app.post("/", (req, res) => {
    console.log(req.body);
    if(req.body.list === "Work") { // make dinamic pages. This will change to dinamic routing from ejs
        workListItems.push(req.body.newItem); // hook up to the database here
        const todoObj = {
            name: req.body.newItem,
            isDone: false
        };
        dbAdd(todoObj, "Todo");
        res.redirect("/work");
    }
    else {
        dbAdd(todoObj, "Todo");
        listItems.push(req.body.newItem); // here hook it up to databse
        res.redirect("/");
    }
    
});

app.listen(port, () => {
    console.log("server listening on port " + port);
});