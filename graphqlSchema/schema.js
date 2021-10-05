const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql');
const uuid = require('uuid').v4;
const bcrypt = require('bcryptjs');

const Event = require('../models/event.js')
const User = require('../models/user.js')

const userId1 = uuid();
const userId2 = uuid();
const userId3 = uuid();


const events = [
    { id: uuid(), title: "Concert", price: 99.99, date: new Date().toDateString(), userId: userId1 },
    { id: uuid(), title: "Sailing", price: 49.99, date: new Date().toDateString(), userId: userId2 },
    { id: uuid(), title: "Coding", price: 9.99, date: new Date().toDateString(), userId: userId3 },
    { id: uuid(), title: "Dinner", price: 150.49, date: new Date().toDateString(), userId: userId3 },
    { id: uuid(), title: "Movie night", price: 29.99, date: new Date().toDateString(), userId: userId2 },
    { id: uuid(), title: "Picnic", price: 79.99, date: new Date().toDateString(), userId: userId1 },
]

const users = [
    { id: userId1, name: "Tim" },
    { id: userId2, name: "John" },
    { id: userId3, name: "Alex" },
]


const EventType = new GraphQLObjectType({
    name: 'Event',
    description: 'This represents an event',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
        date: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLString) },
        user: {
            type: UserType,
            resolve: (event) => {
                return users.find(user => user.id === event.userId)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        userName: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        events: {
            type: EventType,
            description: 'Events book by user',
            resolve: (user) => {
                return events.find(event => event.userId === user.id)
            }
        }
    })
});

const ResponseType = new GraphQLObjectType({
    name: 'Response',
    description: "This represents a response to client",
    fields: () => ({
        status: { type: GraphQLNonNull(GraphQLInt) },
        // data: GraphQLObjectType,
        message: { type: GraphQLNonNull(GraphQLString) },
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        events: {
            type: new GraphQLList(EventType),
            description: 'List of events',
            resolve: () => {
                console.log('go')
                return events
            },
        },
        event: {
            type: EventType,
            description: 'Get event by Id',
            args: {
                id: { type: GraphQLString }
            },
            resolve: (parent, args) => events.find(event => event.id === args.id)
        },
        eventsByUser: {
            type: new GraphQLList(EventType),
            description: 'Get event by user id',
            args: {
                userId: { type: GraphQLString }
            },
            resolve: (parent, args) => events.filter(event => event.userId === args.userId)
        },
        users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            resolve: () => users,
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        createEvent: {
            type: EventType,
            description: 'Add an event',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                price: { type: GraphQLNonNull(GraphQLFloat) },
                userId: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                // const event = {
                //     id: uuid(),
                //     title: args.title,
                //     date: new Date(),
                //     userId: args.userId,
                // }
                const event = new Event({
                    title: args.title,
                    date: new Date(),
                    userId: args.userId,
                });
                // events.push(event);
                event.save();
                return event;
            }
        },
        signUp: {
            type: ResponseType,
            description: 'Register a user',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                userName: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args) => {
                try {
                    const existingUser = await User.findOne({ userName: args.userName });

                    if (existingUser)
                        throw new Error("User already existed.");

                    const hashedPassword = await bcrypt.hash(args.password, 12);

                    const result = await User.create({
                        name: args.name,
                        userName: args.userName,
                        password: hashedPassword
                    })
                    return { status: 200 }

                } catch (err) {
                    return { status: 404, message: err.message }
                }
            }
        },

        signIn: {
            type: ResponseType,
            description: 'user login',
            args: {
                userName: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args) => {
                try {
                    const existingUser = await User.findOne({ userName: args.userName });

                    if (!existingUser)
                        throw new Error("User not found.");

                    const isPasswordCorrect = await bcrypt.compare(args.password, existingUser.password);

                    if (!isPasswordCorrect)
                        throw new Error("Invalid credential");

                    const result = await User.create({
                        name: args.name,
                        userName: args.userName,
                        password: hashedPassword
                    })
                    return result

                } catch (err) {
                    console.log(err)
                }
            }
        }
    })
})


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

module.exports = schema