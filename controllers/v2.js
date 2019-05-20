/**
 *@作者 : 小Z同学
 *@TheFileFunction ：
 *@CreatedDate : 2019/5/19
 **/
// 导入 mysql 链接池
const mysqlConnection = require ( "../mysql/mysqlDB.js" )
const fs = require("fs");

async function getHouseInfo ( req,res ) {
    var openid  = req.query.openid
    var houseid = req.query.houseid
    var selectSql = `select * from userhouse where openid = '${openid}' and houseid = '${houseid}'`
    mysqlConnection.query(selectSql)
    .then( result =>{
        var publishData = JSON.parse(result.results[0].publishData)
        var houseFrontCoverImgPath = result.results[0].houseFrontCoverImgPath
        var houseOtherImgListInfo  = JSON.parse(result.results[0].houseOtherImgListInfo)
        houseOtherImgListInfo.forEach( item =>{
            if ( item.info == '' ){
                item.info = "✎描述"
            }
        })
        publishData.houseFrontCoverImgPath = houseFrontCoverImgPath
        publishData.houseOtherImgList = houseOtherImgListInfo
        res.json( publishData )
    })
}

async function updateHouseInfo ( req,res ) {
    var openid  = req.body.openid
    var houseid = req.body.houseid
    var setSubmitMode = req.body.setSubmitMode

    if ( setSubmitMode == 'img'){
        // 得到文件后缀
        var suffix  = ( req.file.mimetype.split('/') )[1]
        // 得到图片类型 : 封面 还是 其他图片
        var imgMode =  req.body.imgMode
        // 得到保存到 img 文件夹的 文件名
        if ( imgMode == 'cover' ){
            //删除文件
            var selectSql = `select * from userhouse where openid = '${openid}' and houseid = '${houseid}' `
            mysqlConnection.query( selectSql )
            .then( data =>{
                var houseFrontCoverImgPath = data.results[0].houseFrontCoverImgPath
                var houseOtherImgListInfo = JSON.parse(data.results[0].houseOtherImgListInfo)
                fs.unlinkSync(houseFrontCoverImgPath)
                houseOtherImgListInfo.forEach( item =>{
                    var filePath = item.imgPath
                    fs.unlinkSync(filePath)
                    console.log ( "删除ok" )
                })

                // 封面 为 openid_houseid_cover
                var newImgName = openid + "@@" + houseid + "@@" + imgMode
                var newPath = 'public/img/' + newImgName + '.' + suffix

                var updateSql =`update userhouse  set  houseFrontCoverImgPath = '${newPath}', houseOtherImgListInfo = '' where houseid = '${houseid}' `
                mysqlConnection.query(updateSql)
                // 图片改名
                fs.renameSync('public/img/' + req.file.filename, newPath )
                res.end("上传封面成功")
            })

        } else if( req.body.imgMode == 'other' ){
            // 其他图片为 openid_houseid_other_index
            var index = req.body.index
            var newImgName = openid + "@@" + houseid + "@@" + imgMode + "@@" + index
            var newPath = 'public/img/' + newImgName + '.' + suffix
            // 其他图片信息
            var otherImgInfo = JSON.parse( req.body.otherImgInfo )
            otherImgInfo.imgPath = newPath
            var getHouseOtherImgListInfoSql = `select houseOtherImgListInfo from userhouse where houseid = '${houseid}'`
            mysqlConnection.query(getHouseOtherImgListInfoSql)
            .then( data =>{
                if ( data.results[0].houseOtherImgListInfo == ''){
                    var houseOtherImgListInfo = []
                }else{
                    var houseOtherImgListInfo = JSON.parse( data.results[0].houseOtherImgListInfo )
                }
                houseOtherImgListInfo.push( otherImgInfo )
                var houseOtherImgListInfoStr = JSON.stringify( houseOtherImgListInfo )
                var updateInfoSql = `update userhouse set  houseOtherImgListInfo = '${houseOtherImgListInfoStr}' where houseid = '${houseid}'`
                mysqlConnection.query( updateInfoSql )
                // 图片改名
                fs.renameSync('public/img/' + req.file.filename, newPath )
                res.end("上传其他图片成功")
            })

        }
    }
    else{
        var updateSql = `update userhouse set  
                mode = '${req.body.mode}' , placeInfo = '${req.body.placeInfo}' , room = '${req.body.room}' , toilet = '${req.body.toilet}' ,
                acreage = '${req.body.acreage}' , storey = '${req.body.storey}' , payTime = '${req.body.payTime}' , price = '${req.body.price}' ,
                feature = '${req.body.feature}' , houseDescribeValue = '${req.body.houseDescribeValue}' , contactWay = '${req.body.contactWay}',
                publishData = '${req.body.publishData}'
                where houseid = '${houseid}'`
        mysqlConnection.query(updateSql)
        res.end('房源数据修改完毕')
    }
}

async function deleteHouseInfo ( req,res ) {
    var openid  = req.query.openid
    var houseid = req.query.houseid

    //删除文件
    var selectSql = `select * from userhouse where openid = '${openid}' and houseid = '${houseid}' `
    mysqlConnection.query( selectSql )
    .then( data =>{
        var houseFrontCoverImgPath = data.results[0].houseFrontCoverImgPath
        var houseOtherImgListInfo = JSON.parse(data.results[0].houseOtherImgListInfo)
        fs.unlinkSync(houseFrontCoverImgPath)
        houseOtherImgListInfo.forEach( item =>{
            var filePath = item.imgPath
            fs.unlinkSync(filePath)
        })
        var deleteSql = `delete from userhouse where openid = '${openid}' and houseid = '${houseid}'`
        mysqlConnection.query(deleteSql)
        res.end("删除成功")

    })
}

module.exports = {
    getHouseInfo,
    updateHouseInfo,
    deleteHouseInfo
}