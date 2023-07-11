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
    template: LeadTemplate
    status: String!
    drafters: [User]
    client: Client
    revisions: [LeadRevision]
    notes: [LeadNote]
  }

  type LeadRevision {
    _id: ID
    author: User,
    templateRevision: LeadTemplateRevision
    createdAt: String
    content: String
  }

  type LeadNote {
    _id: ID
    author: User
    createdAt: String
    content: String!
    revision: LeadRevision
    newRevision: Boolean!
    leadChanges: [LeadChange]
    parentNote: LeadNote
  }

  type LeadChange {
    field: String!,
    before: String!,
    after: String!
  }

  type LeadTemplate {
    _id: ID,
    name: String!,
    revisions: [LeadTemplateRevision]!
    active: Boolean!,
  }

  type LeadTemplateRevision {
    _id: ID,
    createdAt: String!,
    sections: [LeadTemplateSection]!,
  }

  type LeadTemplateSection {
    _id: ID
    name: String!
    index: Int!
    rows: [LeadTemplateSectionRow]!
    extensible: Boolean!
    groupedWithPrevious: Boolean
  }

  type LeadTemplateSectionRow {
    _id: ID,
    index: Int!
    fields: [LeadTemplateField]!
    extensible: Boolean!
  }

  type LeadTemplateField {
    _id: ID,
    index: Int!
    type: String!
    params: [String]
    data: [String]
  }

  type GoogleDriveConfig {
    _id: ID
    accountEmail: String
    studiesDriveId: String
    studiesDriveName: String
    studiesPath: String
  }

  type Query {
    getUsers: [User]
    getClients: [Client]
    getClientCodes: [Client]
    getNewCode: String
    getNextStudy(clientCode: String!): Int
    getLeads: [Lead]
    getLeadLatestRevision(id: ID!): Lead
    getLeadTemplates: [LeadTemplate]
    getLeadTemplateLatestRevision(id: ID!): LeadTemplate
    getGoogleDriveConfig: GoogleDriveConfig
  }

  type Mutation {
    addUser(username: String!, password: String!, first: String!, last: String!, role: String!): User
    updateUser(updateUserId: ID!, username: String!, password: String!, first: String!, last: String!, role: String!): User
    removeUser(removeUserId: ID!): String
    addClient(name: String!, code: String!): Client
    addLead(name: String!, author: ID!, drafters: [ID]!, client: ID!, content: String!, firstNote: String!): String
    addLeadRevision(id: ID!, author: ID!, status: String!, content: String!, note: String!): String
    addLeadNote(id: ID!, revisionId: ID!, author: ID!, note: String!): String
    addLeadTemplate(name: String!, sections: String!): String
    addStudy(clientCode: String!, studyIndex: Int!, studyType: String!): Client
    authorizeGoogleDrive: String
    saveGoogleDriveToken(authCode: String): String
    testGoogleDrive(drive: String!, path: String!): String
    saveGoogleDriveConfig(accountEmail: String, studiesDriveId: String, studiesDriveName: String, studiesPath: String): String
    deleteGoogleDriveConfig: String
    createDriveStudyTree(clientCode: String!, studyName: String!): String
    createDriveStudy(clientCode: String!, studyName: String!, studyData: String!): String
  }
`;

export default typeDefs;