const express = require("express");
const path = require('path')
const userRouter = require('./routes/user')
const blogRouter = require('./routes/blog')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog")


const app = express();
const PORT = 8000;

mongoose.connect("mongodb://localhost:27017/Blog-API1").then(()=>{console.log("MongoDB Connected")});


app.use(express.urlencoded({extended: false}))
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")))

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res)=>{
    const allBlogs = await Blog.find({})
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    })
})

app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.listen(PORT, ()=>{console.log("Server started")});