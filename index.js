const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv/config");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.set("port", process.env.PORT || 3000);
const User = require("./model/User");

const pool = require("./db");
var socket = require("socket.io");
//var app = require("express")();
var http = require("http").createServer(app);
/*var io = require("socket.io")(http);
//var io = socket.listen(http.listen(3000));

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.emit("newclientconnect", { description: "Hey, welcome!" });
    io.sockets.emit("broadcast", { description: " clients connected!" });
    setInterval(function () {
        socket.emit("newclientconnect", { description: "123456" });
        socket.send("Sent a message 4seconds after connection!");
    }, 10000);
    socket.on("clientEvent", function (data) {
        console.log(data);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

http.listen(8080, () => {
    console.log("listening on *:8080");
    //console.log(app.get("port"));
});
/*var server = http.createServer(app).listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
})
var io = socket.listen(server);
io.sockets.on("connection", function () {
    console.log("hello world im a hot socket");
    io.emit("newclientconnect", { description: "Hey, welcome!" });
    io.on("clientEvent", function (data) {
        console.log(data);
    });
});*/

//test functions
app.get("/", authenticateToken, async ( req, res ) => {
    console.log("wew");
    try {
        const today = new Date();
        console.log(
            today.getFullYear() +
                "-" +
                (today.getMonth() + 1) +
                "-" +
                today.getDate()
        );
        const currentrecord = await pool.query(
            "SELECT * FROM datatable WHERE daterecord = $1",
            [
                today.getFullYear() +
                    "-" +
                    (today.getMonth() + 1) +
                    "-" +
                    today.getDate(),
            ]
        );
        /* currentrecord.rows[0].daterecord.setDate(
            currentrecord.rows[0].daterecord.getDate() + 1
        );*/
        // console.log(currentrecord.rows[0].daterecord);
        res.send(currentrecord.rows[0]);
    } catch (error) {
        console.log(error);
        res.json(error.message);
    }
});

//get all
app.get("/all", authenticateToken, async (req, res) => {
    try {
        const allTests = await pool.query("SELECT * FROM datatable");
        /*allTests.rows[8].daterecord.setDate(
            allTests.rows[8].daterecord.getDate() + 1
        );
        console.log(allTests.rows[8].daterecord);
        var tstdate = new Date(allTests.rows[0].daterecord);
        console.log(tstdate);*/
        res.json(allTests.rows);
    } catch (err) {
        console.error(err.message);
    }
});
/*
//get one
app.get("/testss/:postId", authenticateToken, async (req, res) => {
    try {
        console.log("test1");
        const post = await Post.findById(req.params.postId);
        res.json(post);
    } catch (error) {
        console.log("test2");
        res.json(error.message);
        // res.json(error);
    }
});
*/
app.listen(5500, () => {
    console.log("server start port 5500");
});

/*app.post("/users", async (req, res) => {
    //const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    try {
        const saveUser = await user.save();
        res.json(saveUser);
    } catch {
        res.status({ message: err });
    }
});*/
app.post("/login", async (req, res) => {
    //----------------------------------------------------login to application
    console.log("wew")
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
        req.body.username,
    ]);
    if (user == null) {
        return res.status(400).send("Cannot find user");
    } else console.log("goods");
    try {
        if (req.body.password === user.rows[0].password) {
            console.log("here");

            const accessToken = generateAccessToken(user.rows[0].username);
            res.token = accessToken;
            res.append("token", accessToken);
            res.status(200).send(accessToken);
            //console.log(res);
            console.log(accessToken);
        } else {
            res.send("Not Allowed");
            console.log("nop");
        }
    } catch (error) {
        console.error(error);
    }
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "token", (err, user) => {
        //console.log(err.message);
        if (err) return res.sendStatus(403);
        //res.redirect('/login')

        req.user = user;
        next();
    });
}
function generateAccessToken(user) {
    const usertoken = {
        username: user,
        time: Date(),
    };
    return jwt.sign(usertoken, "token", { expiresIn: "1h" });
}
app.get("/authtoken", authenticateToken, async (req, res) => {
    try {
        console.log("opopop")
        res.send(200);
    } catch (err) {
        console.error(err.message);
    }
});