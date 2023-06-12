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
    _id: ID,
    name: String!,
    index: Int!,
    fields: [LeadTemplateField]!,
    extensible: Boolean!,
    enstensibleGroupName: String
  }

  type LeadTemplateField {
    _id: ID,
    name: String!,
    index: Int!,
    type: String!,
    data: String,
    extensible: Boolean!,
  }

  type InventoryCategory {
    _id: ID,
    name: String!
  }

  type InventoryItem {
    _id: ID,
    lot: String!,
    status: String!,
    boxgridX: String,
    boxgridY: String,
    received: String,
    currentAmount: Number!,
    spec: InventorySpec!,
    location: InventoryLocation!
  }

  type InventoryItemLog {
    _id: ID,
    createdAt: String!,
    item: InventoryItem,
    author: User,
    body: String!
  }
  
  type InventoryLocation {
    _id: ID,
    name: String!,
    description: String,
    type: String!,
    parent: InventoryLocation
  }

  type InventorySpec {
    _id: ID,
    pn: String!,
    name: String!,
    shortName: String,
    description: String,
    status: String!,
    link: String,
    shelfLife: Int,
    amount: Float!,
    units: String!,
    threshold: Float!,
    category: InventoryCategory,
    vendor:
  }

  type InventorySpecLog {
    _id: ID,
    createdAt: String!,
    spec: InventorySpec!,
    author: User!,
    body: String!
  }

  type InventoryVendor {
    _id: ID,
    name: String!
  }

  type Query {
    getUsers: [User]
    getClients: [Client]
    getClientCodes: [Client]
    getNextStudy(clientCode: String!): Int
    getLeads: [Lead]
    getLeadLatestRevision(id: ID!): Lead
    getLeadTemplates: [LeadTemplate]
    getLeadTemplateLatestRevision(id: ID!): LeadTemplate
  }

  type Mutation {
    addUser(username: String!, password: String!, first: String!, last: String!, role: String!): User
    addClient(name: String!): Client
    addLead(name: String!, author: ID!, drafters: [ID]!, client: ID!, content: String!, firstNote: String!): String
    addLeadRevision(id: ID!, author: ID!, status: String!, content: String!, note: String!): String
    addLeadNote(id: ID!, revisionId: ID!, author: ID!, note: String!): String
    addLeadTemplate(name: String!, sections: String!): String
    addStudy(clientCode: String!, studyIndex: Int!, studyType: String!): Client
    authorizeGoogleDrive: String
    testGoogleDrive: String
    createDriveStudyTree(clientCode: String!, studyName: String!): String
  }
`;

export default typeDefs;