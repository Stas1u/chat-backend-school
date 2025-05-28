const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "VERY_SECRET_TOKEN"
const { addClient, broadcast } = require('./src/sse')

const sqlite3 = require("sqlite3").verbose()
const Users = require("./src/users.js")
const Servers = require("./src/servers.js")

const app = express()
const db = new sqlite3.Database("./data.sqlite")
const users = new Users(db)
const servers = new Servers(db)


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
}

app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders()
  addClient(res)
});

const all_users = () => 
    new Promise((resolve, reject) => {
        db.all("SELECT * FROM app_users where password = 'admin' and username = 'Admin'", (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })

app.get("/", async (req, res) => {
    const data = await all_users()
    res.send(data)
})

app.post("/login", async (req, res) => {
    try{
        const {username, password} = req.body
        const data = await users.login(username, password)
        if (data.length === 0)
            throw new Error("Wrong username or password")

        const token = jwt.sign({id: data[0].id}, JWT_SECRET, {expiresIn: "1h"})
        res.send({ token })
    }
    catch(e){ res.status(400).send({message: `${e}`}) }
})

app.post("/create-user", async (req, res) => {
    try{
        const userExist = await users.usernameExist(req.body?.username)
        if (userExist)
            throw new Error("User with given name already exist")

        const user = await users.create(
            req.body?.username,
            req.body?.password,
            req.body?.birthday,
            req.body?.gender,
            req.body?.about_me,
            req.body?.avatar_image
        )
        await servers.add_client(1, user.id)
        res.send({message: "success"})
    }
    catch(e){ res.status(400).send({message: `${e}`})}
})
app.post("/user-update", authenticateToken, async (req, res) => {
    try {
        const usernameExist = await users.usernameExist(req.body?.username) 
        if (req.body?.username && usernameExist)
            throw new Error("User with given name already exist")

        await users.update(req.user.id, req.body)
        res.send({message: "success"})
    }
    catch (e) { res.status(400).send({message: `${e}`}) }
})

app.post("/main/send-message", authenticateToken, async (req, res) => {
    try{
        await servers.send_message(1, req.user.id, req.body?.message ?? "")
        broadcast({ message: `Message sended` });
        res.send({message: "success"})
    }
    catch (e) { res.status(400).send({message: `${e}`}) }
})
app.get("/main/messages", authenticateToken, async (req, res) => {
    try{
        const data = await servers.get_messages(1)
        res.send(data)
    }
    catch (e) { res.status(400).send({message: `${e}`}) }
})
app.listen(8000, () => console.log("Server is listening at port 8000"))