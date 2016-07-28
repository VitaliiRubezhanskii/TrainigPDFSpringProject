is_in_browser = 1;
// start in browser also her.e
// this can be changed if inside pdf view.

socketconnected = 0;

// parameter from url: session id, username role
// if no parameter found returns null.
function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '='
                        + '([^&;]+?)(&|#|;|$)').exec(location.search) || [ , "" ])[1]
                        .replace(/\+/g, '%20'))
                        || null
}

// var socket; not used. instead:
socket = null; // global var
var registered = false;

function addChatLine(newline) {
        // add online msg to chatbox
        var d = document.createElement('div');
        var sonline = document.createElement('span');
        $(sonline).addClass("chatusername").text(newline).appendTo($(d));
        $(d).appendTo("#chatBox");
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

function setGlobals() {
        // register the user
        // var nickname = $("#nickname").val();

        if (getURLParameter("customername") == null) {
                // this means we couldn't take the parameters from the
                // url. In that case it means that it's in the pdf
                // viewer and it tries to take the url of the top page.
                // and it has other get parameters.
                // In this case, we have shared global variables with
                // the main page, so I can simply take these global variables:

                sessionid = thisSessionId;

                // other global variables are already set at customviewercode.js

                // alert("Error, no customer name parameter");
        } else // we have params in url! quickchat mode
        {
                // run this only we have params.
                // otherwise it erases the loaded data in
                // customviewercode.
                customername = getURLParameter("customername");
                role = getURLParameter("role");
                salesman = getURLParameter("salesman");

                sessionid = getURLParameter("sessionid");
        }
        if (sessionid == null)
                alert("Error, no sessid parameter for chat");
        if (role == null)
                alert("Error, no role parameter for chat");
        if (salesman == null)
                alert("error, no salesman parameter for chat");

        
        // Set chat header user name.
        switch (Number(role)) { // TODO: Why role is not of type int?
          
          // A customer has opened the presentation viewer.
          case 0:
            $('#sp-live-chat h4').text(salesman);
            username = customername; // TODO: is username variable needed?
            break;
      
          // A salesman has opened the presentation viewer.
          case 1:
            $('#sp-live-chat h4').text(customername);
            username = salesman; // TODO: is username variable needed?
            break;
            
          default:
            $('#sp-live-chat h4').text('Salesman');
        }
        
        $(document).ready(function() {
          
          $('#sp-live-chat header').click(function() {
            $('.sp-chat').slideToggle(300, 'swing');

            /* Disable chat message counter functionality for now.
                        $('.chat-message-counter').fadeToggle(300, 'swing');
             */
          });

          /* Disable chat close functionality for now.
                $('.chat-close').on('click', function(e) {
                        e.preventDefault();
                        $('#live-chat').fadeOut(300);
                });
           */
          
          $('.sp-chat-avatar:first-child').text(salesman.charAt(0).toUpperCase());
          $('.sp-chat-message h5:first-of-type').text(salesman);
          $('.sp-chat-message p:first-of-type').text('Please use this ' +
              'chat to ask me anything. All of your messages will be saved and sent to me. If I ' +
              'am online, I will be able to assist you immediately.');
        });
        
        updateChatWith();
}


function updateChatWith()
{
        // customer sees chatting with salesman
        if (role == "0") {
                user = {
                        "username" : customername,
                        "sessionid" : sessionid,
                        "role" : role
                };
                // $("#chatWith").text("Chatting with " + salesman);
                
                chatWithHtml ="<b><u>Chatting with " + salesman+ "</u></b>"; 
                openChatWithHtml ="<b><u>Open chat with " + salesman + "</u></b>";
                $("#chatWith").html(chatWithHtml);
                                
                username = customername;
        } else
        // salesman sees chatting with customer
        if (role == "1") {
                user = {
                        "username" : salesman,
                        "sessionid" : sessionid,
                        "role" : role
                };
                username = salesman;
                
                chatWithHtml ="<b><u>Chatting with " + customername+ "</u></b>"; 
                openChatWithHtml ="<b><u>Open chat with " + customername + "</u></b>";
                $("#chatWith").html(chatWithHtml);
                
        //      $("#chatWith").text("Chatting with " + customername);
        } else {
                alert("ERROR - role is not defined.");
        }       
}

function connectSocket() {
        // just hide it, always. No btn, like in facebook.
        $("#btnSend")[0].style.visibility = "hidden";

        loadChatHistory();
        socket = new SockJS(socketString);
        // When the connection is opened, login.
        socket.onopen = function() {
                socketconnected = 1;
                console.log("Opened socket.");
                socket.send(JSON.stringify(user));

                // loadChatHistory();
                // socket opened - load history
        }; // onopen

        // When received a message, parse it and either add/remove user or post
        // message.
        socket.onmessage = function(a) {
                socketconnected = 1;

                // process the message here
                console.log("parsing JSON message: " + a.data);

                var message = JSON.parse(a.data);
                // console.log("msg is: " + message.toString());

                console.log("message is " + JSON.stringify(message));

                // all messages I receive are already filtered by
                // server to sessionid so should be displayed.
                if (message.hasOwnProperty("addUser")) {
                        console.log("addUser detected");
                        var d = document.createElement('div');
                        $(d).addClass("chatusername user").text(message.addUser.username)
                                        .attr("data-user", message.addUser.username.toString())
                                        .appendTo("#nicknamesBox");

                        if (message.addUser.username != username) // it's not me
                        {
                                if (mobilecheck() == false) {
                                        showChat();
                                }

                                // add online msg to chatbox
                                
                                
                                $('#sp-live-chat h4').addClass('sp-chat-user-status-online').removeClass('sp-chat-user-status-offline');
                                
                                
                                var d = document.createElement('div');
                                var sonline = document.createElement('span');
                                $(sonline).addClass("chatusername").text(
                                                message.addUser.username + " is online.")
                                                .appendTo($(d));
                                $(d).appendTo("#chatBox");
                                $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);

                                console.log("chatbox html: " + $("#chatBox").innerHTML);
                        }

                        console.log("Added user " + message.addUser.username);
                } else if (message.hasOwnProperty("removeUser")) {

                        if (message.removeUser.username != username) // it's not me
                        {
                                // add offline msg to chatbox
                          
                          
                                $('#sp-live-chat h4').addClass('sp-chat-user-status-offline').removeClass('sp-chat-user-status-online');
                          
                                
                                var d = document.createElement('div');
                                var soffline = document.createElement('span');
                                $(soffline).addClass("chatusername").text(
                                                message.removeUser.username + " is offline.").appendTo(
                                                $(d));
                                $(d).appendTo("#chatBox");
                                $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
                        }

                        console.log("removeUser detected");

                        // this causes some error, so I commented it.
                        // users list is not shown anyway.
                        // $(".user[data-user="+message.removeUser.username+"]").remove();
                        console.log("Removed user " + message.removeUser.username);

                } else
                // only regular msgs are sent -
                if (message.hasOwnProperty("message")) {

                        if (mobilecheck() == true) {
                                hideChat();
                        } // hide on mobile

                        // if it's salesman, always show chat.

                        if (role == 1) {
                                showChat();
                        }
                        console.log("regular message detected (also slide change)");
                        // regular message - we have
                        // message JSON with message and user insude.
                        var d = document.createElement('div');
                        var suser = document.createElement('span');
                        var smessage = document.createElement('span');
                        $(suser).addClass("chatusername").text(
                                        message.message.user.username + " : ").appendTo($(d));
                        $(smessage).addClass("msgtext").text(message.message.messagetext)
                                        .appendTo($(d));
                        // not adding msg yet to chatbox -
                        // checking if it should be - maybe
                        // slide changes should be changed and not
                        // added.

                        
                        if (0 != message.message.messagetext.indexOf("Changed to slide #")) {
                          createChatMessage(message.message);
                        }
                        
                        
                        if (quickchatmode == 0)
                        // not quickchat, need to change slides!
                        {
                                // change slide message
                                // I don't show chat on this kind of events.
                                if (message.message.messagetext.indexOf("Changed to slide #") > -1)

                                {
                                        var slidenum = message.message.messagetext.substring(18);
                                        console.log("changing to slide # " + slidenum);
                                        // really change slide here too!

                                        // we're in full chat mode, so this should
                                        // work - we have pdf viewer.
                                        if (slidenum > 0) {
                                                // if (is_in_browser)
                                                // I want this to work also out of browser.
                                                {
                                                        // change page number in PDF!
                                                        PDFViewerApplication.page = (slidenum | 0);
                                                        // and in textbox:
                                                        $("#pageNumber").val(slidenum);
                                                        // to avoid having the engine
                                                        // read this as slide change event
                                                        // and send another event to others
                                                        // in chat, I must do these:
                                                        cur_slide = slidenum;
                                                        prev_slide = slidenum;
                                                        // this way there won't be a slide
                                                        // change event registered here.

                                                        // this caused a bug. If I change cur_slide
                                                        // then in the slides detection loop it finds I'm
                                                        // out
                                                        // of browser, then cur_slide is -1 and prev_slide
                                                        // is set,
                                                        // and slide has CHANGED, every time.
                                                        // to fix this:
                                                        slides_controlled = true;
                                                }
                                        } else {
                                                alert("bad slidenum " + slidenum);
                                        }

                                        // full chat - I DON'T show slidechange
                                        // messages - I just CHANGE slides.
                                } else // not change slide msg
                                {
                                        // regular msg - show chat.
                                        if (mobilecheck() == false) {
                                                showChat();
                                        } // show on desktop

                                        // regular msg - display it anyway.
                                        $(d).appendTo("#chatBox");

                                        if (role == 0) // customer
                                        {
                                                chatBoxHtml = $("#chatBox").html();
                                                console
                                                                .log("Customer chatbox - html is "
                                                                                + chatBoxHtml);

                                                // cannot find online user in chat history.
                                                if (chatBoxHtml.indexOf(" is online") == -1) {
                                                        // add unavailable message
                                                        var away_div = document.createElement('div');
                                                        var away_span = document.createElement('span');
                                                        $(away_span).addClass("chatusername").text(
                                                                        salesman + " is offline. Message saved.")
                                                                        .appendTo($(away_div));
                                                        $(away_div).appendTo("#chatBox");
                                                        $("#chatBox").scrollTop(
                                                                        $("#chatBox")[0].scrollHeight);
                                                } else {
                                                        console
                                                                        .log("salesman is online. not sending away msg.");
                                                }
                                        }
                                }
                        } else {
                                // quickchat mode -- always show messages
                                // include slide changes.
                                // append the message as real text message.
                                $(d).appendTo("#chatBox");
                        }
                        // anyway, move chatbox as needed.
                        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);

                } // of regular msg
                else {
                        alert("unknown message type" + message.toString());
                }
        }

        socket.onclose = function() {
                socketconnected = 0;
                console.log("socket closed. trying to reconnect");
                addChatLine("Chat disconnected.");
                // retry in 5sec.
                
                setTimeout(connectSocket, 5000);
        };

        socket.onerror = function() {
                alert("Error transmitting chat content");
                socketconnected = 0;
        };

        $('#txtMessage').keyup(function(e) {
                if (e.keyCode == 13 && '' != $('#txtMessage').val()) {
                        sendMessage();
                }
        });
        $("#btnSend").click(function() {
                sendMessage();
                showChat();
        });
        $("#btnClose").click(function() {
                minimizeChat();
        });
        $("#chatWith").click(function() {
                showChat();
        });
}

