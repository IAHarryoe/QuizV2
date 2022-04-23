from numpy import number
import websockets
import asyncio
import json

currentClientNumber = 0

async def basicResponse(websocket, path):
    name = await websocket.recv()
    try:
        data = json.loads(name)
        print(data)
        type = data["type"]
        
        if type == "buttonPress":
            print(f"Button {data['buttonID']} was pressed at {data['time']}")
        if type== "initialConnection":
            global currentClientNumber
            currentClientNumber += 1
            print(f"Client {currentClientNumber} connected")
            await websocket.send(json.dumps({"type": "initialConnection", "clientNumber": currentClientNumber}))
        
        await websocket.send(json.dumps({"type":"Confirmation","confirmed":True}))
        
    except:
        pass
    

start_server = websockets.serve(basicResponse, "localhost", 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
