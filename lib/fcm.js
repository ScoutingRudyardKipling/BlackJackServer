let admin = require("firebase-admin");

class fcm {

    constructor() {
        this.messaging = process.env.FIREBASE_ENABLED === "false" ? null : admin.initializeApp({
            databaseURL: process.env.FIREBASE_DATABASE,
            credential: admin.credential.cert({
                private_key: process.env.FIREBASE_PRIVATE_KEY,
                projectId: process.env.FIREBASE_PROJECT_ID,
                client_email: process.env.FIREBASE_CLIENT_EMAIL
            })
        }).messaging();
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
            data: data,
            tokens: group.FCMTokens
        };

        this.messaging.sendMulticast(message)
            .catch(function (reason) {
                console.log(reason);
                console.log("Something has gone wrong!");
            });
    }
}

module.exports = new fcm();
