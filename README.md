# BlackJack Eindhoven Server

Feel free to use or contribute to this repository. If you've got any questions, please [contact me](mailto:frank@rudyardkipling.nl).

Download the BlackJack Eindhoven app from the Google Play store;
<p align="center"><a href="https://play.google.com/store/apps/details?id=com.engency.blackjack"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="150px"></a></p>

## Status

Server [Repo](https://github.com/ScoutingRudyardKipling/BlackJack2018)
[![CircleCI](https://circleci.com/gh/ScoutingRudyardKipling/BlackJack2018/tree/master.svg?style=shield&circle-token=3a2d09cb6aade9626d38414ef910b775c5cf5e06)](https://app.circleci.com/pipelines/github/ScoutingRudyardKipling/BlackJack2018)
![Heroku](https://heroku-badge.herokuapp.com/?app=blackjackeindhoven)

Client/app [Repo](https://github.com/ScoutingRudyardKipling/BlackJack2018_client)

## Contributing

### Requirements

- Node 10+
- NPM
- Git
- Running MongoDB instance

### Project setup

Clone the repo and install the dependencies.

```
git clone https://github.com/ScoutingRudyardKipling/BlackJack2018.git blackjack
cd blackjack
npm install
```

Create your own environment configuration. Make sure to fill in the access credentials to your MongoDB instance.
```
cp .env.example .env
```

### Enable Firebase

Please make sure you have an active Firebase project, please visit https://console.firebase.google.com to create one yourself.

In order to enable Firebase, store your firebase private_key and client_email in the .env file in the root of your project. Set the 'FIREBASE_ENABLED' env variable to 'true'.


## Contributors

- Frank Kuipers ([GitHub](https://github.com/frankkuipers))

## License

The BlackJack Eindhoven server is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
