var express = require('express')
var router = express.Router()
var api = require('./api')

// const crytpo = require("crytpo");


router.get('/test', async function (req, res, next) {
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

module.exports = router