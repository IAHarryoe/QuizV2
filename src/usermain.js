var websocket;
var userName = "";
var userID = "";
window.addEventListener("DOMContentLoaded", () => {
    websocket = new WebSocket("ws://localhost:5678/");
  


    websocket.onopen = () => {
        console.log("Connected to server");
        websocket.send(JSON.stringify({"type":"initialConnection", "time":Date.now()}));
    };
    websocket.onmessage = ({ data }) => {
        console.log(data);
        if (data["type"] == "initialConnection") {
            dataJSON = JSON.parse(data);
            userID = dataJSON["userID"];
            document.getElementById("userName").innerHTML = userName;
            document.getElementById("userID").innerHTML = userID;
        }
    };  
});

function quizButtonClick(buttonID) {
    console.log("Button " + buttonID + " was pressed")
    websocket.send(JSON.stringify({"type":"buttonPress", "buttonID":buttonID, "time":Date.now()}));
}

function stopWithText(text,time) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("overlayText").innerHTML = text;
    setTimeout(() => {
        document.getElementById("overlay").style.display = "none";
    },time)
}
