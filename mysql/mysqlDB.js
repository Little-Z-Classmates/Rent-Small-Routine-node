/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/3
 **/
var mysql = require ( "mysql" )
var pool = mysql.createPool ( {   // 创建 mysql 连接池资源
    host : "localhost",
    user : "root",
    password : "root",
    database : "renthouse"
    // connectionLimit : 5 //连接池大小
} )
exports.query = function ( sql, callback ) {
    return new Promise ( function ( resolve, reject ) {
        pool.getConnection ( function ( err, connection ) {       //建立链接
            if ( err ) {
                reject ( err )
                callback && callback ( err )
                return
            }
            connection.query ( sql, function ( error, results, fields ) {
                connection.release () //将链接返回到连接池中，准备由其他人重复使用
                if ( error ) {
                    reject ( error )
                }
                callback && callback ( error, results, fields )     //执行回调函数，将数据返回
                var data = { results : results, fields : fields }
                resolve ( data )
            } )
        } )
    } )
}