function startClient() {

        console.log("opening socket");
        // on http server use document.domain instead od "localhost"
        // Start the websocket client
        
        
        /* 17-Nov-15: Created a generic solution for composing the web sockets URL */
        socketString = null;
        
        $.ajax({
                async: false,
                dataType: "json",
                url: "../../config",
        }).done(function( data ) {
                socketString = data.webSocketsUrl.replace(/\/$/, "") + "/chat";
        }).fail(function( jqXHR, textStatus, errorThrown ) {
                console.log( textStatus + ": " + errorThrown );
        });
                
        console.log("connecting to socket " + socketString);

        setGlobals();

        // timeout because I see msgs in reverse order.
        // first I see console log and then GET.
        // maybe this will help it appear in correct order.
        // AND - solve HTTP FORBIDDEN issue (only on openshift)
        // SOLVED: I just put allowedRegion=*.
        // Also I don't want chat to appear immediately.
        setTimeout(connectSocket, 300);
} // of startClient

function sendMessage() {
        if (socketconnected == 0) {

                chatmsg = $("#txtMessage").val();
                // avoid problems with " and ' in json.
                chatmsg = chatmsg.replace("\"", "");
                chatmsg = chatmsg.replace("'", "");
                chatmsg = username + ": " + chatmsg;

                // addChatLine("Error in chat connection.");

                console.log("sending ajax chat msg: " + chatmsg);

                // send message using ajax:

                $.ajax({
                        type : "POST",
                        url : "../../ChatServlet",
                        data : '{"action":"addChatMessage", ' + ' "session_id":"'
                                        + sessionid + '",    ' + ' "msgtext":"' + chatmsg + '"}',
                        contentType : "application/json; charset=utf-8",
                        processData : false,
                        error : function(XmlHttpRequest, status, error) {
                                //alert('chatservlet error from returned json' + error);
                        },
                        success : function(msg) {
                                console.log("chat message sent using servlet");
                                $("#txtMessage").val("");
                        } // success func
                }); // end of ajax call

        } else { // connected
                if ($("#txtMessage").val()) {
                        socket.send($("#txtMessage").val());
                        $("#txtMessage").val("");
                }
        }
}

