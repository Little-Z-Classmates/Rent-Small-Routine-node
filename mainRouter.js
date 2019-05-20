/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/3
 **/
const global = require('./routes/global')
const v1 = require('./routes/v1')
const v2 = require('./routes/v2')



module.exports = app =>{
    app.use('/global',global)
    app.use('/v1',v1)
    app.use('/v2',v2)
}