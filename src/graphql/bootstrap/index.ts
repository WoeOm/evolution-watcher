import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { DBClient } from 'src/tracing/db/client';
import Land from '../dataSources/Land';

async function startApolloServer(mongodbURI, typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);

  const dbClient = new DBClient(mongodbURI);
  await dbClient.connect();

  const db = dbClient.getClient().db('evo');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    dataSources: () => ({
      land: new Land(db.collection('land')),
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type ERC721 {
    owner: String!
    token_id: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Collection {
    land: [ERC721]
  }

  type Query {
    land(owner: String, token_id: String): [ERC721]
    apostle(owner: String, token_id: String): [ERC721]
    drill(owner: String, token_id: String): [ERC721]
    other(owner: String, token_id: String): [ERC721]
    equipment(owner: String, token_id: String): [ERC721]
    mirrorkitty(owner: String, token_id: String): [ERC721]
  }
`;

// const lands = [
//   {
//     owner: '0x12344',
//     tokenId: '0x12344',
//   },
// ];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    land(parent, args, { dataSources: { land } }, info) {
      return land.getLands(args);
    },
  },
};

export const apolloServer = async (mongodbURI) => {
  await startApolloServer(mongodbURI, typeDefs, resolvers);
};
