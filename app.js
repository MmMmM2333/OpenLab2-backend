const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router')
const moment = require('moment');
// jwt中间件
const { expressjwt: expressJWT } = require("express-jwt");


const app = express()

let PORT = 3000
//实际开发真别直接把这东西写死在代码里
//这里只是因为这是个临时写的小后端才这么搞
const secretKey = "strongest ^0^";

function GetNowMoment() {
    return moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss.SSS Z')
}

//跨域
app.all("*", function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");

    next();
});

//配置express-jwt中间件
app.use(
    expressJWT({ secret: secretKey, algorithms: ["HS256"] })
        .unless({
            // 指定路径请求不经过token解析
            path: ['/login', '/register', '/test1']
        })
)

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use(router)

//全局处理错误中间件
app.use((err, req, res, next) => {
    console.log(`[${GetNowMoment()}]发生了错误:${err}`)
    if (err.name === 'UnauthorizedError') {
        //错误是由token解析失败导致的
        return res.send({ status: 401, message: '无效的token' });
    }
    //错误是由其他原因导致的
    res.send({ status: 500, message: '未知的错误' });
})

app.listen(PORT, function () {
    console.log(`[${GetNowMoment()}]启动API服务，运行端口:%d`, PORT)
})

module.exports = app