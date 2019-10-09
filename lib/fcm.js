let FCM = require("fcm-node");
let serviceAccount = require("../config/jota2019rudyardkipling-firebase-adminsdk-uhnx5-5df5347d22.json");

class fcm {

    constructor() {
        this.service = new FCM(serviceAccount);
    }

    sendNewProduct(product, group) {
        this._send('new-product', {
            _id: product._id.toString(),
            name: product.name,
            description: product.description,
            image: product.image,
            costs: product.costs.toString(),
            reward: product.reward.toString(),
            code: product.code,
            rewarded: "false"
        }, group);
    }


    sendUpdateProduct(product, group) {
        this._send('update-product', {
            _id: product._id.toString(),
            name: product.name,
            description: product.description,
            image: product.image,
            costs: product.costs.toString(),
            reward: product.reward.toString(),
            code: product.code,
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

        this.service.send(message, function (err, response) {
            if (err) {
                console.log(err);
                console.log("Something has gone wrong!")
            }
        });
    }
}

module.exports = new fcm();