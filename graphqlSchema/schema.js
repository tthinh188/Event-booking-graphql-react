const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const Event = require('../models/event.js')
const User = require('../models/user.js')

const EventType = new GraphQLObjectType({
    name: 'Event',
    description: 'This represents an event',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
        date: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLString) },
        user: {
            type: UserType,
            resolve: async (event) =>
                (await User.find({ _id: event.userId }))[0]
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        userName: { type: GraphQLNonNull(GraphQLString) },
        // password: { type: GraphQLNonNull(GraphQLString) },
        events: {
            type: EventType,
            description: 'Events book by user',
            resolve: async (user) =>
                (await Event.find({ userId: user._id }))[0]
        }
    })
});

const AuthType = new GraphQLObjectType({
    name: 'Response',
    description: "This represents a response to client",
    fields: () => ({
        status: { type: GraphQLNonNull(GraphQLInt) },
        token: { type: GraphQLNonNull(GraphQLString) },
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
            resolve: async () => await Event.find()
        },
        event: {
            type: EventType,
            description: 'Get event by Id',
            args: {
                id: { type: GraphQLString }
            },
            resolve: async (parent, args) => (await Event.find({ _id: args.id }))[0]
        },

        eventsByUser: {
            type: new GraphQLList(EventType),
            description: 'Get event by user id',
            args: {
                userId: { type: GraphQLString }
            },
            resolve: async (parent, args) => await Event.find({ userId: args.userId })
        },
        
        signIn: {
            type: AuthType,
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

                    const token = jwt.sign({ id: existingUser._id, name: existingUser.name }, process.env.SECRET_KEY, { expiresIn: "1h" });

                    return { status: 200, token: token }

                } catch (err) {
                    console.log(err)
                }
            }
        },
        users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            resolve: async () => {
                const res = await User.find();
                return res;
            }
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
                // userId: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args, req) => {
                if (!req.isAuth) {
                    throw new Error("Unauthenticated")
                }
                const event = new Event({
                    title: args.title,
                    date: new Date(),
                    price: args.price,
                    userId: req.user.id,
                });

                event.save();
                return event;
            }
        },
        signUp: {
            type: AuthType,
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
    })
})


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

module.exports = schema