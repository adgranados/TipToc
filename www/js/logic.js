$(function(){
    hostServer = 'http://174.129.225.176/'
    connected = false;
  
    checkConnect = function(){
       if(!connected){
            $.mobile.navigate("#tryconnect");
        }
    }

    setInterval(function(){
        console.log("verificando")
        if(!connected){
            sessionStorage.removeItem("login"); 
            socket = io.connect(hostServer);
            setTimeout(
                function(){
                     $.mobile.navigate("#login");
                },3000)
        }
    },15000);

    checkAuth = function(){
        if(!connected)
            $.mobile.navigate("#tryconnect");
        
        else if(sessionStorage.getItem("login") == undefined)
            $.mobile.navigate("#login");
    }

    var socket = null;
    try{
        socket = io.connect(hostServer);
    } catch(err){
        connected = false;
        setTimeout(function(){window.location.reload()},3000)
    }


    if(socket == null){ 
      var start = new Date().getTime();
    
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
        window.location.reload();
    }
       

    socket.on('connect', function () {
        connected = true;
    });
    socket.on('error', function (reason){
         connected = false;
        console.error('Unable to connect Socket.IO', reason);
        $.mobile.navigate("#tryconnect");
    });
    socket.on('disconnect', function () {
        connected = false;
        $.mobile.navigate("#tryconnect");
    });

     $(document).on("pageinit","#tryconnect",function(event){
        sessionStorage.removeItem("login"); 
        sessionStorage.removeItem("user_type");
        socket = io.connect(hostServer);
        setTimeout(
            function(){
                 $.mobile.navigate("#login");
            },3000)
    });


    $(document).on("pageinit","#login",function(event){
        checkConnect();
    
        if(sessionStorage.getItem("login") != undefined){
            var user_type = sessionStorage.getItem("user_type");
            if(user_type == "vendedor"){
                $.mobile.navigate("#vendedorhome");
            }else{//comprador
                $.mobile.navigate("#inicio");
            }
        }

        //**************************************** Login *********************************
        socket.send('hi');
            
        socket.on('login', function (msg) {
            //msg = JSON.stringify(msg)
            var status = msg["status"];
            var user_type = msg["type"];
            var userName = msg["userName"];

            if(status == "ok"){
                var sound = $("#bellSound")
                sound[0].play()
                sessionStorage.setItem("login", status);
                sessionStorage.setItem("user_type", user_type);
                sessionStorage.setItem("userName",userName);
                
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
            var sound = $("#bellSound")
            sound[0].play()
        });

    
    });        


    $(document).on("pageinit","#inicio",function(event){
        checkAuth();
         
        socket.on('sendQuestion', function (msg) {
            console.log(msg);
        });


        socket.on('sendQuestion', function (msg) {
            console.log(msg);
        });
        socket.on('categories', function (msg) {
            //console.log(msg.q_split);
            //console.log(msg.categories);
            //categoriesNumber = msg.categories.length;
            sessionStorage.setItem("q_split",msg.q_split)

            $.each(msg.categories,function(index, value){
                //console.log(index)
                //console.log(value)
                var checkbox = '<input type="checkbox" name="categorie-'+ index + '" id="categorie-' + index + '" value="' + value + '"/> <label for="checkbox-' + index  + '">' + value + '</label>';

                $("#listCategories fieldset").append(checkbox);
            });
            //$("input[type='checkbox']").attr("checked",true).checkboxradio("refresh");
        });

        var tiptoc = {
            sendQuestion:function(){
                var question = $("#question").val()
                socket.emit("question",{q:question,location:null})
            },
            questionCategories:function(q_split){
                var questionCategoriesChecked = $("#listCategories fieldset input:checked")
                var listCategoriesChecked = []
                $.each(questionCategoriesChecked,function(index, data){
                    listCategoriesChecked[index] = data.value;
                });

                q_split = sessionStorage.getItem("q_split")
                q_split = q_split.split(",");
                socket.emit("question_categories",{q_split:q_split,categories_selected:listCategoriesChecked});

                $.mobile.navigate("#resultados");
            }
        }

        $("#send").click(function(){
            tiptoc.sendQuestion()
        });


        $("#search").click(function(){
           tiptoc.questionCategories() 
        })

    });    

    $(document).on("pageinit","#vendedorhome",function(event){

        checkAuth();
        socket.on('new_pulling_question', function (data) {
            dataStr = JSON.stringify(data);
            //sessionStorage.setItem("username_comprador",data.username)
            $("[data-role=listview]").eq(1).children().eq(0).after('<li><a data-msj=\''+dataStr+'\' href="javascript:void(0)" class="question"><h3>'+data.username+'</h3><p><srtong>'+data.q+'</strong></p><p>'+data.date+'</p><p class="ui-li-aside"><strong>6:24</strong>PM</p></a></li>');
            $("[data-role=listview]").eq(1).listview('refresh');

            $(".question").click(function(e){
                data = $(this).attr("data-msj")
                sessionStorage.setItem("dataQuestion",data);
                $.mobile.navigate("#vendedorresponder");
            })
        });

    });  

     $(document).on("pageinit","#vendedorresponder",function(event){

        checkAuth();
        var dataQuestion = sessionStorage.getItem("dataQuestion");
        dataQuestion = JSON.parse(dataQuestion);
        
        
        var question = dataQuestion["q"];
        var userNameComprador = dataQuestion["username"];
        var dateRequest = dataQuestion["date"];
        var login = sessionStorage.getItem("userName");
        
        $("#textQuestion").html(question)

        var msjVendedor = $("textarea-oferta").val()

        var tiptoc = {
            response_to_client:function(msgVendedor,userNameComprador,login){
                socket.emit("response_to_client",{msgvendedor:msgVendedor,comprador_username:userNameComprador,vendedor_username:login})

                $.mobile.navigate("#vendedorhome");  

            }
        }


        $("#enviarvendedor_responder").click(function(){
            msgVendedor = $("#textarea-oferta").val()
            tiptoc.response_to_client(msgVendedor,userNameComprador,login)
        });

    });     

    $(document).on("pageinit","#resultados",function(event){
        checkAuth();

         socket.on('send_response', function (data) {
            $("#options").append("<li><a href='#'><h2>"+ data.vendedor_username +"</h2><p>" + data.msgvendedor + "</p><span class='ui-li-count'>1</span></a></li>");
            $("#options").listview('refresh');
        });
    });    

    

   

});