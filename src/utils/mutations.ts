import gql from "graphql-tag";

export const ADD_CLIENT = gql`
  mutation addClient($name: String!) {
    addClient(name: $name) {
      name
    }
  }
`;

export const ADD_STUDY = gql`
  mutation addStudy($clientCode: String!, $studyIndex: Int!, $studyType: String!) {
    addStudy(clientCode: $clientCode, studyIndex: $studyIndex, studyType: $studyType) {
      code
    }
  }
`;