/**
 * 服务器模块
 * @author Candy程
 * @Version 1.0
 */

var express = require('express')
var io = require('socket.io')
var http = require('http')
function start() {
   /*一般写法
      var server = http.createServer(function(request,response) {
         response.writeHead(200, {'content-type': 'text/html'})
         response.write("<h1>Hello, Welcom to Candy程's chartRoom</h1>")
         response.end()
      })
   */

   /*使用express*/

   var app = express()
   var server = http.createServer(app)
   var socket = io.listen(server) //引入socket.io模块并绑定到服务器
   app.use('/',express.static(__dirname + '/src'))
   server.listen(8080)

   //数据存储
   var users = []
   //socket部分
   socket.on('connection', function(client) {
       //接收并处理客户端发送的login事件
       client.on('login', function(data) {
           if(users.indexOf(data) !== -1) {
            //向client客户端发送事件
            client.emit('nickExisted')
           }
           else {
            client.pos = users.length
            client.nickname = data
            users.push(data)
            client.emit('loginSuccess')
            //向所有连接到服务器的客户端发送事件
            socket.sockets.emit('system',data,users.length,'login')
           }
       })
       client.on('disconnect',function() {
          users.splice(client.pos,1)
          //通知除自己以外的客户端“自己退出聊天”
          client.broadcast.emit('system',client.nickname,users.length,'logout')
       })
   })
}

exports.start = start