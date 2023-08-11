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
    type: String
    index: Int
    leadId: ID!
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
    published: Boolean
    studies: [Study]
  }

  type LeadRevision {
    _id: ID
    author: User,
    createdAt: String
    content: String
    published: Boolean
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

  type FormTemplate {
    _id: ID,
    name: String!
    formCategory: String!
    formIndex: Int
    revisions: [FormTemplateRevision]!
    metadata: String,
  }

  type FormTemplateRevision {
    _id: ID,
    createdAt: String!,
    sections: [FormTemplateSection]!,
  }

  type FormTemplateSection {
    _id: ID
    name: String!
    index: Int!
    rows: [FormTemplateRow]!
    extensible: Boolean!
    groupedWithPrevious: Boolean
  }

  type FormTemplateRow {
    _id: ID,
    index: Int!
    fields: [FormTemplateField]!
    extensible: Boolean!
  }

  type FormTemplateField {
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
    getNextForm(category: String!): Int
    getLeads: [Lead]
    getLeadLatestRevision(id: ID!): Lead
    getStudyPlanForms: [FormTemplate]
    getStudyPlanFormLatestRevision(id: ID!): FormTemplate
    getFormDetailsFromRevisionId(revisionId: ID!): FormTemplate
    getGoogleDriveConfig: GoogleDriveConfig
  }

  type Mutation {
    addUser(username: String!, password: String!, first: String!, last: String!, role: String!): User
    updateUser(updateUserId: ID!, username: String!, password: String!, first: String!, last: String!, role: String!): User
    removeUser(removeUserId: ID!): String
    addClient(name: String!, code: String!): Client
    addLead(name: String!, author: ID!, drafters: [ID]!, client: ID!, content: String!, firstNote: String!): String
    updateLeadDrafters(leadId: ID!, drafters: [ID]!): String
    addLeadRevision(id: ID!, author: ID!, status: String!, content: String!, note: String!): String
    addLeadNote(id: ID!, revisionId: ID!, author: ID!, note: String!): String
    addForm(name: String!, formCategory: String!, metadata: String, sections: String!): String
    addStudy(clientCode: String!, studyType: String!, leadId: ID!, studyPlanIndex: Int!): String
    authorizeGoogleDrive: String
    saveGoogleDriveToken(authCode: String): String
    testGoogleDrive(drive: String!, path: String!): String
    saveGoogleDriveConfig(accountEmail: String, studiesDriveId: String, studiesDriveName: String, studiesPath: String): String
    deleteGoogleDriveConfig: String
    createDriveStudyTree(clientCode: String!, studyName: String!): String
    publishLeadToDrive(clientCode: String!, studyName: String!, formRevisionId: String!, formData: String!, studyData: String!): String
    updateLeadOnDrive(clientCode: String!, studyName: String!, formRevisionId: String!, formData: String!, studyData: String!): String
    updateLeadRevisionPublishStatus(leadRevisionId: ID!): String
  }
`;

export default typeDefs;