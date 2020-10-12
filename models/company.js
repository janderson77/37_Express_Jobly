const db = require('../db');


class Company {
	static async findAll() {
		const res = await db.query(`
        SELECT handle, name
        FROM companies
        `);
		return res.rows;
	}

	static async findOne(handle, min = 0, max = 9999999) {
		//Checks to see if a handle was provided
		if (handle !== undefined) {
			//if a handle was provided it will try to find a company with that handle and the given parameters
			const res = await db.query(
				`SELECT *
            FROM companies
            WHERE handle = $1 AND num_employees >= $2 AND num_employees <= $3`,
				[ handle, min, max ]
			);
			if (res.rows.length === 0) {
				throw {
					message: `There is no company named ${handle} with these parameters, or the company doesn't exist`,
					status: 404
				};
			}
			return res.rows[0];
		} else {
			//if no handle was provided, returns all companies with the given parameters
			const res = await db.query(
				`SELECT handle, name
            FROM companies
            WHERE num_employees >= $1 AND num_employees <= $2`,
				[ min, max ]
			);
			if (res.rows.length === 0) {
				throw {
					message: `There is no company with between ${min} and ${max} employees`,
					status: 404
				};
			}
			return res.rows;
		}
	}

	static async create(data) {
		const res = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *`,
			[ data.handle, data.name, data.num_employees, data.description, data.logo_url ]
		);
		if (res.rows.length === 0) {
			throw { message: `ERROR: Could not complete this request. Please check your data`, status: 400 };
		}
		return res.rows[0];
	}

	static async update(handle, data) {
		//two arrays are created holding the keys and values of the items to be updated
		let columns = Object.keys(data);
		let values = Object.values(data);

		//the two arrays are looped over and update queries run for each of them
		for (let i = 0; i < columns.length; i++) {
			await db.query(`UPDATE companies SET ${columns[i]}='${values[i]}' WHERE handle=$1`, [ handle ]);
		}

		//The newly updated row is selected and returned
		const res = await db.query(`SELECT * FROM companies WHERE handle = $1`, [ handle ]);
		return res.rows[0];
	}

	static async delete(handle) {
		const res = await db.query(`DELETE FROM companies WHERE handle=$1 RETURNING handle`, [ handle ]);
		if (res.rows.length === 0) {
			throw {
				message: `There is no company with handle of ${handle}`,
				status: 404
			};
		}
		return res.rows[0];
	}
}

module.exports = Company;