// only in non-quickchat mode, exchange slides between partners.
function sendSlideNum() {
        // if in window.
        if (cur_slide != -1) {
                socket.send("Changed to slide #" + $("#pageNumber").val());
        }
}

function minimizeChat() {

        if (quickchatmode != 1) // not quick chat.
        // otherwise we never hide the chat.
        {
                // display chat box
                // but only the top of it...
                chatDiv = $("#chatDiv");

                // $("#chatContainer")[0].style.visibility = "hidden";

                // just hide bottom parts.
                chatDiv[0].style.visibility = "visible";
                $("#chatBottom")[0].style.display = "none";
                $("#chatBox")[0].style.display = "none";
                $("#btnClose")[0].style.display = "none";

                chatWith = $("#chatWith")[0];
                
//              chatWithHtml ="<b><u>Chatting with " + salesman + "</u></b>"; 
        //openChatWithHtml ="<b><u>Open chat with " + salesman + "</u></b>";
                updateChatWith();
                $("#chatWith").html(openChatWithHtml);
                
                chatWith.style.visibility = "visible";

                maxY = window.innerHeight;
                divHeight = chatWith.offsetHeight * 1.2; // a little more

                // not full height.
                $("#chatContainer")[0].style.height = divHeight + "px";
                chatDiv[0].style.height = divHeight + "px";

                chatDiv[0].style.top = (maxY - divHeight - 10) + "px";

                // chatDiv[0].style.top = topVal+"px";
                chatDiv[0].style.left = leftVal + "px";
        }
}

