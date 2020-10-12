const express = require('express');
const ExpressError = require('../helpers/expressError');
const Job = require('../models/job')
const jsonschema = require('jsonschema')
const jobSchema = require('../schemas/jobSchema.json')
const jobUpdateSchema = require('../schemas/jobUpdateSchema.json')
const router = new express.Router();
const {ensureAdmin, ensureLoggedIn, authenticateJWT} = require('../middleware/auth')

router.get('/', authenticateJWT, async (req, res, next) => {
    let q = req.query;
    let job = {
        min_salary: 0,
        max_salary: 9999999
    };

    if(q.min_salary) {
        job.min_salary = q.min_salary
    }

    if(q.max_salary) {
        job.max_salary = q.max_salary
    }

    if(job.min_salary > job.max_salary) {
        throw new ExpressError('ERROR: max_salary must be greater than min_salary', 400)
    }

    if(q.search) {
        job.title = q.search;

        try{
            const j = await Job.findAll(job.title, job.min_salary, job.max_salary)

            return res.json({jobs: j})
        }catch(e){
            return next(e)
        }
    }
    else{
        try{
            const j = await Job.findAll(job.title, job.min_salary, job.max_salary)

            return res.json({jobs: j})
        }catch(e){
            return next(e)
        }
    }
})

router.get('/:id', authenticateJWT, async (req, res, next) => {
    try {
        const j = await Job.findOne(req.params.id)
        return res.json({job: j})
    } catch (e) {
        return next(e)
    }

})

router.post('/',ensureAdmin, async (req, res, next) => {
    const isValid = jsonschema.validate(req.body, jobSchema)

    if(!isValid.valid){
        let listOfErrors = isValid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
    }
    else{
        try {
            const j = await Job.createJob(req.body)
            return res.status(201).json({job: j})
        } catch (e) {
            return next(e)
        }
    }
    
})

router.patch('/:id',ensureAdmin, async (req, res, next) => {
    const isValid = await jsonschema.validate(req.body, jobUpdateSchema)

    if(!isValid.valid){
        let listOfErrors = isValid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
    }else{
        try {
            const j = await Job.updateJob(req.params.id, req.body);
            return res.json({ job: j });
        } catch (e) {
            return next(e);
    }
}})

router.delete('/:id',ensureAdmin, async (req, res, next) => {
    try {
		const j = await Job.deleteJob(req.params.id);
		return res.json({ message: 'Job Deleted' });
	} catch (e) {
		return next(e);
	}
})

module.exports = router;