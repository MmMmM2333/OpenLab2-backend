var express = require('express')
var router = express.Router()
var api = require('./api')

// const crytpo = require("crytpo");


router.get('/test', async function (req, res, next) {
    res.send('yeeeeah')
})

router.get('/test1', async function (req, res, next) {
    api.userInfo(1);
    res.send('yeeeeah')
})

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

module.exports = router