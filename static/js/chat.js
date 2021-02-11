/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");


/** called when connection opens, sends join info to server. */

ws.onopen = function(evt) {
  console.log("open", evt);

  let data = {type: "join", name: name};
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = function(evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  }

  else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  }

  else if (msg.type === "info") {
    item = $(`<li><i>Are the users currently chatting.</i></li>`);
    for(line of msg.data){
      $('#messages').append(`<li><i>${line}</i></li>`);
    }
  }

  else {
    return console.error(`bad message: ${msg}`);
  }

  $('#messages').append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$('form').submit(async (evt) => {
  evt.preventDefault();

  let data = {type: "chat", text: $("#m").val()};
  if(data.text.startsWith("/joke")){
    const response = await axios.get('https://icanhazdadjoke.com/', {
      headers:{
        'Accept': 'application/json' 
      }
    });
    $('#m').val(response.data.joke);
  }else if(data.text.startsWith("/members")){
    data.type = "members";
    ws.send(JSON.stringify(data));
    $('#m').val('');
  }else if(data.text.startsWith("/priv")){
    data.type = "pm";
    ws.send(JSON.stringify(data));
    $('#m').val('');
  }else{
    ws.send(JSON.stringify(data));
    $('#m').val('');
  }
});