function hideChat() {

        //if (quickchatmode != 1) // not quick chat.
        // otherwise we never hide the chat.
        
        if (role==0) //customer
        {
                // display chat box
                // but only the top of it...
                // chatDiv = $("#chatDiv");

                $("#chatContainer")[0].style.visibility = "hidden";
                $("#chatContainer")[0].style.display = "none";

                chatDiv = $("#chatDiv");
                // just hide bottom parts.
                chatDiv[0].style.visibility = "hidden";         
                chatDiv[0].style.display = "none";
        }
}

function showChat() {
        chatDiv = $("#chatDiv");
        
        chatWith = $("#chatWith")[0];
        //chatWithHtml ="<b><u>Chatting with " + salesman + "</u></b>"; 
        //openChatWithHtml ="<b><u>Open chat with " + salesman + "</u></b>";
        $("#chatWith").html(chatWithHtml);
        
        if (quickchatmode == 0) {
                
                if ((mobilecheck() == true)&&(role==0))
                        {
                                                // no chat on mobile!!!
                        }
                else
                        {
                                                // display chat box             
                                                chatDiv[0].style.visibility = "visible";
                                                $("#chatBottom")[0].style.visibility = "visible";
                                                $(".chatcontentDiv")[0].style.visibility = "visible";
                                                $("#btnClose")[0].style.visibility = "visible";
                                                $("#chatBottom")[0].style.display = "block";
                                                $(".chatcontentDiv")[0].style.display = "block";
                                                $("#btnClose")[0].style.display = "block";
                                                $("#chatBox")[0].style.display = "block";
                                        
                                
                                                // full height
                                                $("#chatContainer")[0].style.height = "210px";
                                                chatDiv[0].style.height = "210px";
                                
                                                maxY = window.innerHeight;
                                                divHeight = chatDiv[0].offsetHeight;
                                                chatDiv[0].style.top = (maxY - divHeight - 10) + "px";
                                
                                                maxX = window.outerWidth;
                                                chatDivWidth = chatDiv.outerWidth();
                                                // console.log("maxX " + maxX + " chatDivWidth " + chatDivWidth);
                                                leftVal = maxX - chatDivWidth - 25;
                                                chatDiv[0].style.left = leftVal + "px";
                                                // original way to show it
                                                // $("#chatContainer")[0].style.visibility = "visible";
                                        
                        }
        } else {
                // quickchat, just show everything.
                        // chat div is NOT DEFINED.
        }
        
}

