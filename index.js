const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const schema = require('./graphqlSchema/schema.js');

dotenv.config();

const app = express();

const events = [
    { id: 1, title: "Concert", price: 99.99, date: new Date().toDateString(), userId: 1 },
    { id: 2, title: "Sailing", price: 49.99, date: new Date().toDateString(), userId: 2 },
    { id: 3, title: "Coding", price: 9.99, date: new Date().toDateString(), userId: 3 },
    { id: 4, title: "Dinner", price: 150.49, date: new Date().toDateString(), userId: 3 },
    { id: 5, title: "Movie night", price: 29.99, date: new Date().toDateString(), userId: 2 },
    { id: 6, title: "Picnic", price: 79.99, date: new Date().toDateString(), userId: 1 },
]

const users = [
    { id: 1, name: "Tim" },
    { id: 2, name: "John" },
    { id: 3, name: "Alex" },
]

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

mongoose.connect(
    `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.thgp8.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
).then(() => {
    app.listen(5000, () => {
        console.log("server running on port 3000")
    });
}).catch(err => {
    console.log(err)
})
