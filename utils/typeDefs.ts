import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Client {
    _id: ID
    name: String!
    code: String!
    studies: [Study]
  }

  type Study {
    _id: ID
    type: String!
    index: Int!
  }

  type Query {
    hello: String
    getClients: [Client]
    getClientCodes: [Client]
    getNextStudy(clientCode: String!): Int
  }

  type Mutation {
    addClient(name: String!): Client
    addStudy(clientCode: String!, studyIndex: Int!, studyType: String!): Study
  }
`;

export default typeDefs;