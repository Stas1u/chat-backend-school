module.exports = class Users{
    #db = null
    constructor(db){
        this.#db = db
    }

    login(username, password){
        const query = `
            SELECT * FROM app_users 
            where password = "${password}" and username = '${username}'
        `
        const db = this.#db

        return new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }
    create(username, password, birthday, gender, about_me, avatar_image){
        const query = `INSERT INTO app_users VALUES (null, ?, ?, ?, ?, ?, ?)`
        const db = this.#db

        return new Promise((resolve, reject) => {
            db.run(query, [username, password, birthday, gender, about_me, avatar_image], function(err) {
                if (err) reject(err)
                else resolve({id: this.lastID})
            })
        })
    }
    usernameExist(username){
        const query = `Select * from app_users where username = "${username}"`

        return new Promise((resolve, reject) => {
            this.#db.all(query, (err, rows) =>{
                if (err) reject(err)
                else resolve(rows.length !== 0)
            })
        })
    }
    update(client_id, user){
        const query = `
            UPDATE app_users SET
                username  = IFNULL(?, username),
                password  = IFNULL(?, password),
                birthday  = IFNULL(?, birthday),
                gender    = IFNULL(?, gender),
                about_me  = IFNULL(?, about_me),
                avatar_image  = IFNULL(?, avatar_image)
            WHERE id = ?
        `
        const values = [
            user?.username ?? null,
            user?.password ?? null,
            user?.birthday ?? null,
            user?.gender ?? null,
            user?.about_me ?? null,
            user?.avatar_image ?? null,
            client_id
        ]

        return new Promise((resolve, reject) => {
            this.#db.run(query, values, function(err) {
                if (err) reject(err)
                else if (this.changes === 0) reject("Can't update given user")
                else resolve(this.changes > 0)
            })
        })
    }
}