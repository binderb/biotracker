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

  type Contact {
    _id: ID
    first: String
    last: String
    referredBy: Contact
    email: String
    phone: String
    links: String
    notes: String
  }

  type MailingAddress {
    _id: ID
    identifier: String
    entityName: String
    addressLine1: String
    addressLine2: String
    city: String
    stateProvince: String
    country: String
    postalCode: String
  }

  type ClientProject {
    _id: ID
    client: Client
    name: String!
    contacts: [Contact]
    keyContacts: [Boolean]
    billingAddress: MailingAddress
    nda: Boolean
  }

  type Client {
    _id: ID
    name: String!
    code: String!
    referredBy: Contact
    nda: Boolean
    website: String
    billingAddresses: [MailingAddress]
    projects: [ClientProject]
    accountType: String
  }

  type Study {
    _id: ID
    client: Client
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
    metadata: String
  }

  type FormTemplateRevision {
    _id: ID,
    createdAt: String!
    note: String!
    sections: [FormTemplateSection]!
  }

  type FormTemplateSection {
    _id: ID
    name: String!
    index: Int!
    rows: [FormTemplateRow]!
    extensible: Boolean!
    extensibleReference: Int
    groupedWithPrevious: Boolean
  }

  type FormTemplateRow {
    _id: ID,
    index: Int!
    fields: [FormTemplateField]!
    extensible: Boolean!
    extensibleReference: Int
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
    getContacts: [Contact]
    getClientCodes: [Client]
    getClient(clientId:ID!): Client
    getNewCode: String
    getNextStudy(clientCode: String!): Int
    getNextForm(category: String!): Int
    getLeads: [Lead]
    getLeadLatestRevision(id: ID!): Lead
    getStudyPlanForms: [FormTemplate]
    getStudyPlanFormLatestRevision(id: ID!): FormTemplate
    getFormDetails(formId: ID!): FormTemplate
    getFormDetailsFromRevisionId(revisionId: ID!): FormTemplate
    getGoogleDriveConfig: GoogleDriveConfig
  }

  type Mutation {
    addUser(username: String!, password: String!, first: String!, last: String!, role: String!): User
    updateUser(updateUserId: ID!, username: String!, password: String!, first: String!, last: String!, role: String!): User
    removeUser(removeUserId: ID!): String
    addClient(name: String!, code: String!): Client
    updateClient(clientId: ID!, clientJSON: String!): String
    addContact(contactJSON: String!): Contact
    updateContact(contactId: ID!, contactJSON: String!): Contact
    addMailingAddress(mailingAddressJSON: String!): MailingAddress
    updateMailingAddress(mailingAddressId: ID!, mailingAddressJSON: String!): MailingAddress
    addLead(name: String!, author: ID!, drafters: [ID]!, client: ID!, content: String!, firstNote: String!): String
    updateLeadDrafters(leadId: ID!, drafters: [ID]!): String
    updateLeadName(leadId: ID!, name: String!): String
    addLeadRevision(id: ID!, author: ID!, status: String!, content: String!, note: String!): LeadRevision
    addLeadNote(id: ID!, revisionId: ID!, author: ID!, note: String!): String
    addForm(name: String!, formCategory: String!, metadata: String, sections: String!): String
    addFormRevision(formId: ID!, sections: String!, note: String!): String
    updateFormDetails(formId: ID!, name: String, formCategory: String, metadata: String): String
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
    adminDeleteLead(leadId: ID!): String
  }
`;

export default typeDefs;