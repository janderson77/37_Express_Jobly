process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../../app');

const db = require("../../db")

const Job = require('../../models/job')
const Company = require('../../models/company')

let company = {
    handle: "comp",
    name: "A company",
    num_employees: 55,
    description: "A fake company",
    logo_url: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
}

let job1 = {
    title: "Test Job",
    salary: 75000,
    equity: 0.05,
    company_handle: "comp"
}

let job2 = {
    title: "Test Job 2",
    salary: 100000,
    equity: 0.5,
    company_handle: "comp"
}

let job3 = {
    title: "Test Job 3",
    salary: 100000,
    equity: 0.5,
    company_handle: "comp"
}



beforeEach(async () => {
    await Company.create(company);
    const res1 = await Job.createJob(job1);
    job1.id = res1.id
    job1.date_posted = res1.date_posted

    const res2 = await Job.createJob(job2);
    job2.id = res2.id
    job2.date_posted = res2.date_posted
})

describe('GET /jobs', () => {
    test('Gets full list of jobs', async () => {
        const res = await request(app).get('/jobs')

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({jobs: [{"title": "Test Job", "company_handle": "comp"}, {"title": "Test Job 2", "company_handle": "comp"}]})
    })
})

describe('GET /jobs/:id', ()=>{
    test('Gets one job by id', async()=> {
        const res = await request(app).get(`/jobs/1`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({job: job1})
    })

    test('Returns 404 for invalid job id', async ()=>{
        const res = await request(app).get(`/jobs/0`)

        expect(res.statusCode).toBe(404)
    })
})

describe('POST /jobs', ()=>{
    test('Creates a single company', async()=>{
        const res = await request(app).post('/jobs').send(job3)

        expect(res.statusCode).toBe(201)
        expect(res.body.job).toHaveProperty('id')
        expect(res.body.job.title).toEqual('Test Job 3')

    })

    test('Will create a job with only title, salary and company_handle', async()=>{
        const res = await request(app).post('/jobs').send(
            {
                title: "Engineer",
                salary: 50000,
                company_handle: "comp"
            }
        )
        expect(res.statusCode).toBe(201)
    })

    test('Does not create a job with no title', async()=>{
        const res = await request(app).post('/jobs').send(
            {
                salary: 5,
                equity: 0.1,
                company_handle: "comp"
            }
        )
        expect(res.statusCode).toBe(400)
    })

    test('Does not create a job with no salary', async()=>{
        const res = await request(app).post('/jobs').send(
            {
                title: "Engineer",
                equity: 0.1,
                company_handle: "comp"
            }
        )
        expect(res.statusCode).toBe(400)
    })

    test('Will not create a job with missing company_handle', async()=>{
        const res = await request(app).post('/jobs').send(
            {
                title: "Engineer",
                salary: 50000,
                equity: 0.1
            }
        )
        expect(res.statusCode).toBe(400)
    })

    test('Will not create a job with invalid company_handle', async () => {
        const res = await request(app).post('/jobs').send(
            {
                title: "Engineer",
                salary: 50000,
                equity: 0.1,
                company_handle: "stfu"
            }
        )
        expect(res.statusCode).toBe(500)
    })
    
})

describe('PATCH /jobs/:id', () => {
    test('Should update only job title', async () => {
        const res = await request(app).patch('/jobs/1').send(
            {"title": "This is the new title"}
        )

        expect(res.statusCode).toBe(200)
        expect(res.body.job.title).toEqual("This is the new title")
        expect(res.body.job.salary).toEqual(job1.salary)
        expect(res.body.job.equity).toEqual(job1.equity)
        expect(res.body.job.company_handle).toEqual(job1.company_handle)
    })

    test('Should update only job salary', async () => {
        const res = await request(app).patch('/jobs/1').send(
            {"salary": 80000}
        )

        expect(res.statusCode).toBe(200)
        expect(res.body.job.title).toEqual(job1.title)
        expect(res.body.job.salary).toEqual(80000)
        expect(res.body.job.equity).toEqual(job1.equity)
        expect(res.body.job.company_handle).toEqual(job1.company_handle)
    })

    test('should not update salary if not type integer', async () => {
        const res = await request(app).patch('/jobs/1').send({"salary": "Fifty Thousand Per Year"})

        expect(res.statusCode).toBe(400)
    })

    test('should not update equity if not type integer', async () => {
        const res = await request(app).patch('/jobs/1').send({"equity": "One percent"})

        expect(res.statusCode).toBe(400)
    })

    test('should not update company_handle if invalid', async () => {
        const res = await request(app).patch('/jobs/1').send({"company_handle": "fail"})

        expect(res.statusCode).toBe(500)
    })
    
    
})

describe('DELETE /jobs/:id', () => {
    test('should delete a single job', async () => {
        const res = await request(app).delete('/jobs/1')

        expect(res.statusCode).toBe(200)
    })

    test('should return 404 for invalid id', async () => {
        const res = await request(app).delete('/jobs/0')

        expect(res.statusCode).toBe(404)
    })
    
})



afterEach(async () => {
    await db.query(`ALTER SEQUENCE jobs_id_seq RESTART WITH 1`)
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM jobs`)
})

afterAll(async () => {
	await db.end();
});