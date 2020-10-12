process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../../app');

const db = require("../../db")

const Company = require('../../models/company')

let comp = {
    handle: "comp",
    name: "A company",
    num_employees: 55,
    description: "A fake company",
    logo_url: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
}

let fakeCompany = {
    handle: "fake",
    name: "Fake Name",
    num_employees: 5,
    description: "A fake company",
    logo_url: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
}

let fakeCompany2 = {
    handle: "real",
    name: "Real Name",
    num_employees: 25,
    description: "A totally real company",
    logo_url: "https://images.unsplash.com/photo-1602249261246-2b99c4d1ca56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
}

beforeEach(async ()=> {
    await Company.create(fakeCompany)
    await Company.create(comp)
    
})

describe('GET /companies', () => {
    test('Gets full list of companies', async () => {
        const res = await request(app).get(`/companies`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies: [{"handle": fakeCompany.handle, "name": fakeCompany.name},
        {"handle": comp.handle, "name": comp.name}]})
    })
})

describe('GET /companies/:handle', () => {
    test('Gets one company by handle', async () => {
        const res = await request(app).get(`/companies/${fakeCompany.handle}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company: fakeCompany})
    })

    test('Returns 404 for invalid handle', async () =>{
        const res = await request(app).get(`/companies/hehehehehe`)

        expect(res.statusCode).toBe(404)
    })
})

describe('POST /companies', () => {
    test('Creates a new company', async() => {
        const res = await request(app).post('/companies').send(fakeCompany2)

        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({company: fakeCompany2})
    })

    test('Does not create a company with missing handle', async() => {
        const res = await request(app).post('/companies').send({name: "Real Name",
        num_employees: 25,
        description: "A totally real company",
        logo_url: "https://images.unsplash.com/photo-1602249261246-2b99c4d1ca56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"})

        expect(res.statusCode).toBe(400)
    })

    test('Does not create a company with a missing name', async() => {
        const res = await request(app).post('/companies').send({
        handle:"huh",
        num_employees: 25,
        description: "A totally real company",
        logo_url: "https://images.unsplash.com/photo-1602249261246-2b99c4d1ca56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"})

        expect(res.statusCode).toBe(400)
    })

    test('Will create a company with only handle and name', async () => {
        const res = await request(app).post('/companies').send({
            handle:"huh",
            name: "I don't know"})

        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({company: {
            handle:"huh",
            name: "I don't know",
            num_employees: null,
            description: null,
            logo_url: null
        }})
    })
})

describe('PATCH /companies/:handle', () => {
    test('Will only update the num_employees', async()=>{
        const res = await request(app).patch(`/companies/${fakeCompany.handle}`).send({num_employees: 250})

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company: {
        handle: "fake",
        name: "Fake Name",
        num_employees: 250,
        description: "A fake company",
        logo_url: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
        }})
    })

    test('Will not update num_employees if value is not type Integer', async () => {
        const res = await request(app).patch(`/companies/${fakeCompany.handle}`).send({num_employees: "1"})

        expect(res.statusCode).toBe(400)
    })

    test('Will not update name if not type String', async () => {
        const res = await request(app).patch(`/companies/${fakeCompany.handle}`).send({name: 52})

        expect(res.statusCode).toBe(400)
    })

    test('Will not update handle if not type String', async () => {
        const res = await request(app).patch(`/companies/${fakeCompany.handle}`).send({handle: 42})

        expect(res.statusCode).toBe(400)
    })

    
})

describe("/DELETE /companies/:handle", () => {
    test('Will delete a single company by handle', async () => {
        const res = await request(app).delete(`/companies/${fakeCompany.handle}`)
        const res2 = await request(app).get(`/companies/${fakeCompany.handle}`)

        expect(res.statusCode).toBe(200)
        expect(res2.statusCode).toBe(404)
    })

    test('Will return 404 if handle does not exist', async ()=>{
        const res = await request(app).delete(`/companies/notreal`)

        expect(res.statusCode).toBe(404)
    })
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
	await db.end();
});