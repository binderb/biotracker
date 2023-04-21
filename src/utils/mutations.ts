import gql from "graphql-tag";

export const ADD_CLIENT = gql`
  mutation addClient($name: String!) {
    addClient(name: $name) {
      name
    }
  }
`;