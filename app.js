const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const getToday = require(__dirname + "/getDate.js");


const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/todoList";
const options = { useNewUrlParser: true, useUnifiedTopology: true };
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
const Todo = mongoose.model("Todo", todoSchema);
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

function dbAdd(dataObj) {
    console.log("Adding object to mongodb");
    mongoose.connect(url, options, () => {console.log("server connection made")});
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    console.log("test1");

    const todo = new Todo({
        todoListItem: dataObj.name,
        todoDone: dataObj.isDone
    });
    todo.save((err) => {
        console.log("Item saved to database");
        if (err) {
            console.log(err)    
        }
        mongoose.disconnect();
    });
}

function renderPage(pageName, res) {
    mongoose.connect(url, options, () => {console.log("mongoose connection made")});
    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error"));
    Todo.find({}, (err, result) => {
        if(err) {
            console.log(err);
        }
        else {
            ejsObj = {
                listTitle: pageName,
                listItems: result
            }
            res.render("list", ejsObj);
        }
        mongoose.disconnect();
    });
}

function updateCheckboxState(req) {
    mongoose.connect(url, options);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    console.log(req.body);
    Todo.findOne({_id: req.body.checkbox}, (err, result) => {
        console.log(result);
        if (err) {
            console.log(err);
        }
        else if (!result) {
            console.log("result was null\nReturning before failure\n"); // currently always failing if the box is checked
            return ;
        }
        console.log(result.todoDone); // giving null only when box is checked
        result.todoDone = (result.todoDone === true ? false : true); 
        result.save(() => {mongoose.disconnect();});
    });
}

function deleteItem(req) {
    mongoose.connect(url, options);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    Todo.findOneAndDelete({_id: req.body.itemId}, (err, result) => {
        console.log(result + "\nhas been deleted from database.")
        if (err) {
            console.log(err);
        }
        result.save(() => {
            mongoose.disconnect();
        });
    })
    req.body.itemId
}

app.get("/", (req, res) => {
    
    renderPage(getToday.getToday(), res);

});

app.get("/about", (req, res) => {
    res.render("about");
});


app.post("/", (req, res) => {
    console.log("post request received");
    //console.log(req.body);
    workListItems.push(req.body.newItem); // hook up to the database here
    const todoObj = {
        name: req.body.newItem,
        isDone: false
    }
    if(req.body.list === "Work") { // make dinamic pages. This will change to dinamic routing from ejs
        
        dbAdd(todoObj);
        res.redirect("/work");
    }
    else {
        dbAdd(todoObj);
        console.log("past dbAdd");
        res.redirect("/");
    }

});

app.post("/itemChecked", (req, res) => {
   console.log(req.body);
   updateCheckboxState(req);
   // update the database at req.body.checkbox
   res.redirect("/"); 
});

app.post("/deleteItem", (req, res) => {
    deleteItem(req);
    res.redirect("/");
});

app.listen(port, () => {
    console.log("server listening on port " + port);
});