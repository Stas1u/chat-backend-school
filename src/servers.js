module.exports = class Servers {
    #db = null
    constructor(db){ this.#db = db }

    add_client(server_id, client_id){
        const query = "INSERT INTO jt_servers_users VALUES (null, ?, ?)"

        return new Promise((resolve, reject) => {
            this.#db.run(query, [server_id, client_id], err =>{
                if (err) reject(err)
                else resolve(true)
            })
        })
    }

    send_message(server_id, creator, content){
        const query = "INSERT INTO messages VALUES (null, ?, ?, ?, ?)"

        return new Promise((resolve, reject) => {
            this.#db.run(query, [new Date(Date.now()).toISOString(), content, server_id, creator], err => {
                if (err) reject(err)
                else resolve(true)
            })
        })
    }
    get_messages(server_id, user_id){
        const query = `SELECT m.*, u.username, u.id = ${user_id} is_yours FROM messages m LEFT JOIN app_users u on u.id = m.user where m.server_id = ${server_id} order by m.id desc limit 40`

        return new Promise((resolve, reject) => {
            this.#db.all(query, (err, rows) => {
                if (err) reject(err)
                else {
                    rows.sort((a, b) => a.id - b.id)
                    resolve(rows)
                }
            })
        })
    }
}