process.env.NODE_ENV = 'test';
const { token } = require('morgan');
const request = require('supertest');
const app = require('../../app');
const db = require("../../db")
const User = require("../../models/user")

let testAdmin = {
        username: "admin",
        password: "admin",
        first_name: "admin",
        last_name: "admin",
        email: "admin@test.com",
        photo_url: "http://test.com/testimage"
    }

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

beforeAll(async()=>{
    await request(app).post('/users').send(testAdmin)
    await db.query(`UPDATE users SET is_admin=true WHERE username = 'admin'`)
    const a = await request(app).post(`/users/login`).send({username: testAdmin.username, password: testAdmin.password})
    testAdmin.token = a.body.token
    
})

beforeEach(async()=> {
    const u = await request(app).post('/users').send(testUser)
    testUser.token = u.body.user.token
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
        expect(res.body).toEqual({"users": [{"username": "admin", "first_name": "admin", "last_name": "admin", "email": "admin@test.com"},{"username": "test","first_name": "test",
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
    test('should update only the username for the given user', async () => {
        const res = await request(app).patch(`/users/${testUser.username}`).send({
            username: "robert"
        }).set({_token:testUser.token})

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

    test('should update only the first_name for the given user', async () => {
        const res = await request(app).patch(`/users/${testUser.username}`).send({
            first_name: "robert"
        }).set({_token:testUser.token})

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
    test('should delete a single logged in user', async () => {
        const res = await request(app).delete(`/users/${testUser.username}`).set({_token:testUser.token})

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toEqual("User Deleted")
    })

    test('should return 404 if username matches but is already deleted', async () => {
        await db.query(`DELETE FROM users WHERE username = $1`,[testUser.username])
        const res = await request(app).delete(`/users/${testUser.username}`).set({_token:testUser.token})

        expect(res.statusCode).toBe(404)
        
    })

    test('should return unauthorized for invalid username', async () => {
        const res = await request(app).delete(`/users/bobert`).set({_token:testUser.token})

        expect(res.statusCode).toBe(401)
    })

    
    
    
    
})






afterEach(async () => {
    await db.query(`DELETE FROM users WHERE username != 'admin'`)
})

afterAll(async () => {
    await db.query(`DELETE FROM users`)
	await db.end();
});