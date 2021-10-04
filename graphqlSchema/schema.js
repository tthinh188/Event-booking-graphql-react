const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLNonNull,
} = require('graphql');

const EventType = new GraphQLObjectType({
    name: 'Event',
    description: 'This represents an event',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
        date: { type: GraphQLNonNull(GraphQLString) },
        userId: { type: GraphQLNonNull(GraphQLInt) },
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
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        events: {
            type: EventType,
            description: 'Events book by user',
            resolve: (user) => {
                return events.find(event => event.userId === user.id)
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        events: {
            type: new GraphQLList(EventType),
            description: 'List of events',
            resolve: () => events,
        },
        event: {
            type: EventType,
            description: 'Get event by Id',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => events.find(event => event.id === args.id)
        },
        eventsByUser: {
            type: new GraphQLList(EventType),
            description: 'Get event by user id',
            args: {
                userId: { type: GraphQLInt }
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
                userId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const event = {
                    id: events.length + 1,
                    title: args.title,
                    date: new Date(),
                    userId: args.userId,
                }
                events.push(event);
                return event;
            }
        },
    })
})


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

module.exports = schema