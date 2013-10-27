$(function(){
    
    checkAuth = function(){
         if(sessionStorage.getItem("login") == undefined)
            $.mobile.navigate("#login");
    }


    $(document).on("pageinit","#login",function(event){
        if(sessionStorage.getItem("login") != undefined){
            var user_type = sessionStorage.getItem("user_type");
            if(user_type == "vendedor"){
                $.mobile.navigate("#vendedorhome");
            }else{//comprador
                $.mobile.navigate("#inicio");
            }
        }

        //**************************************** Login *********************************
        var socket = io.connect('http://174.129.225.176/');
        socket.on('connect', function () {
            socket.send('hi');
            
            socket.on('login', function (msg) {
                //msg = JSON.stringify(msg)
                var status = msg["status"];
                var user_type = msg["type"];

                if(status == "ok"){
                    var sound = $("#bellSound")
                    sound[0].play()
                    sessionStorage.setItem("login", status);
                    sessionStorage.setItem("user_type", user_type);
                    
                    if(user_type == "vendedor"){
                        $.mobile.navigate("#vendedorhome");
                    }else{//comprador
                        $.mobile.navigate("#inicio");
                    }
                }else{
                    /*navigator.notification.alert(
                    'Usuario no registrado',     // mensaje (message)
                    'Login Error',            // titulo (title)
                    'OK'                // nombre del botón (buttonName)
                    );*/

                    //navigator.notification.vibrate(2000);
                }
                $("#message").html(status)
            });

            socket.on('message', function (msg) {
                //msg = JSON.stringify(msg)
                $("#message").html(msg)
            });

            var tiptoc = {
                sendMessage:function(){
                    var msg = $("#buscar").val()
                    socket.send(msg)
                },
                login:function(){
                    var user_Name = $("#userName").val()
                    var pass = $("#password").val()
                    socket.emit('login',{userName:user_Name,password:pass})
                }
            }

            $("#Btn_send").click(function(e){
                tiptoc.sendMessage()
            });
            $("#Btn_login").click(function(e){
                tiptoc.login()
            });
            $("#play").click(function(e){

                var snd = new Media("sounds/bell.mp3");
                snd.play();

                //var sound = $("#bellSound")
                //sound[0].play()
            });

        });
        
    });        

    $(document).on("pageinit","#inicio",function(event){
        checkAuth();
    });    

        $(document).on("pageinit","#vendedorhome",function(event){
        checkAuth();
    });    


});