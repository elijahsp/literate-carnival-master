const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv/config");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const User = require("./model/User");

const pool = require("./db");
var socket = require("socket.io");

var http = require("http").createServer(app);


//test functions
app.get("/", authenticateToken, async ( req, res ) => {
    
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
                    (today.getDate()),
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
        
        var counter=0
        allTests.rows.forEach(function()
        {
            allTests.rows[counter].daterecord.setDate(allTests.rows[counter].daterecord.getDate() + 1)
            counter+=1
        })
        
        
        
        res.json(allTests.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(5500, () => {
    console.log("server start port 5500");
});


app.post("/login", async (req, res) => {
    //----------------------------------------------------login to application
    
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
        req.body.username,
    ]);
    if (user == null) {
        return res.status(400).send("Cannot find user");
    } 
    try {
        if (req.body.password === user.rows[0].password) {
            

            const accessToken = generateAccessToken(user.rows[0].username);
            res.token = accessToken;
            res.append("token", accessToken);
            res.status(200).send(accessToken);
            
        } else {
            res.send("Not Allowed");
            
        }
    } catch (error) {
        console.error(error);
    }
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "turnstile token", (err, user) => {
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
    return jwt.sign(usertoken, "turnstile token", { expiresIn: "1h" });
}
app.get("/authtoken", authenticateToken, async (req, res) => {
    try {
        
        res.send(200);
    } catch (err) {
        console.error(err.message);
    }
});