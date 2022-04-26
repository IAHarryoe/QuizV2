var websocket;
var allUsers;
var teamScores;

window.addEventListener("DOMContentLoaded", () => {
    websocket = new WebSocket("ws://" + location.hostname + ":8001/");

    websocket.onopen = () => {
        console.log("Connected to server");
        websocket.send(JSON.stringify({"type": "admInitialConnection", "time": Date.now()}));
        getUpdateQuestions();
        return false;
    }
    websocket.onmessage = ({ data }) => {
        console.log(data);
        dataJSON = JSON.parse(data);
    };

});
