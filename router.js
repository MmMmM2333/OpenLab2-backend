var express = require('express')
var router = express.Router()
var api = require('./api')

// 登录接口
router.post('/login', async function (req, res, next) {
    try {
        let result = await api.login(req);
        res.send(result)
    } catch (error) {
        next(error)
    }


    // res.send('login api.')
})

router.post('/register', async function (req, res, next) {
    try {
        let result = await api.register(req);
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/rank', async function (req, res, next) {
    try {
        let result = await api.rank();
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.post('/addProblem', async function (req, res, next) {
    try {
        let result = await api.addProblem(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/removeProblem', async function (req, res, next) {
    try {
        let result = await api.removeProblem(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/removeUser', async function (req, res, next) {
    try {
        let result = await api.removeUser(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/getUserInfo', async function (req, res, next) {
    try {
        let result = await api.getUserInfo(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/getProblem', async function (req, res, next) {
    try {
        let result = await api.getProblem(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/getProblems', async function (req, res, next) {
    try {
        let result = await api.getProblems(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/submitScore', async function (req, res, next) {
    try {
        let result = await api.submitScore(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.get('/getAllUsers', async function (req, res, next) {
    try {
        let result = await api.getAllUsers(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

router.post('/editProblem', async function (req, res, next) {
    try {
        let result = await api.editProblem(req)
        res.send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router