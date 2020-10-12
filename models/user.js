const db = require('../db')
const bcrypt = require('bcrypt')

class User {
    static async createUser(data){
        const res = await db.query(
            `INSERT INTO users
            (username, password, first_name, last_name, email, photo_url)
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING username, first_name, last_name, email, photo_url, is_admin`,
            [data.username, data.password, data.first_name, data.last_name, data.email, data.photo_url]
        )

        if (res.rows.length === 0){
            throw {
                message: `ERROR: Could not complete this request. Please check your data`,
                status: 400
            }    
        }
        return res.rows[0]
    }

    static async loginUser(username, password){
        const res = await db.query(
            `SELECT password FROM users WHERE username = $1`,[username]
        )
        const user = res.rows[0]
    
        if(user){
            if(await bcrypt.compare(password, user.password) === true){
                const res2 = await db.query(`SELECT username, is_admin FROM users WHERE username = $1`,[username])
                return res2.rows[0]
            }
        }
        return false
    }

    static async getAllUsers(){
        const res = await db.query(
            `SELECT username, first_name, last_name, email
            FROM users
            ORDER BY last_name`
        )

        if(res.rows.length === 0){
            throw {
                message: "ERROR: Please contact system administator",
                status: 500
            }
        }

        return res.rows
    }

    static async getOneUser(username){
        const res = await db.query(
            `SELECT username, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username = $1`,
            [username]
        )

        if(res.rows.length === 0){
            throw {
                message: `Error: Could not locate the user with username ${username}`,
                status: 404
            }
        }
        return res.rows[0]
    }

    static async updateUser(username, data) {
        let columns = Object.keys(data);
		let values = Object.values(data);

		//the two arrays are looped over and update queries run for each of them
		for (let i = 0; i < columns.length; i++) {
			await db.query(`UPDATE users SET ${columns[i]}='${values[i]}' WHERE username=$1`, [ username ]);
        }
        
        //The newly updated row is selected and returned
        if(data.username){
            const res = await db.query(`SELECT username, first_name, last_name, email, photo_url, is_admin FROM users WHERE username = $1`, [ data.username ]);

            return res.rows[0];
        }else{
            const res = await db.query(`SELECT username, first_name, last_name, email, photo_url, is_admin FROM users WHERE username = $1`, [ username ]);

            return res.rows[0];
        }
		
        
        
		
    }

    static async deleteUser(username){
        const res = await db.query(`DELETE FROM users WHERE username=$1 RETURNING username`, [ username ]);
		if (res.rows.length === 0) {
			throw {
				message: `There is no user with the username of ${username}`,
				status: 404
			};
		}
		return res.rows[0];
    }
}

module.exports = User;