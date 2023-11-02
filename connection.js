// connection.js file
const moment = require('moment');
const mongoose = require('mongoose');
const conn = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/openlab2', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
)

function GetNowMoment() {
    return moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss.SSS Z')
}
console.log(`[${GetNowMoment()}]连接MongoDB数据库中`);
conn.on('open', () => {
    // console.log('打开 mongodb 连接');
    console.log(`[${GetNowMoment()}]连接MongoDB数据库成功`);
})
conn.on('err', (err) => {
    console.log(`[${GetNowMoment()}]连接MongoDB数据库失败`);
    console.log('err:' + err);
})

module.exports = conn; //commonJs 语法，导出conn模块。