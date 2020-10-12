process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require("../../db")
const User = require("../../models/user")

let testUser = {
    username: "test",
    password: "test",
    first_name: "test",
    last_name: "test",
    email: "test@test.com",
    photo_url: "http://test.com/testimage"
}

let testUser2 = {
    username: "test2",
    password: "test2",
    first_name: "test2",
    last_name: "test2",
    email: "test2@test.com",
    photo_url: "http://test2.com/testimage2"
}

beforeEach(async()=> {
    await User.createUser(testUser)
})

describe('POST /users', () => {
    test('should create one user', async () => {
        const res = await request(app).post('/users').send(testUser2)

        expect(res.statusCode).toBe(201)
    })

    test('should create one user with missing photo_url', async () => {
        const res = await request(app).post('/users').send(
            {
                username: "test3",
                password: "test3",
                first_name: "test3",
                last_name: "test3",
                email: "test3@test.com"
            }
        )

        expect(res.statusCode).toBe(201)
    })


    

    test('should not create a user with missing username or email', async() => {
        const res = await request(app).post('/users').send(
            {
                password: "test3",
                first_name: "test3",
                last_name: "test3",
                email: "test3@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        const res2 = await request(app).post('/users').send(
            {
                username: "test3",
                password: "test3",
                first_name: "test3",
                last_name: "test3",
                photo_url: "http://test3.com/testimage2"
            }
        )

        expect(res.statusCode).toBe(400)
        expect(res2.statusCode).toBe(400)
    })

    test('should not create a user with missing password', async() => {
        const res = await request(app).post('/users').send(
            {
                username: "test3",
                first_name: "test3",
                last_name: "test3",
                email: "test3@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        expect(res.statusCode).toBe(400)
    })

    test('should not create a user with missing first or last name', async() => {
        const res = await request(app).post('/users').send(
            {
                username: "test3",
                password: "test3",
                first_name: "test3",
                email: "test3@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        const res2 = await request(app).post('/users').send(
            {
                username: "test3",
                password: "test3",
                last_name: "test3",
                email: "test3@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        expect(res.statusCode).toBe(400)
        expect(res2.statusCode).toBe(400)
    })

    test('should not create a user with duplicate email', async() => {
        const res = await request(app).post('/users').send(
            {
                username: "test3",
                password: "test3",
                first_name: "test3",
                last_name: "test3",
                email: "test@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        expect(res.statusCode).toBe(500)
    })

    test('should not create a user with duplicate username', async() => {
        const res = await request(app).post('/users').send(
            {
                username: "test",
                password: "test3",
                first_name: "test3",
                last_name: "test3",
                email: "test3@test.com",
                photo_url: "http://test3.com/testimage2"
            }
        )

        expect(res.statusCode).toBe(500)
    })
    
    
})

describe('GET /users', () => {
    test('should get list of all users', async () => {
        const res = await request(app).get('/users')

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"users": [{"username": "test","first_name": "test",
        "last_name": "test",
        "email": "test@test.com",}]})
    })
    
})

describe('GET /users/:username', () => {
    test('should get a single user by username', async () => {
        const res = await request(app).get(`/users/${testUser.username}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({"user": {
            "username": "test",
            "first_name": "test",
            "last_name": "test",
            "email": "test@test.com",
            "photo_url": "http://test.com/testimage",
            "is_admin": false
    }})
    })

    test('should return 404 for invalid username', async () => {
        const res = await request(app).get(`/users/bobert`)

        expect(res.statusCode).toBe(404)
    })
    
    
})

describe('PATCH /users/:username', () => {
    test('should update only the username', async () => {
        const res = await request(app).patch(`/users/${testUser.username}`).send({
            username: "robert"
        })

        expect(res.statusCode).toBe(200)
        expect(res.body.user).toEqual(
            {
                "username": "robert",
                "first_name": testUser.first_name,
                "last_name": testUser.last_name,
                "email": testUser.email,
                "photo_url": testUser.photo_url,
                "is_admin": false
              }
        )
    })

    test('should update only the first_name', async () => {
        const res = await request(app).patch(`/users/${testUser.username}`).send({
            first_name: "robert"
        })

        expect(res.statusCode).toBe(200)
        expect(res.body.user).toEqual(
            {
                "username": testUser.username,
                "first_name": "robert",
                "last_name": testUser.last_name,
                "email": testUser.email,
                "photo_url": testUser.photo_url,
                "is_admin": false
              }
        )
    })
    
})

describe('DELETE /users/:username', () => {
    test('should delete a single user', async () => {
        const res = await request(app).delete(`/users/${testUser.username}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toEqual("User Deleted")
    })

    test('should return 404 for invalid username', async () => {
        const res = await request(app).delete(`/users/bobert`)

        expect(res.statusCode).toBe(404)
    })
    
    
})






afterEach(async () => {
    await db.query(`DELETE FROM users`)
})

afterAll(async () => {
	await db.end();
});