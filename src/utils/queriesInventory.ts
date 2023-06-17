import gql from "graphql-tag";

export const GET_INVENTORY = gql`
  query getInventory {
    getInventory {
      name
    }
  }
`;