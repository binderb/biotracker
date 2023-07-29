import gql from "graphql-tag";

export const ADD_USER = gql`
  mutation addUser($username: String!, $password: String!, $first: String!, $last: String!, $role: String!) {
    addUser(username: $username, password: $password, first: $first, last: $last, role: $role) {
      username
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($updateUserId: ID!, $username: String!, $password: String!, $first: String!, $last: String!, $role: String!) {
    updateUser(updateUserId: $updateUserId, username: $username, password: $password, first: $first, last: $last, role: $role) {
      username
    }
  }
`;

export const REMOVE_USER = gql`
  mutation removeUser($removeUserId: ID!) {
    removeUser(removeUserId: $removeUserId)
  }
`;

export const ADD_CLIENT = gql`
  mutation addClient($name: String!, $code: String!) {
    addClient(name: $name, code: $code) {
      name
      code
    }
  }
`;

export const ADD_NEW_LEAD = gql`
  mutation addNewLead($name: String!, $author: ID!, $drafters: [ID]!, $client: ID!, $content: String!, $firstNote: String!) {
    addLead(name: $name, author: $author, drafters: $drafters, client: $client, content: $content, firstNote: $firstNote)
  }
`;

export const ADD_LEAD_REVISION = gql`
  mutation addLeadRevision($addLeadRevisionId: ID!, $author: ID!, $status: String!, $content: String!, $note: String!) {
    addLeadRevision(id: $addLeadRevisionId, author: $author, status: $status, content: $content, note: $note)
  }
`;

export const ADD_LEAD_NOTE = gql`
  mutation addLeadNote($addLeadNoteId: ID!, $revisionId: ID!, $author: ID!, $note: String!) {
    addLeadNote(id: $addLeadNoteId, revisionId: $revisionId, author: $author, note: $note)
  }
`;

export const ADD_FORM = gql`
  mutation addForm($name: String!, $formCategory: String!, $metadata: String, $sections: String!) {
    addForm(name: $name, formCategory: $formCategory, metadata: $metadata, sections: $sections)
  }
`;

export const ADD_STUDY = gql`
  mutation addStudy($clientCode: String!, $studyType: String!, $leadId: ID!) {
    addStudy(clientCode: $clientCode, studyType: $studyType, leadId: $leadId)
  }
`;

export const CREATE_DRIVE_STUDY_TREE = gql`
  mutation createDriveStudyTree($clientCode: String!, $studyName: String!) {
    createDriveStudyTree(clientCode: $clientCode, studyName: $studyName)
  }
`;

export const PUBLISH_LEAD_TO_DRIVE = gql`
  mutation publishLeadToDrive($clientCode: String!, $studyName: String!, $studyData: String!) {
    publishLeadToDrive(clientCode: $clientCode, studyName: $studyName, studyData: $studyData)
  }
`;

export const AUTHORIZE_GOOGLE_DRIVE = gql`
  mutation authorizeGoogleDrive {
    authorizeGoogleDrive
  }
`;

export const SAVE_GOOGLE_DRIVE_TOKEN = gql`
  mutation saveGoogleDriveToken($authCode: String!) {
    saveGoogleDriveToken(authCode: $authCode)
  }
`;

export const TEST_GOOGLE_DRIVE = gql`
  mutation testGoogleDrive($drive: String!, $path: String!) {
    testGoogleDrive(drive: $drive, path: $path)
  }
`;

export const SAVE_GOOGLE_DRIVE_CONFIG = gql`
  mutation saveGoogleDriveConfig($accountEmail: String, $studiesDriveId: String, $studiesDriveName: String, $studiesPath: String) {
    saveGoogleDriveConfig(accountEmail: $accountEmail, studiesDriveId: $studiesDriveId, studiesDriveName: $studiesDriveName, studiesPath: $studiesPath)
  }
`;

export const DELETE_GOOGLE_DRIVE_CONFIG = gql`
  mutation deleteGoogleDriveConfig {
    deleteGoogleDriveConfig
  }
`;