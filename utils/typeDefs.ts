import { gql } from 'graphql-tag';

const typeDefs = gql`
  
  type User {
    _id: ID
    username: String!
    first: String
    last: String
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

  type Lead {
    _id: ID
    name: String!
    author: User
    status: String!
    drafters: [User]
    client: Client
    revisions: [LeadRevision]
    notes: [LeadNote]
  }

  type LeadRevision {
    _id: ID
    author: User,
    createdAt: String
    content: String
  }

  type LeadNote {
    _id: ID
    author: User
    createdAt: String
    content: String!
    revision: LeadRevision
    leadChanges: [LeadChange]
    parentNote: LeadNote
  }

  type LeadChange {
    field: String!,
    before: String!,
    after: String!
  }

  type Query {
    getUsers: [User]
    getClients: [Client]
    getClientCodes: [Client]
    getNextStudy(clientCode: String!): Int
    getLeads: [Lead]
    getLeadLatestRevision(id: ID!): Lead
  }

  type Mutation {
    addUser(username: String!, password: String!, first: String!, last: String!, role: String!): User
    addClient(name: String!): Client
    addLead(name: String!, author: ID!, drafters: [ID]!, client: ID!, content: String!, firstNote: String!): String
    addLeadRevision(id: ID!, author: ID!, status: String!, content: String!, note: String!): String
    addLeadNote(id: ID!, revisionId: ID!, author: ID!, note: String!): String
    addStudy(clientCode: String!, studyIndex: Int!, studyType: String!): Client
    authorizeGoogleDrive: String
    testGoogleDrive: String
    createDriveStudyTree(clientCode: String!, studyName: String!): String
  }
`;

export default typeDefs;