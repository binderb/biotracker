import gql from "graphql-tag";

export const HELLO = gql`
  query Hello {
    hello
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
    getClients {
      code
    }
  }
`;