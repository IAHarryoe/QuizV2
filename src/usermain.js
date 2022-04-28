var websocket;
var userName = "";
var userID;
var userTeamID;
var currentQuestion = 0;
var score = 0;

window.addEventListener("DOMContentLoaded", () => {
    websocket = new WebSocket("ws://"+ location.hostname+":8001/");

    websocket.onopen = () => {
        console.log("Connected to server");
        websocket.send(JSON.stringify({"type":"initialConnection", "time":Date.now()}));
        getUpdateQuestions();
        return false;
    };
    websocket.onmessage = ({ data }) => {
        console.log(data);
        dataJSON = JSON.parse(data);
        if (dataJSON["type"] == "initialConnection") {
            userID = dataJSON["userID"];
            document.getElementById("userNameSpot").innerHTML = userName;
            document.getElementById("userID").innerHTML = userID;
        }
        if (dataJSON["type"] == "questionResponse") {
            if (dataJSON["correct"]) {
                score += 1;
                document.getElementById("score").innerHTML = score;
                getUpdateQuestions();
            }else {stopWithText("Wrong answer. Try again in 5 seconds.",5000);}

        }
        if (dataJSON["type"] == "getQuestions") {
            updateQuestions(dataJSON);
        }

        if (dataJSON["type"] == "stopWithText") {
            stopWithText(dataJSON["text"],dataJSON["timeLength"]);
        }
        if (dataJSON["type"] == "scoreUpdate") {
            document.getElementById("team_score_0").innerHTML = dataJSON["teamScores"][0];
            document.getElementById("team_score_1").innerHTML = dataJSON["teamScores"][1];
        }
        return false;
    };  
});

function getUpdateQuestions() {
    websocket.send(JSON.stringify({"type":"getQuestions", 
    "time":Date.now(),
    "userID":userID,
    "userName":userName,}));
}

function updateQuestions(data) {
    dataJSON = data;
    currentQuestion = dataJSON["questionID"];
    document.getElementById("Question_Text").innerHTML = dataJSON["question"];
    for (i = 0; i < (dataJSON["answers"].length); i++) {
        document.getElementById("Answer_Button_" + i).innerHTML = dataJSON["answers"][i];
        document.getElementById("Answer_Button_" + i).hidden = false;
    }
    for (i = (dataJSON["answers"].length); i < 4; i++) {
        document.getElementById("Answer_Button_" + i).hidden = true;
    }
}

function quizButtonClick(buttonID) {
    console.log("Button " + buttonID + " was pressed")
    outData = {"type":"buttonPress",
    "buttonID":buttonID,
    "time":Date.now(),
    "userID":userID,
    "userName":userName,
    "teamID":userTeamID,
    "currentQuestion":currentQuestion};
    websocket.send(JSON.stringify(outData));
}

function stopWithText(text,time) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("overlay_Text").innerHTML = text;
    setTimeout(() => {
        document.getElementById("overlay").style.display = "none";
    },time);
}

function hide_setTeam_overlay(newTeamID) {
    userTeamID = newTeamID;
    userName = document.getElementById("userName").value;
    document.getElementById("Team_selection_over").style.display = "none";
    websocket.send(JSON.stringify({
    "type":"setTeam",
    "userID":userID,
    "teamID":userTeamID,
    "userName":userName, 
    "time":Date.now()}));
}