function loadChatHistory() {
        $
                        .ajax({
                                type : "POST",
                                url : "../../ChatServlet",
                                data : '{"action":"getChatMessages", "session_id":"'
                                                + sessionid + '"}',
                                contentType : "application/json; charset=utf-8",
                                processData : false,
                                error : function(XmlHttpRequest, status, error) {
                                        //alert('chatservlet error from returned json' + error);
                                },
                                success : function(msg) {

                                  var chatHistory = msg.historyHtml.split('<BR>');
                                  chatHistory.pop();
                                  $.each(chatHistory, function(index, value) {
                                    var found = value.match(/(.+?):\s+(.+)/);
                                    
                                    var role = 0;
                                    if (salesman == found[1]) {
                                      role = 1;
                                    }
                                    
                                    var message = {
                                        user: {username: found[1], role: role},
                                        messagetext: found[2]
                                    };
                                    createChatMessage(message);
                                  });
                                  
                                        // JSONobj = JSON.parse(jsondata);
                                        his = msg.historyHtml;
                                        console.log("chat svlt ret: " + his);
                                        // add msgs to chatbox
                                        var d = document.createElement('div');
                                        var s = document.createElement('span');
                                        $(s).addClass("chatusername").html(his).appendTo($(d));
                                        $("#chatBox").empty();
                                        $(d).appendTo("#chatBox");
                                        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);

                                } // success func
                        }); // end of ajax call

}

/** ***************** RUN ON STARTUP **************** */

quickchatmode = 0;
/*
// check if quickchat or not, and act accordingly.
if (window.location.toString().indexOf("viewer.html") > -1) {
        // we're in pdf viewer
        quickchatmode = 0;
        console.log("PDF viewer mode");
        // startClient will be run from viewercode.js
} else {
        // we're in small chat window.
        quickchatmode = 1;
        console.log("quickchat window mode");
        // startup
        $(document).ready(function() {
                startClient();
        });
}
*/


/*
 * Create a chat message in the presentation viewer chat.
 * 
 * @param Object A message object containintg the message content, and author.
 * 
 */
function createChatMessage(message) {
  var chatMessage = $('.sp-chat-message:first-of-type').clone();
  
  switch (message.user.role) { // TODO: why the duplication of message.message?
    case 0:
      chatMessage.find('.sp-chat-avatar').addClass('sp-chat-avatar--customer');
      break;
    
    case 1:
    default:
      chatMessage.find('.sp-chat-avatar').removeClass('sp-chat-avatar--customer');
      break;
  }
                 
  chatMessage.find('.sp-chat-avatar').text(message.user.username
      .charAt(0).toUpperCase());
  chatMessage.find('h5').text(message.user.username);
  chatMessage.find('p').text(message.messagetext);
  
  $('.sp-chat-history').append(chatMessage);
  
  $('.sp-chat-history')[0].scrollTop = $('.sp-chat-history')[0].scrollHeight
      - $('.sp-chat-history')[0].clientHeight;
}