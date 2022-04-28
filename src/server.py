import websockets
import asyncio
import json
import random
import time
import os

currentUserIDNumber = 0
allClients = []
allClientNames = {}
quizPath = "quizFiles\commas.json"
teamScores = [0,0]

#sets the working directory to the directory of the script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

#moves the working directory one level up
os.chdir("..")
#prints the current working directory
print(os.getcwd())

connected = {}

async def brodcastToAll(websockets, message):
    for client in websockets:
        asyncio.get_event_loop().create_task(client["ws"].send(message))


async def handler(websocket, path):
    global allClientNames
    global quizPath
    global teamScores
    while True:
        name = await websocket.recv()
        
        print(name)

        quizData = json.load(open(quizPath))
        data = json.loads(name)
        
        try:
            type = data["type"]
            
            if type == "initialConnection":
                global currentUserIDNumber
                currentUserIDNumber += 1
                allClients.append({"ws": websocket, "id": currentUserIDNumber})
                print(allClients)
                print(f"Client {currentUserIDNumber} connected")
                await websocket.send(json.dumps({"type": "initialConnection", "userID": currentUserIDNumber}))
            
            if type == "setTeam":
                print(f"Client {data['userName']} set team to {data['teamID']} at {data['time']}")
                if data['userName'] in allClientNames.keys():
                    allClientNames[data['userName']] = data['team']
                else:
                    allClientNames[data['userID']] = {"name":data['userName'],"team":data['team'],"timeCreated":data['time']}
            
            if type == "buttonPress":
                print(f"Button {data['buttonID']} was pressed at {data['time']} by {data['userName']}")
                questionIsCorrect = quizData[data["currentQuestion"]]["correctAnswerID"] == data["buttonID"]
                responseData = {
                    "type": "questionResponse",
                    "correct": questionIsCorrect,
                    "time": time.time()
                }
                await websocket.send(json.dumps(responseData))
                if questionIsCorrect:
                    global team1Score
                    teamScores[quizData['teamID']] += 1
                    print(f"Team {quizData['teamID']} scored a point")
                    await brodcastToAll(allClients, json.dumps({"type": "scoreUpdate", "teamScores": teamScores}))
                    
                
                
            if type == "getQuestions":
                print(f"Client {data['userName']} requested questions")
                newQuestionID = random.randint(0, len(quizData)-1)
                responseData = {
                    "type": "getQuestions",
                    "questionID": newQuestionID,
                    "question": quizData[newQuestionID]["question"],
                    "answers": quizData[newQuestionID]["answers"]
                }
                await websocket.send(json.dumps(responseData))

            if type == "stopAllUsersMessage":
                responseData = {
                    "type": "stopWithText",
                    "text": data["text"],
                    "time": time.time(),
                    "sourceUserID": data["userID"],
                    "timeLength": data["timeLength"]
                }
                responseData = json.dumps(responseData)
                await brodcastToAll(allClients, responseData)
            
            await websocket.send(json.dumps({"type":"Confirmation","confirmed":True}))
                
        except websockets.exceptions.ConnectionClosedError:
            print(f"Client {currentUserIDNumber} disconnected")
            allClients.remove({"ws": websocket, "id": currentUserIDNumber})
            print(allClients)
            break



async def main():
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
