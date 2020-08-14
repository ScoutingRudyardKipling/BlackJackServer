let FCM = require("fcm-node");

class fcm {

    constructor() {
        this.service = process.env.FIREBASE_ENABLED === "false" ? null : new FCM({
            private_key: process.env.FIREBASE_PRIVATE_KEY,
            client_email: process.env.FIREBASE_CLIENT_EMAIL
        });
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
        if (this.service === null) {
            console.log('New FCM message', {
                event: event,
                data: data
            });

            return;
        }

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
