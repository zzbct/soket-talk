
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
      var loginWrap = document.getElementsByClassName('loginwrap')[0]
      var chartWrap = document.getElementsByClassName('chartwrap')[0]
      var emojiWrap = document.getElementById('emojiWrap')
      var emojiContainer = document.getElementById('emojiContainer')
      var msgPool = document.getElementById('msgPool')
      var login = document.getElementById('loginBtn')
      var inputArea = document.getElementById('inputArea')
      var colorBtn = document.getElementById('colorStyle')
      var imgBtn = document.getElementById('fileImg')
      var emojiBtn = document.getElementById('emojiBtn')
      var send = document.getElementById('sendBtn')
      var clean = document.getElementById('clearBtn')

      //建立到服务器的连接
      _this.socket = io.connect()

      //dom初始化操作
      chartWrap.style.display = 'none'
      _this.initEmojiWrap()

      if (typeof FileReader == 'undefined') {
         imgBtn.disabled = true;
      }
      else {
         var reader = new FileReader()
      }

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

      emojiBtn.onclick = function() {
         if(emojiWrap.style.display === 'block') {
            emojiWrap.style.display = 'none'
            msgPool.style.height = '400px'
         }
         else {
            emojiWrap.style.display = 'block'
            msgPool.style.height = msgPool.offsetHeight -  emojiWrap.offsetHeight +'px'
         }
      }

     emojiWrap.onclick = function(e) {
          var e = e || window.event
          var target = e.target || e.srcElement
          if (target.nodeName.toLowerCase() == 'img') {
              inputArea.focus()
              inputArea.value +=  '[emoji:' + target.alt + ']'
          }
      }

      send.onclick = function() {
         var msg = inputArea.value
         if(msg.trim().length > 0) {
            _this.socket.emit('postMsg',msg,colorBtn.value)
            inputArea.value = ''
            if(emojiWrap.style.display === 'block') {
               emojiWrap.style.display = 'none'
               msgPool.style.height = '400px'
            }
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
            loginWrap.style.display = 'none'
            chartWrap.style.display = 'block'
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
      msg = this.processEmoji(msg)
      var p = document.createElement('p')
      var date = new Date().toTimeString().substr(0,8)
      p.innerHTML = obj + '(' + date + '):  ' + msg
      p.style.color = color || '#24284B'
      msgPool.appendChild(p)
   },

   printImg: function(obj,img,color) {
      var p = document.createElement('p')
      var date = new Date().toTimeString().substr(0,8)
      p.innerHTML = obj + '(' + date + '): <br/><img class="imgs" src="' + img + '"/>'
      p.style.color = color || '#24284B';
      msgPool.appendChild(p)
   },

   //初始化表情包
   initEmojiWrap: function() {
      var docFragment = document.createDocumentFragment()
      var j = 0
      while(j < 2) {
         for(var i = 0; i < 20; i++) {
            var emoji = document.createElement('img')
            emoji.src = '../resource/gif' + j +'/' + i + '.gif'
            emoji.alt = i + j*20
            emoji.class = 'emoji'
            emojiWrap.appendChild(emoji)
         }
         var br = document.createElement('br')
         emojiWrap.appendChild(br)
         j++
      }
   },

  //预处理携带表情的消息
   processEmoji: function(msg) {
      var reg = /\[emoji:\d+\]/g
      var match = []
      var result = msg
      var imgNum = emojiWrap.children.length
      if(match = msg.match(reg)) {
         for(var i = 0; i < match.length; i++) {
            var index = match[i].slice(7,-1)
            if(index < imgNum) {
               var str = "<img class='emoji' src = '../resource/gif" + Math.floor(index / 20) +"/" + index % 20 + ".gif'" +"/>"
               result = result.replace(match[i],str)
            }
            else {
               result = result.replace(match[i],'[x]')
            }
         }
      }
      return result
   }
}