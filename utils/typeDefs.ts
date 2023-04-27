import { gql } from 'graphql-tag';

const typeDefs = gql`
  
  type User {
    _id: ID
    username: String!
    password: String
    role: String
    createdAt: String
  }

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
    getUsers: [User]
    getClients: [Client]
    getClientCodes: [Client]
    getNextStudy(clientCode: String!): Int
  }

  type Mutation {
    addUser(username: String!, password: String!): User
    addClient(name: String!): Client
    addStudy(clientCode: String!, studyIndex: Int!, studyType: String!): Client
    authorizeGoogleDrive: String
    testGoogleDrive: String
    createDriveStudyTree(clientCode: String!, studyName: String!): String
  }
`;

export default typeDefs;