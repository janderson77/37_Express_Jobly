const express = require('express');
const ExpressError = require('../helpers/expressError');
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jsonschema = require('jsonschema')
const userSchema = require('../schemas/userSchema.json')
const userUpdateSchema = require('../schemas/userUpdateSchema.json');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const {authenticateJWT, ensureLoggedIn, ensureAdmin} = require('../middleware/auth');
const router = new express.Router();

router.post('/', async (req, res, next) => {
    const isValid = jsonschema.validate(req.body, userSchema)

    if(!isValid.valid){
        let listOfErrors = isValid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
    }
    else{
        let newUser = req.body
        const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_WORK_FACTOR)
        newUser.password = hashedPassword
        
        try {
            const u = await User.createUser(newUser)
            if(u){
                let payload = {
                    username: u.username,
                    is_admin: u.is_admin
                }
                let token = jwt.sign(payload, SECRET_KEY)
                u.token = token
                return res.status(201).json({user: u})
            }
            
        } catch (e) {
            return next(e)
        }
    }    
})

router.post('/login', async(req, res, next) => {
    try {
        let {username, password} = req.body
        const user = await User.loginUser(username, password)
        if(user){
            let payload = {username: user.username, is_admin: user.is_admin}
            let token = jwt.sign(payload, SECRET_KEY)
            return res.json({message: "Logged In!", token})
        }
        throw new ExpressError("Invalid username/password", 400)
    } catch (e) {
        return next(e)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const u = await User.getAllUsers()
        return res.json({users: u})
    } catch (e) {
        return next(e)
    }
})

router.get('/:username', async  (req, res, next) => { 
    try {
        const u = await User.getOneUser(req.params.username)
        return res.json({user: u})
    } catch (e) {
        return next(e)
    }
})

router.patch('/:username', ensureLoggedIn, async (req, res, next) => {
    const isValid = jsonschema.validate(req.body, userUpdateSchema)

    if(!isValid.valid){
        let listOfErrors = isValid.errors.map(error => error.stack);
		let error = new ExpressError(listOfErrors, 400)
		return next(error)
    }
    else{
        try {
            const u = await User.updateUser(req.params.username, req.body)
            return res.status(200).json({user: u})
        } catch (e) {
            return next(e)
        }
    }  
})

router.delete('/:username', ensureLoggedIn, async(req, res, next)=> {
    try {
		const u = await User.deleteUser(req.params.username);
		return res.json({ message: 'User Deleted' });
	} catch (e) {
		return next(e);
	}
})

module.exports = router