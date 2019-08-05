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
        "socket": socket
    };

    socket.emit("successful connected", { id: playerId });

    if (Object.keys(freePlayers).length < 1) {
        freePlayers[playerId] = players[playerId];
        socket.emit("waiting");
    } else {
        console.log("ready client: ", playerId);
        const enemyId = Object.keys(freePlayers)[0];
        socket.emit("enemy find", { id: enemyId });
        players[enemyId].socket.emit("enemy find", { id: playerId });
        const firstPlayerId = Math.round(Math.random()) == 1 ? enemyId : playerId;
        socket.emit("first player", { id: firstPlayerId });
        players[enemyId].socket.emit("first player", { id: firstPlayerId });
        delete freePlayers[enemyId];
    }

    socket.on("player step", (data) => {
        const enemySocket = players[data.enemyId].socket;
        enemySocket.emit("enemy step", { position: data.position, state: data.state });
        console.log(data);
    });

    socket.on("disconnect", () => {
        console.log("disconnect", playerId);
        delete players[playerId];
        delete freePlayers[playerId];
    });
});

