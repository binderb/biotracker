import { gql } from 'graphql-tag';

const typeDefsInventory = gql`

  type User {
    _id: ID
    username: String!
    first: String
    last: String
    password: String
    role: String
    createdAt: String
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
    currentAmount: Float!,
    spec: InventorySpec!,
    location: InventoryLocation!
    logs: [InventoryLogEntry]
  }

  type InventoryLogEntry {
    _id: ID,
    createdAt: String!,
    author: User,
    body: String!
  }
  
  type InventoryLocation {
    _id: ID,
    name: String!,
    description: String,
    type: String!,
    children: [InventoryLocation]
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
    vendor: InventoryVendor,
    logs: [InventoryLogEntry]
  }

  type InventoryVendor {
    _id: ID,
    name: String!
  }

  type Query {
    getInventory: [InventorySpec]
    getVendors: [InventoryVendor]
    getLocations: [InventoryLocation]
  }

  type Mutation {
    addVendor(name: String!):String
    addLocation(name: String!, type: String!, parent: String!):String
  }

`;

export default typeDefsInventory;