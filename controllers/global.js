/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/3
 **/
// 导入 mysql 链接池
const mysqlConnection = require ( "../mysql/mysqlDB.js" )
const request = require("request");
const qs = require('querystring');


async function login ( req ,res,next ) {
    let data = req.query
    let dataStringContent = qs.stringify(data);
    let option = {
        url: 'https://api.weixin.qq.com/sns/jscode2session?' + dataStringContent,	// 要访问的服务器的ip地址
    }
    request.get( option, function(err, response, body ){
        let openid = JSON.parse(body).openid
        // 判断有没有 openid
        var sql = `select * from user where openid = '${openid}'`
        mysqlConnection.query(sql, function ( error, results, fields ) {
            if ( error ){
                console.log ( error )
                res.status(500).json({ error : error})
            }else{
                if (!results.length){
                    var add_sql = `insert into user(openid) value ('${openid}')`
                    mysqlConnection.query(add_sql,function ( error, results, fields ) {
                        if ( error ){
                            console.log ( error )
                            res.status(500).json( { error : error } )
                        }else{
                            if ( results.affectedRows ){
                              res.json(openid)
                            }
                        }
                    })
                }
                else{
                   res.json(openid)
                }
            }
        })
    });
}



module.exports = {
    login
}