const express = require("express")
const sqlite3 = require("sqlite3").verbose()

const app = express()
const db = new sqlite3.Database("./data.sqlite")


const all_users = () => 
    new Promise((resolve, reject) => {
        db.all("SELECT * FROM app_users", (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
        })
    })

app.get("/", async (req, res) => {
    const data = await all_users()
    // console.log(data)
    res.send(data)
})

app.listen(8000, () => console.log("Server is listening at port 8000"))