module.exports = {
    production: false,
    encryption: 'none',
    mongodb: {
        host: 'localhost:27017',
        name: 'black18jack',
        password: 'jijmijnwachtwoordstelenswa?',
        database: 'blackjack'
    }
};


// db.createUser(
//     {
//         user: "rootuser",
//         pwd: "zW3nGe1P4Ssw0rD",
//         roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
//     }
// )


//
// db.createUser(
//     {
//         user: "black18jack",
//         pwd: "jijmijnwachtwoordstelen?",
//         roles: [ { role: "readWrite", db: "blackjack" } ]
//     }