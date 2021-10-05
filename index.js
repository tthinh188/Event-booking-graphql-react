const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const schema = require('./graphqlSchema/schema.js');

dotenv.config();

const app = express();

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
