const express = require('express');
const app = express();
const path = require('path');
const router = require('./mainRouter')
const createError = require('http-errors');


//配置body-parser : 解析 POST 请求体 插件
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//开放资源
app.use ( "/public", express.static ( path.join ( __dirname, "./public" ) ) )
app.use ( "/node_modules", express.static ( path.join ( __dirname, "./node_modules" ) ) )

//允许跨域
app.all ( "*", function ( req, res, next ) {
    //消除中文乱码
    res.set('Content-Type', 'application/json;charset=utf-8')
    //设置跨域
    res.header ( "Access-Control-Allow-Origin", "*" )
    res.header ( "Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS" )
    res.header ( "Access-Control-Allow-Headers", "X-Requested-With" )
    res.header ( "Access-Control-Allow-Headers", "Content-Type" )
    next ()
} )


// 传入 app 挂载路由
router(app)


// 访问没有的路由 ， 到这个页面
app.use(function(req, res, next) {
  next(createError(404));
});

// 访问路由中有错 ， 到这个路由
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

//启动服务器 监听端口号
app.listen ( 8080, function () {
    console.log ( "The Sever is opening...." )
} )

module.exports = app;
