import gql from "graphql-tag";

export const ADD_USER = gql`
  mutation addUser($username: String!, $password: String!) {
    addUser(username: $username, password: $password) {
      username
    }
  }
`;

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

export const CREATE_DRIVE_STUDY_TREE = gql`
  mutation createDriveStudyTree($clientCode: String!, $studyName: String!) {
    createDriveStudyTree(clientCode: $clientCode, studyName: $studyName)
  }
`;

export const AUTHORIZE_GOOGLE_DRIVE = gql`
  mutation authorizeGoogleDrive {
    authorizeGoogleDrive
  }
`;

export const TEST_GOOGLE_DRIVE = gql`
  mutation testGoogleDrive {
    testGoogleDrive
  }
`;