const express = require('express');
const ExpressError = require('../helpers/expressError');
const Company = require('../models/company');
const jsonschema = require('jsonschema')
const companySchema = require('../schemas/companySchema.json')
const companyUpdateSchema = require('../schemas/companyUpdateSchema.json')
const router = new express.Router();
const {ensureAdmin, ensureLoggedIn, authenticateJWT} = require('../middleware/auth')

router.get('/', authenticateJWT, async (req, res, next) => {
	let q = req.query;
	let company = {
		min_employees: 0,
		max_employees: 9999999
	};

	if (q.min_employees) {
		company.min_employees = q.min_employees;
	}
	if (q.max_employees) {
		company.max_employees = q.max_employees;
	}
	if (company.min_employees > company.max_employees) {
		throw new ExpressError('Error: max_employees must be greater than min_employees', 400);
	}

	if (q.search) {
		company.handle = q.search;

		try {
			const c = await Company.findOne(company.handle, company.min_employees, company.max_employees);
			return res.json({ companies: c });
		} catch (e) {
			return next(e);
		}
	}

	if (q.min_employees || q.max_employees) {
		try {
			const c = await Company.findOne(company.handle, company.min_employees, company.max_employees);
			return res.json({ companies: c });
		} catch (e) {
			return next(e);
		}
	}

	try {
		c = await Company.findAll();
		return res.json({companies: c});
	} catch (e) {
		return next(e);
	}
});

router.get('/:handle', authenticateJWT, async (req, res, next) => {
	try {
		const company = await Company.findOne(req.params.handle);
		return res.json({ company: company });
	} catch (e) {
		return next(e);
	}
});

router.post('/',ensureAdmin, async (req, res, next) => {
	const valid = await jsonschema.validate(req.body, companySchema)

	//Uses JSON Schema validation
	if(!valid.valid){
		let listOfErrors = valid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
	} else {
		try {
			const result = await Company.create(req.body);
			return res.status(201).json({company: result});
		} catch (e) {
			return next(e);
		}
	}
});

router.patch('/:handle',ensureAdmin, async (req, res, next) => {
	const valid = jsonschema.validate(req.body, companyUpdateSchema)

	if(!valid.valid){
		let listOfErrors = valid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
	}
	try {
		const result = await Company.update(req.params.handle, req.body);
		return res.json({ company: result });
	} catch (e) {
		return next(e);
	}
});

router.delete('/:handle',ensureAdmin, async (req, res, next) => {
	try {
		const result = await Company.delete(req.params.handle);
		return res.json({ message: 'Company Deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
