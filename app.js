const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const getToday = require(__dirname + "/getDate.js");
const port = 3000;

app.listen(port, () => {
    console.log("server listening on port " + port);
});

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


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

function dbAdd(dataObj) {
    return new Promise(Resolve => {
        mongoose.connect(url, options, () => {
            console.log("server connection made")
        });
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
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
            Resolve("resolved");
        });
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
    return new Promise(Resolve => {
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
            result.save(() => {
                mongoose.disconnect();
                Resolve("resolved");
            });
        });
    }); 
}

function deleteItem(req) {
    return new Promise(Resolve => {
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
                Resolve("resolved");
            });
        });
    });
}

app.get("/", (req, res) => {
    renderPage(getToday.getToday(), res);
});

app.get("/about", (req, res) => {
    res.render("about");
});


app.post("/", async function(req, res) {
    const todoObj = {
        name: req.body.newItem,
        isDone: false
    }
    await dbAdd(todoObj);
    res.redirect("/");

});

app.post("/itemChecked", async function(req, res){
   console.log(req.body);
   await updateCheckboxState(req);
   res.redirect("/"); 
});

app.post("/deleteItem", async function(req, res) {
    await deleteItem(req);
    res.redirect("/");
});

