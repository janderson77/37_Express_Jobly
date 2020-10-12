const db = require('../db')
const moment = require('moment')

class Job {
    static async findAll(title, min, max) {
        if(title){
            const res = await db.query(
                `SELECT title, company_handle FROM jobs WHERE title = $1 AND salary >= $2 AND salary <= $3`,
                [title, min, max]
            )
            if(res.rows.length === 0){
                throw {
                    message: "There are no jobs matching your search",
                    status: 404
                }
            }
            return res.rows
        }
        else{
            const res = await db.query(
                `SELECT title, company_handle FROM jobs WHERE salary >= $1 AND salary <= $2`,
                [min, max]
            )
            if((await res).rows.length === 0){
                throw {
                    message: "There are not jobs with the a salary in this range",
                    status: 404
                }
            }
            return res.rows
        }
        
    }

    static async findOne(id) {
        const res = await db.query(
            `SELECT id, title, salary, equity, company_handle, date_posted FROM jobs WHERE id=$1`, [id]
        );

        if(res.rows.length === 0) {
            throw {
                message: `No jobs found with the id of ${id}`,
                status: 404
            };
        }
        let job = res.rows[0]
        job.date_posted = moment().subtract(10, 'days').calendar();
        return job
    }

    static async createJob(data) {
        const res = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES
            ($1,$2,$3,$4)
            RETURNING *`,
            [data.title, data.salary, data.equity, data.company_handle]
        )

        if (res.rows.length === 0){
            throw {
                message: `ERROR: Could not complete this request. Please check your data`,
                status: 400
            }
        }
        let job = res.rows[0]
        job.date_posted = moment().subtract(10, 'days').calendar();
        return job;
    }

    static async updateJob(id, data) {
        let columns = Object.keys(data);
		let values = Object.values(data);

		//the two arrays are looped over and update queries run for each of them
		for (let i = 0; i < columns.length; i++) {
			await db.query(`UPDATE jobs SET ${columns[i]}='${values[i]}' WHERE id=$1`, [ id ]);
		}

		//The newly updated row is selected and returned
        const res = await db.query(`SELECT * FROM jobs WHERE id = $1`, [ id ]);
        
		return res.rows[0];
    }

    static async deleteJob(id){
        const res = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [ id ]);
		if (res.rows.length === 0) {
			throw {
				message: `There is no job with the id of ${id}`,
				status: 404
			};
		}
		return res.rows[0];
    }
}

module.exports = Job;