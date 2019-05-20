/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/3
 **/
// 导入 mysql 链接池
const mysqlConnection = require ( "../mysql/mysqlDB.js" )
const request = require("request");
const qs = require('querystring');
const syncRequest = require('sync-request');


async function login ( req ,res ) {
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

async function getRecommendHouseInfo ( req,res ) {
    var latitude   = req.query.latitude
    var longitude  = req.query.longitude
    var modeId  = req.query.modeId
    var price  = req.query.price
    var sortId  = req.query.sortId
    var featureId  = JSON.parse(req.query.featureId)
    var from = latitude + ',' + longitude
    var TX_map_key = req.query.TX_map_key

    // 打乱数组顺序的方法
    var shuffle = function (arr) {
        let i = arr.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        return arr;
    }

    var selectAllHouseInfoSql = `select * from userhouse`
    mysqlConnection.query(selectAllHouseInfoSql)
    .then( data =>{
        var allHouseInfoList = data.results

        if ( modeId  != -1 ){
            allHouseInfoList = allHouseInfoList.filter( item =>{
                return ( ( JSON.parse(item.mode) ).id == modeId )
            })
        }
        if ( price != -1 ){
            var start =  ( price.split('-') ) [0]
            var end =  ( price.split('-') ) [1]
            allHouseInfoList = allHouseInfoList.filter( item =>{
                var dbPrice = parseFloat(JSON.parse(item.price))
                return ( dbPrice >= start && dbPrice <= end )
            })
        }
        if ( featureId.length > 0 ){
            featureId.forEach( item =>{
                allHouseInfoList = allHouseInfoList.filter( sonItem =>{
                    var flag = false
                    var dbFeatureList = JSON.parse(sonItem.feature)
                    dbFeatureList.some( sonSonItem =>{
                        if ( sonSonItem.id == item ){
                            flag = true
                            return flag
                        }
                    })
                    return flag
                })
            })
        }

        //  把所有筛选 在 3km 之内的 数据存入 okArr 数组中
        var  okArr = []
        // 封装一个函数,把 n长度的数组 , 按腾讯地图要求的一次请求可以纳入的最大长度200为间隔 , 分隔数组
        function group ( array, subGroupLength ) {
            let index = 0
            let newArray = []
            while(index < array.length) {
              newArray.push( array.slice( index, index += subGroupLength ) )
            }
            return newArray
        }
        // 封装一个排序函数
        function sortBy( field ) {
            return function(a,b) {
                if (sortId == 2){
                    return b[field] - a[field];
                }else{
                    return a[field] - b[field];
                }

            }
        }

        var groupedArray = group(allHouseInfoList, 200)
        groupedArray.forEach( item =>{
            var toStr = ''
            item.forEach( sonItem =>{
                  var location = ( JSON.parse(sonItem.placeInfo) ) .latitude + ',' + ( JSON.parse(sonItem.placeInfo) ) .longitude
                  toStr +=  location + ';'
            })
            toStr = toStr.substr( 0 , toStr.length-1 )
            var option = {
                url: `http://apis.map.qq.com/ws/distance/v1/matrix/?mode=driving&from=${from}&to=${toStr}&key=${TX_map_key}`,	// 要访问的服务器的ip地址
            }
            var res = syncRequest('GET', option.url,{
                headers: { 'user-agent': 'example-user-agent' },
                json : {'Content-type': 'application/json'}
            });
            var rows = ( ( JSON.parse( res.getBody().toString() ) .result .rows ) [0] ).elements
            rows.forEach( (rowsItem,rowsIndex) =>{
                var distanceKm =  ( rowsItem.distance / 1000 )
                var flag = distanceKm - 3
                if ( flag < 0 ) {
                     var oldHouseInfo = item[rowsIndex]
                     var newHouseInfo ={
                         openid : oldHouseInfo.openid,
                         houseid : oldHouseInfo.houseid,
                         imgPath : oldHouseInfo.houseFrontCoverImgPath,
                         placeInfo : JSON.parse(oldHouseInfo.placeInfo),
                         price: JSON.parse(oldHouseInfo.price),
                         mode : JSON.parse(oldHouseInfo.mode),
                         feature: JSON.parse(oldHouseInfo.feature),
                         distanceKm : distanceKm + 'km'
                     }
                     okArr.push( newHouseInfo )
                }
            })
            // request.get( option, function( err, response, body ){
            //     var rows = ( (JSON.parse(body) .result .rows) [0] ).elements
            //     rows.forEach(  (rowsItem,rowsIndex) =>{
            //         var distanceKm =  ( rowsItem.distance / 1000 )
            //         var flag = distanceKm - 3
            //         if ( flag < 0 ) {
            //             // console.log ( item[ rowsIndex ] )
            //             okArr.push(item[rowsIndex])
            //         }
            //     })
            // });
        })
        if ( sortId != 0 ){
            okArr = okArr.sort(sortBy("price"))
            res.json( okArr )
        }else{
            res.json( shuffle(okArr) )
        }
    })
}

module.exports = {
    login,
    getRecommendHouseInfo
}