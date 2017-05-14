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

   app.use('/',express.static(__dirname + '/source'))
   server.listen(8080)

   //socket部分
   socket.on('connection', function(client) {
       //接收并处理客户端发送的foo事件
       client.on('foo', function(data) {
           //将消息输出到控制台
           console.log(data);
       })
   })
   
}

exports.start = start