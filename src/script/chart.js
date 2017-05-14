
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
      var loginMap = document.getElementsByClassName('loginwrap')[0]
      var chartMap = document.getElementsByClassName('chartwrap')[0]
      var login = document.getElementById('loginBtn')
      var inputArea = document.getElementById('inputArea')
      var colorBtn = document.getElementById('colorStyle')
      var imgBtn = document.getElementById('fileImg')
      var send = document.getElementById('sendBtn')
      var clean = document.getElementById('clearBtn')

      if (typeof FileReader == 'undefined') {
         imgBtn.disabled = true;
      }
      else {
         var reader = new FileReader()
      }
      //建立到服务器的连接
      _this.socket = io.connect()
      chartMap.style.display = 'none'

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

      colorBtn.onchange = function() {
         inputArea.style.color = colorBtn.value
      }

      imgBtn.onchange = function() {
         if(this.files.length > 0) {
            var img = this.files[0]
            if (typeof img == 'undefined') {alert('选择对应文件');return;}
            if (!/image\/\w+/.test(img.type)) {alert('not image');return;}
            reader.readAsDataURL(img)
            reader.onload = function (e){
               this.value = ' '
               _this.socket.emit('postImg',e.target.result,colorBtn.value)
            }
         }
         

      }

      send.onclick = function() {
         var msg = inputArea.value
         if(msg.trim().length > 0) {
            _this.socket.emit('postMsg',msg,colorBtn.value)
         }
      }

      clean.onclick = function() {
         if(confirm('您是要清空聊天信息吗?')) {
             document.getElementById('msgPool').innerHTML = ''
         }
      }
      _this.socket.on('nickExisted', function() {
           document.getElementsByTagName('h4')[0].textContent = '名称被占用'; //显示昵称被占用的提示
       })

       _this.socket.on('loginSuccess', function() {
            loginMap.style.display = 'none'
            chartMap.style.display = 'block'
       })

       _this.socket.on('system',function(nickname,usersCount,type) {
           var msg = nickname + '  ' + (type === 'login'? '入池' : '出池')
           _this.printMsg('system',msg,'#FE4E4E')
           document.getElementById('userCount').textContent = '{' + usersCount + 'online' + '}'
       })

       _this.socket.on('getMsg',function(obj,msg,color) {
         _this.printMsg(obj,msg,color)
       })

        _this.socket.on('getImg',function(obj,img,color) {
         _this.printImg(obj,img,color)
       })
   },
   printMsg: function(obj,msg,color) {
      var p = document.createElement('p')
      var date = new Date().toTimeString().substr(0,8)
      p.innerHTML = obj + '(' + date + '):  ' + msg
      p.style.color = color || '#24284B'
      document.getElementById('msgPool').appendChild(p)
   },
   printImg: function(obj,img,color) {
      var p = document.createElement('p')
      var date = new Date().toTimeString().substr(0,8)
      p.innerHTML = obj + '(' + date + '): <br/><img class="imgs" src="' + img + '"/>'
      p.style.color = color || '#24284B';
      document.getElementById('msgPool').appendChild(p)
   }

}