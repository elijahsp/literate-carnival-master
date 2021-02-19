const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv/config");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const schedule = require('node-schedule');
const User = require("./model/User");
 
const pool = require("./db");



const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 },console.log("connect ws"));

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
    console.log(/*'received: %s',*/ message);
    pool.query(
        "SELECT * FROM datatable WHERE daterecord = CURRENT_DATE"
    ).then(response=>{console.log(response.rows[0].seriesnum)
        seriesNo=response.rows[0].seriesnum
        
        var splitter=message.split("\n\r")
              console.log(splitter)
              var mSeries=parseInt(splitter[0].substr(2,9))
              var dSeries=parseInt(splitter[1].substr(2,9))
              var cSeries=parseInt(splitter[2].substr(2,9))
              seriesNoNew=Math.max(mSeries,dSeries,cSeries)
              if(!seriesNo)
              console.log("asdsad")
              additionals=Math.max(seriesNoNew-seriesNo,0)
              
              console.log("Series No:" + seriesNoNew)
              console.log(additionals + " new\n\n")
              if(additionals>0){
                seriesNo=seriesNoNew
                pool.query(
                    `UPDATE datatable SET customer = customer + ${additionals}, seriesnum =${seriesNo} where daterecord = CURRENT_DATE`
                );
           
                                }
                    }
        ).catch((error)=>console.error("error retrieving data: " + error));       
	    
});

 
var checkSeries = schedule.scheduleJob('*/5 * * * *', function(){
    wss.clients.forEach(function each(client) {
try{
      if (client.readyState === WebSocket.OPEN) {
        client.send("3144");
	console.log("sent: 3144 " + Date());
	client.terminate()
      }
}
catch (error) {
console.log("eRRoR ::"+error)
}
    });

    

});


})

//test functions
app.get("/", async (req, res)=>{res.send(":)")});

//get all
app.get("/all", authenticateToken, async (req, res) => {
    try {
        const allRec = await pool.query("SELECT * FROM datatable");
        
        var counter=0
        allRec.rows.forEach(function()
        {
            allRec.rows[counter].daterecord.setDate(allRec.rows[counter].daterecord.getDate() + 1)
            counter+=1
        })
        
        
        
        res.json(allRec.rows);
    } catch (err) {
        console.error(err.message);
    }
});
app.get("/account", authenticateAdmin, async (req, res) => {
    try {
        const allRec = await pool.query("SELECT * FROM users");
        
        
        
        
        
        res.json(allRec.rows);
    } catch (err) {
        console.error(err.message);
    }
});
app.post("/account", authenticateAdmin, async (req, res) => {
    try {
        
        let accDetails=req.body
        console.log(accDetails.username)
       
         
           
            pool.query(
                `INSERT INTO users (username,password) VALUES('${accDetails.username}', '${accDetails.password}') RETURNING *`)
                .then((result)=>{console.log("RESULT" +result)
                res.send(req.body)})
                .catch((error)=>{console.log("ERROR: "+error)
                res.send("bad")}
                )
            
        
        
    } catch (err) {
        console.error(err.message);
        res.send("bad")
        
    }
});

app.delete("/account", authenticateAdmin, async (req, res) => {
    try {
        let accDetails=req.body
        console.log(req.body)
        const allRec = await pool.query(`DELETE FROM users WHERE username='${accDetails.username}' RETURNING *;`);
        
        
        
        
        
        res.send(200); 
    } catch (err) {
        console.error(err.message);
    }
});
app.listen(5500, () => {
    console.log("server start port 5500");
});


app.post("/login", async (req, res) => {
    //----------------------------------------------------login to application
    try{
    const allUser = await pool.query("SELECT * FROM users")
    console.log(allUser.rows)
    
    var userIndex = allUser.rows.findIndex(function(users, index) {
        if(users.username == req.body.username&&users.password==req.body.password)
            return true;
    });
    
    console.log(userIndex)
    if(userIndex==0)
    {
        const accessToken = generateAdminToken(req.body.username);
        console.log("admin")
            res.token = accessToken;
            res.append("token", accessToken);
            var respo="admin " + accessToken
            res.status(200).send(respo);
    }
    else if(userIndex>0)
    {
        const accessToken = generateAccessToken(req.body.username);
        console.log("not admin")
            res.token = accessToken;
            res.append("token", accessToken);
            var respo="notAdmin " + accessToken
            res.status(200).send(respo);
    }
    else
    res.sendStatus(401);
}
    catch(error)
    {console.log(error)}

   
    
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "turnstile token", (err, user) => {
        //console.log(err.message);
        if (err)         
        authenticateAdmin(req,res,next)
        //res.redirect('/login')
        else{
        req.user = user;
        next();}
    });
}
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "admin token", (err, user) => {
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
    console.log(user);
    return jwt.sign(usertoken, "turnstile token", { expiresIn: "1h" });
}
function generateAdminToken(user) {
    const usertoken = {
        username: user,
        time: Date(),
    };
    console.log(user);
    return jwt.sign(usertoken, "admin token", { expiresIn: "1h" });
}
app.get("/authtoken", authenticateToken, async (req, res) => {
    try {
        
        res.send(200);
    } catch (err) {
        console.error(err.message);
    }
});
var rule= new schedule.RecurrenceRule();
rule.hour=6;
rule.minute=0;
var dailies = schedule.scheduleJob(rule, function(){

    let newRec=0;
	    pool.query(
        "SELECT * FROM datatable WHERE daterecord = CURRENT_DATE-1"
    ).then((result)=>{
	
        newRec=result.rows[0].seriesnum
        pool.query(
            `INSERT INTO datatable (customer,daterecord,seriesnum) VALUES(0, CURRENT_DATE, ${newRec}) RETURNING *`
        );
	console.log("added new entry on " + Date())
    }).catch(error=>console.log("eRRor" + error))
    
  });
