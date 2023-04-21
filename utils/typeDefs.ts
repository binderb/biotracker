import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Client {
    _id: ID
    name: String!
    code: String!
  }

  type Query {
    hello: String
    getClients: [Client]
  }

  type Mutation {
    addClient(name: String!): Client
  }
`;

export default typeDefs;