
var currentQuestionID;
const websocket = new WebSocket("ws://localhost:8001");

function onLoad() {
    console.log("onLoad function called");
    websocket.send("Hello, world");

}

function quizButtonClick(button) {

}
