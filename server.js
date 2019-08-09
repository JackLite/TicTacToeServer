const io = require('socket.io')(process.env.PORT || 3000);
const uuid = require("uuid/v1");

console.log("server start");

let freePlayers = {};
let players = {};

io.on("connection", (socket) => {

    console.log("client connected");

    let playerId = uuid();

    players[playerId] = {
        id: playerId,
        "socket": socket, 
        name: ""
    };

    socket.emit("successful connected", { id: playerId });

    socket.on("player settings", (data) => {
        players[playerId].name = data.nickname;
    });

    socket.on("player settings", (data) => {
        players[playerId].name = data.nickname;

        if (Object.keys(freePlayers).length < 1) {
            freePlayers[playerId] = players[playerId];
            socket.emit("waiting");
        } else {
            console.log("ready client: ", playerId);
    
            const enemyId = Object.keys(freePlayers)[0];
            socket.emit("enemy find", { id: enemyId, nickname: players[enemyId].name });
            players[enemyId].socket.emit("enemy find", { id: playerId, nickname: players[playerId].name });
    
            const firstPlayerId = Math.round(Math.random()) == 1 ? enemyId : playerId;
            socket.emit("first player", { id: firstPlayerId });
            players[enemyId].socket.emit("first player", { id: firstPlayerId });
    
            delete freePlayers[enemyId];
        }
    });

    socket.on("player step", (data) => {
        const enemySocket = players[data.enemyId].socket;
        enemySocket.emit("enemy step", { position: data.position });
        console.log(data);
    });

    socket.on("end game", (data) => {
        console.log("end game. winnerId: ", data.winnerId, " winner name: ", data.winnerName);
        delete players[playerId];
        delete freePlayers[playerId];
    });

    socket.on("disconnect", () => {
        console.log("disconnect", playerId);
        delete players[playerId];
        delete freePlayers[playerId];
    });
});

