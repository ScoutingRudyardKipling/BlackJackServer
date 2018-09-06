"use strict";

var IOController = class IOController {
    constructor(io) {
        this.io = io;

        io.on('connection', this.newConnection);
    }

    newConnection(socket) {
        socket.emit('Welkom op de BlackJack 2018 websocket verbinding. Je bent geabonneerd op de highscores.');
        socket.join('highscores');

        socket.on('group', function (id) {
            socket.join('group-' + id);
            socket.emit('Echt waar joh? Gij bent er weer eentje van groep ' + id + ' zeker.. pff... Nou, hier! Ook alle berichten aan groep ' + id + ' voor jou!');
        });
    }

    broadcast(channel, data) {
        this.io.to(channel).emit(channel, data);
    }

    sendToGroup(id, event, data) {
        this.io.to('group-' + id).emit(event, data);
    }
};

module.exports = IOController;
