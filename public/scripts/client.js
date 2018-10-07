var BlackJack = function () {
    // set defaults
    this._socket = null;
    this._connected = false;
    this.serie = null;
    this.listener = function () {
    };

};
BlackJack.prototype = {
    /**
     * Set the on update listener
     * @param onUpdate
     */
    onUpdate: function (onUpdate) {
        this.listener = onUpdate;
    },
    /**
     * Open the socket connection
     */
    open: function (groupId) {
        this._openConnection();
        this._fixRoom();
        this.groupId = groupId;
    },
    /**
     * Close the socket connection
     */
    close: function () {
        this._closeConnection();
        this.groupId = -1;
    },
    /**
     * Open the socket connection if not opened or opening yet
     * @private
     */
    _openConnection: function () {
        if (this._socket !== null) {
            // already connected or still trying to connect
            return;
        }

        // open connection
        this._socket = io('wss://blackjack.engency.com:3000');
        this._socket.on('connect', this._onConnect.bind(this));

        // bind listeners
        this._socket.on('disconnect', this._onDisconnect.bind(this));
        this._socket.on('info', function (data) {
            console.log('info', data);
        });
        this._socket.on('highscores', this._fireUpdatedEvent.bind(this));
    },
    /**
     * Close the socket connection
     * @private
     */
    _closeConnection: function () {
        if (this._socket == null) {
            return;
        }
        this._socket.disconnect();
        this._socket = null;
        this._connected = false;
    },
    /**
     * Make sure that the client is in the correct room (if connected)
     * @private
     */
    _fixRoom: function () {
        if (!this._connected) {
            return;
        }
        console.log('Connecting to group ' + this.groupId);
        this._socket.emit('group', this.groupId);
    },

    /**
     * Socket event listeners
     */
    _onConnect: function () {
        this._connected = true;
        if (this.groupId >= 0) {
            this._fixRoom();
        }
    },
    _onDisconnect: function () {
        this._connected = false;
    },
    _fireUpdatedEvent: function (data) {
        console.log('received updated highscores', data);
        this.listener(data);
    }
};
window.BlackJack = new BlackJack();
window.BlackJack.open(0);

