import gql from "graphql-tag";

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      username
      role
    }
  }
`;

export const GET_CLIENTS = gql`
  query GetClients {
    getClients {
      _id
      name
      code
    }
  }
`;

export const GET_CLIENT_CODES = gql`
  query GetClientCodes {
    getClientCodes {
      code
    }
  }
`;

export const GET_NEXT_STUDY = gql`
  query GetNextStudy($clientCode: String!) {
    getNextStudy(clientCode: $clientCode)
  }
`;