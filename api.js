const moment = require('moment')
//调用sha256
const crypto = require('crypto')
//生成jwt
const jwt = require('jsonwebtoken');

const userModel = require('./userModel')
const roleModel = require('./roleModel')
const counterModel = require('./counterModel');
const problemModel = require('./problemModel');

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
    checkAdminAuthority: async function (username) {
        let user = await userModel.findOne({ username })
        if (!user || user.roleID != 1) return false
        return true
    },

    userInfo: async function (userID) {
        let result = await userModel.findOne({ id: userID }).lean()
        delete result._id
        delete result.password
        delete result.__v
        result.role = await getRole(result.roleID)
        return result
    },

    login: async function (req) {
        let username = req.body.username
        let password = req.body.password

        password = sha256(password)
        // console.log(username, password);
        // 先判断参数是否为空
        if (username === undefined || password === undefined || username === '' || password === '') {
            return { status: 401, message: '请输入用户名和密码！' }
        }
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        log(`来自 ${ip} 的用户尝试登录,用户名：${username}`);
        let user = await userModel.findOne({ username: username })
        if (!user) {
            log(`来自 ${ip} 的用户尝试登录失败,用户名：${username},原因：用户名不存在`);
            //返回的信息和下面一样是故意的,没有打错
            return { code: 400, msg: '用户名或密码错误' }
        }
        else if (password != user.password) {
            log(`来自 ${ip} 的用户尝试登录失败,用户名：${username},原因：密码错误`);
            return { code: 400, msg: '用户名或密码错误' }
        }
        const token = jwt.sign(
            { username: user.username, userID: user.id, roleID: user.roleID }, secretKey, { expiresIn: '1d' }
        )
        log(`来自 ${ip} 的用户尝试登录成功,用户名：${username}`);
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

        if (username === undefined || password === undefined || studentID === undefined || username === '' || password === '' || studentID === '') {
            return { status: 412, message: '请传入必要参数！' }
        }

        // console.log(username, password, studentID);
        password = sha256(password)
        console.log(username, password, studentID);
        log(`有新用户注册行为,用户名：${username},学号：${studentID}`)

        //判断用户名和学号是否可用
        let user = await userModel.findOne({ username: username })
        if (user) {
            log(`新用户${username} ,注册失败,原因：用户名已被使用,请尝试换个用户名`)
            return { code: 401, msg: '用户名已被使用' }
        }
        user = await userModel.findOne({ studentID: studentID })
        if (user) {
            log(`新用户${username} ,注册失败,原因：学号重复`)
            return { code: 401, msg: '学号已被使用。如果你没有注册过该平台,请联系管理员' }
        }
        // getIncID('user')
        //向数据库添加用户
        const newUser = new userModel({
            id: await getIncID('user'),
            username,
            password,
            studentID,
        })
        try {
            await newUser.save()
        } catch (error) {
            console.log(error);
            throw error
        }

        log(`新用户${username} ,注册成功`)
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
            log(`用户 ${username} 尝试添加题目失败,原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }

        let miniTitle = req.body.miniTitle
        let title = req.body.title
        let score = req.body.score || 10
        let description = req.body.description
        let showInRank = req.body.showInRank || true

        if (!miniTitle || !title || !score) {
            log(`用户 ${username} 尝试添加题目失败,原因：参数不完整`);
            return { code: 412, msg: '参数不完整!请检查miniTitle和title是否填写' }
        }

        const newProblem = new problemModel({
            id: await getIncID('problem'),
            miniTitle,
            title,
            score,
            description,
            showInRank,
        })

        try {
            await newProblem.save()
            log(`用户 ${username} 尝试添加题目成功,题目标题:${title}`);
            return { code: 200, msg: '添加成功' }
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    removeProblem: async function (req) {
        let username = req.auth.username
        let problemID = req.query.id
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试移除题目,题目ID:${problemID}`);

        if (!hasAuthority) {
            log(`用户 ${username} 尝试移除题目失败,题目ID:${problemID},原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }


        let problem = await problemModel.findOne({ id: problemID })
        if (!problem) {
            log(`用户 ${username} 尝试移除题目失败,题目ID:${problemID},原因：题目不存在`);
            return { code: 412, msg: '题目不存在' }
        }

        let title = problem.title

        try {
            await problemModel.deleteOne({ id: problemID })
        } catch (error) {
            console.log(error);
            throw error
        }

        log(`用户 ${username} 尝试移除题目成功,题目名称:${title}`);
        return { code: 200, msg: '移除成功' }
    },

    removeUser: async function (req) {
        let username = req.auth.username
        let userID = req.query.id
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试删除用户,要被删除的用户ID:${userID}`);

        if (!hasAuthority) {
            log(`用户 ${username} 尝试删除用户失败,要被删除的用户ID:${userID},原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }


        let user = await userModel.findOne({ id: userID })
        if (!user) {
            log(`用户 ${username} 尝试删除题目失败,要被删除的用户ID:${userID},原因：要被删除的用户不存在`);
            return { code: 412, msg: '用户不存在' }
        }

        let deletedUsername = user.username

        try {
            await userModel.deleteOne({ id: userID })
            let problems = await problemModel.find({ completedUserIDs: { $in: [userID] } })
            if (problems.length != 0) {
                problems = problems.map(problem => {
                    problem.completedUserIDs.filter(item => item != userID)
                    problem.markModified('completedUserIDs')
                    problem.totalCompletedPeople -= 1
                    return problem
                })
                await problems.save()
            }
            log(`用户 ${username} 尝试删除用户成功,被删除的用户名称:${deletedUsername}`);
            return { code: 200, msg: '删除成功' }
        } catch (error) {
            console.log(error);
            throw error
        }


    },

    getUserInfo: async function (req) {
        let username = req.auth.username
        let userID = req.query.userID
        log(`用户 ${username} 尝试获取用户信息,要被获取的用户ID:${userID}`);
        if (userID === undefined || userID === '') {
            log(`用户 ${username} 获取用户信息失败,要被获取的用户ID:${userID},原因：传入参数无效`);
            return { code: 412, msg: '请传入有效用户ID' }
        }
        else if (req.auth.roleID != 1 && userID != req.auth.userID) {
            log(`用户 ${username} 获取用户信息失败,要被获取的用户ID:${userID},原因：权限不足`);
            return { code: 401, msg: '无权限查看其他用户信息' }
        }
        try {
            let userInfo = await this.userInfo(userID)
            log(`用户 ${username} 获取用户信息成功,被获取的用户名称:${userInfo.username}`);
            return { code: 200, msg: '获取用户信息成功', data: { ...userInfo } }
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    getProblem: async function (req) {
        let username = req.auth.username
        let userID = req.auth.userID
        let problemID = req.query.id
        if (!problemID || problemID < 0) {
            return { code: 412, msg: '无效的问题ID参数' }
        }
        try {
            let result = await problemModel.findOne({ id: problemID }, { _id: 0, __v: 0 }).lean()
            let userInfo = await userModel.findOne({ id: userID })

            if (result.completedUserIDs.includes(userID)) {
                result.isCompleted = true
            } else (
                result.isCompleted = false
            )

            let index = userInfo.score.findIndex(userScore => userScore.problemID == item.id)
            if (index == -1) {
                result.userScore = -1
            } else {
                result.userScore = userInfo.score[index].score
            }
            delete result.completedUserIDs

            return { code: 200, msg: '获取题目成功', data: { result } }
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    getProblems: async function (req) {
        let username = req.auth.username
        let userID = req.auth.userID
        try {
            let result = await problemModel.find({}, { _id: 0, __v: 0 }).lean()
            let userInfo = await userModel.findOne({ id: userID })
            result = result.map((item) => {
                if (item.completedUserIDs.includes(userID)) {
                    item.isCompleted = true
                } else (
                    item.isCompleted = false
                )
                let index = userInfo.score.findIndex(userScore => userScore.problemID == item.id)
                if (index == -1) {
                    item.userScore = -1
                } else {
                    item.userScore = userInfo.score[index].score
                }
                delete item.completedUserIDs
                return item
            })
            log(`用户 ${username} 尝试获取题目成功`);
            return { code: 200, msg: '获取题目成功', data: { result } }
        } catch (error) {
            console.log(error);
            throw error
        }
    },

    submitScore: async function (req) {
        let username = req.auth.username
        let userID = req.auth.userID

        let problemID = req.query.problemID
        let score = Number(req.query.score)

        log(`用户 ${username} 尝试提交题目,题目ID:${problemID},分数:${score}`);
        if (problemID === '' || problemID === undefined || score === '' || score === undefined || score === NaN) {
            log(`用户 ${username} 提交题目失败,题目ID:${problemID},分数:${score},原因:参数无效`);
            return { code: 412, msg: '参数无效' }
        }

        try {
            let problem = await problemModel.findOne({ id: problemID })
            let userInfo = await userModel.findOne({ id: userID })
            if (score < 0 || score > problem.score) {
                log(`用户 ${username} 提交题目失败,题目ID:${problemID},分数:${score},原因:分数无效`);
                return { code: 400, msg: '分数无效' }
            }

            if (userInfo.hasJoin == false) {
                userInfo.hasJoin = true
            }

            problem.totalAttempts += 1
            let index = userInfo.score.findIndex(item => item.problemID == problemID)
            if (index != -1) {
                if (Number(userInfo.score[index].score) < score) {
                    userInfo.score[index].score = score
                    userInfo.markModified('score')
                    //不加上面这句的话mongoose无法知道我改了score数组
                }
            } else {
                userInfo.score.push({ 'problemID': problemID, 'score': score })
            }

            if (score == problem.score) {
                problem.totalCompleted += 1
                if (!problem.completedUserIDs.includes(userID)) {
                    problem.totalCompletedPeople += 1
                    problem.completedUserIDs.push(userID)
                }
            }

            try {
                await userInfo.save()
                await problem.save()
                log(`用户 ${username} 尝试提交题目成功,题目ID:${problemID},分数:${score}`);
                return { code: 200, msg: '提交成功' }
            } catch (error) {
                console.log(error);
                throw error
            }



        } catch (error) {
            console.log(error);
            throw error
        }
    },

    rank: async function (req) {
        let allJoinedUsers = await userModel.find({ hasJoin: true }, { _id: 0, __v: 0, password: 0 }).lean()
        let allProblems = await problemModel.find({ showInRank: true }, { _id: 0, __v: 0, completedUserIDs: 0 })
        let problemsID = allProblems.map(item => { return item.id })

        allJoinedUsers = allJoinedUsers.map(user => {
            let rankScore = []
            let totalScore = 0
            for (let problemID of problemsID) {
                let index = user.score.findIndex(item => item.problemID == problemID)
                if (index != -1) {
                    rankScore.push(user.score[index].score)
                    totalScore += user.score[index].score
                } else {
                    rankScore.push(-1)
                }
            }
            user.rankScore = rankScore
            user.totalScore = totalScore
            return user
        })

        allJoinedUsers.sort((a, b) => b.totalScore - a.totalScore)
        let rank = 1;
        let rankCount = 1;
        for (let i = 0; i < allJoinedUsers.length; i++) {
            if (i > 0 && allJoinedUsers[i].totalScore < allJoinedUsers[i - 1].totalScore) {
                rank += rankCount;
                rankCount = 1;
            } else {
                if (i > 0) { rankCount++; }
            }
            allJoinedUsers[i].rank = rank;
        }

        return {
            code: 200, msg: '获取成功', data: {
                problems: allProblems,
                users: allJoinedUsers
            }
        }
    },

    getAllUsers: async function (req) {
        let username = req.auth.username
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试获取所有用户信息`);

        if (!hasAuthority) {
            log(`用户 ${username} 尝试获取所有用户信息失败,原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }

        try {
            let users = await userModel.find({}, { _id: 0, password: 0, __v: 0 }).lean()
            users = users.map(user => {
                if (user.roleID == 1) user.role = '管理员'
                else user.role = '普通用户'
                return user
            })
            log(`用户 ${username} 尝试获取所有用户信息成功`);
            return { code: 200, msg: '获取成功', data: { users } }
        } catch (error) {
            console.log(error);
            throw error
        }

    },

    editProblem: async function (req) {
        let username = req.auth.username
        hasAuthority = await this.checkAdminAuthority(username)
        log(`用户 ${username} 尝试修改题目,要被修改的题目:${req.body.title}`);

        if (!hasAuthority) {
            log(`用户 ${username} 尝试修改题目失败,要被修改的题目:${req.body.title},原因：用户无权限`);
            return { code: 401, msg: '用户无权限执行当前操作' }
        }

        let result = await problemModel.updateOne({
            id: req.body.id
        }, {
            $set: req.body
        })

        if (result.acknowledged) {
            log(`用户 ${username} 尝试修改题目成功,被修改的题目:${req.body.title}`);
            return {
                code: 200,
                msg: '修改成功'
            }
        } else {
            log(`用户 ${username} 尝试修改题目失败,要被修改的题目:${req.body.title},原因未知`);
            return {
                code: 400,
                msg: '修改失败'
            }
        }
    }
}