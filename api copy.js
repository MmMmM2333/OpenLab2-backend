const moment = require('moment')
//调用sha256
const crypto = require('crypto')
//生成jwt
const jwt = require('jsonwebtoken');

const userModel = require('./userModel')
const roleModel = require('./roleModel')
const counterModel = require('./counterModel')

const secretKey = "strongest ^0^";

function sha256(data) {
    var obj = crypto.createHash('sha256');
    obj.update(data);
    var str = obj.digest('hex');
    return str;
}
function GetNowMoment() {
    return moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss.SSS Z')
}
function log(msg) {
    console.log(`[${GetNowMoment()}]${msg}`)
}

async function getIncID(name) {
    let result = await counterModel.findOneAndUpdate({ name: name }, { '$inc': { id: 1 } })
    return result.id
}

async function getRole(roleID) {
    let result = await roleModel.findOne({ roleID })
    return result.name
}

module.exports = {
    userInfo: async function (userID) {
        let result = await userModel.findOne({ id: userID }).lean()
        delete result.password
        result.role = await getRole(result.roleID)
        delete result.roleID
        delete result.__v
        console.log(result);
    },

    login: async function (req) {
        let username = req.body.username
        let password = req.body.password

        password = sha256(password)
        // console.log(username, password);
        // 先判断参数是否为空
        if (username === undefined || password === undefined) {
            return { status: 401, message: '请输入用户名和密码！' }
        }
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        log(`来自 ${ip} 的用户尝试登录，用户名：${username}`);
        let user = await userModel.findOne({ username: username })
        if (!user) {
            log(`来自 ${ip} 的用户尝试登录失败，用户名：${username}，原因：用户名不存在`);
            //返回的信息和下面一样是故意的，没有打错
            return { code: 400, msg: '用户名或密码错误' }
        }
        else if (password != user.password) {
            log(`来自 ${ip} 的用户尝试登录失败，用户名：${username}，原因：密码错误`);
            return { code: 400, msg: '用户名或密码错误' }
        }
        const token = jwt.sign(
            { username: user.username }, secretKey, { expiresIn: '1d' }
        )
        log(`来自 ${ip} 的用户尝试登录成功，用户名：${username}`);
        return {
            code: 200,
            msg: '登录成功',
            data: {
                username, token
            }
        }
    },

    register: async function (req) {
        let username = req.body.username
        let password = req.body.password
        let studentID = req.body.studentID

        // console.log(username, password, studentID);
        password = sha256(password)
        console.log(username, password, studentID);
        log(`有新用户注册行为,用户名：${username}，学号：${studentID}`)

        //判断用户名和学号是否可用
        let user = await userModel.findOne({ username: username })
        if (user) {
            log(`新用户${username} ，注册失败，原因：用户名已被使用，请尝试换个用户名`)
            return { code: 401, msg: '用户名已被使用' }
        }
        user = await userModel.findOne({ studentID: studentID })
        if (user) {
            log(`新用户${username} ，注册失败，原因：学号重复`)
            return { code: 401, msg: '学号已被使用。如果你没有注册过该平台，请联系管理员' }
        }
        // getIncID('user')
        //向数据库添加用户
        const newUser = new userModel({
            id: await getIncID('user'),
            username: username,
            password: password,
            studentID: studentID,
        })
        try {
            await newUser.save()
        } catch (error) {
            console.log(error);
            throw error
        }

        log(`新用户${username} ，注册成功`)
        return { code: 200, msg: '注册成功' }
    },

    rank: async function () {
        return { code: 200, msg: '获取排行榜成功' }
    },

    addProblem: async function (req) {
        let username = req.auth.username
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试添加题目`);
        if (!hasAuthority) {
            log(`用户 ${username} 尝试添加题目失败，原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }
        log(`用户 ${username} 尝试添加题目成功`);
        return { code: 200, msg: '添加成功' }
    },

    removeProblem: async function (req) {
        let username = req.auth.username
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试移除题目`);
        if (!hasAuthority) {
            log(`用户 ${username} 尝试移除题目失败，原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }
        log(`用户 ${username} 尝试移除题目成功`);
        return { code: 200, msg: '移除成功' }
    },
    checkAdminAuthority: async function (username) {
        let user = await userModel.findOne({ username })
        if (!user || user.roleID != 1) return false
        return true
    }
}