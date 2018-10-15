let FCM = require("fcm-node");
let serviceAccount = require("../config/blackjack18client-firebase-adminsdk-t0ric-e8eab5d2cb.json");

class fcm {

    constructor() {
        this.service = new FCM(serviceAccount);
    }

    sendNewProduct(product, group) {
        this._send('new-product', {
            _id: product._id.toString(),
            name: product.name,
            image: product.image,
            costs: product.costs.toString(),
            reward: product.reward.toString(),
            code: product.code,
            bought: "false",
            rewarded: "false"
        }, group);
    }


    sendUpdateProduct(product, group) {
        this._send('update-product', {
            _id: product._id.toString(),
            name: product.name,
            image: product.image,
            costs: product.costs.toString(),
            reward: product.reward.toString(),
            code: product.code,
            bought: product.bought.toString(),
            rewarded: product.rewarded.toString()
        }, group);
    }

    sendUpdateGroupProperty(property, value, group) {
        this._send('update-property', {
            property: property,
            value: value.toString()
        }, group);
    }

    /**
     *
     * @param event
     * @param data
     * @param group
     */
    _send(event, data, group) {
        if (group.FCMTokens.length === 0) {
            return;
        }

        data.event = event;

        let message = {
            registration_ids: group.FCMTokens,
            data: data
        };

        console.log("fcm", data);

        this.service.send(message, function (err, response) {
            if (err) {
                console.log(err);
                console.log("Something has gone wrong!")
            } else {
                console.log("Successfully sent with response: ", response)
            }
        });
    }
}

module.exports = new fcm();