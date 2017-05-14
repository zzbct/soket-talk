
window.onload = function() {
  var chart = new Chart()
  chart.init()
}

var Chart = function() {
   this.socket = null
}

Chart.prototype = {
   init: function() {
      var _this = this
      var color = ['#24284B','#C26553','#E1DF2D','#13B0E3','#FE4E4E','#1AC853']
      //建立到服务器的连接
      _this.socket = io.connect()
       document.getElementsByClassName('chartwrap')[0].style.display = 'none'
      var login = document.getElementById('loginBtn')
      login.onclick = function() {
         var nickname = document.getElementById('nickname').value
         //检查昵称是否为空
         if(nickname.trim().length > 0) {

            document.getElementsByTagName('h4')[0].textContent = '正在提交英雄帖......'
              //发起login事件
             _this.socket.emit('login',nickname)
         }
        else {
           alert('大侠,请留名！！')
        }
      }
      _this.socket.on('nickExisted', function() {
           document.getElementsByTagName('h4')[0].textContent = '名称被占用'; //显示昵称被占用的提示
       })
       _this.socket.on('loginSuccess', function() {
            document.getElementsByClassName('loginwrap')[0].style.display = 'none'
            document.getElementsByClassName('chartwrap')[0].style.display = 'block'
       })
       _this.socket.on('system',function(nickname,usersCount,type) {
           var msg = nickname + '  ' + (type === 'login'? '入池' : '出池')
           var p = document.createElement('p')
           p.textContent = msg
           p.style.color = color[Math.floor(Math.random()*color.length)]
           document.getElementById('msgPool').appendChild(p)
           document.getElementById('userCount').textContent = '{' + usersCount + 'online' + '}'
       })
   }
}