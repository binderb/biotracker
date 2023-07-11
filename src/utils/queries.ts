import gql from "graphql-tag";

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      _id
      username
      first
      last
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

export const GET_NEW_CODE = gql`
  query GetNewCode {
    getNewCode
  }
`;

export const GET_NEXT_STUDY = gql`
  query GetNextStudy($clientCode: String!) {
    getNextStudy(clientCode: $clientCode)
  }
`;

export const GET_LEADS = gql`
  query GetLeads {
    getLeads {
      _id
      status
      author {
        _id
        first
        last
        username
      }
      client {
        _id
        code
      }
      drafters {
        _id
        first
        last
        username
      }
      revisions {
        _id
      }
      name
      notes {
        author {
          _id
          first
          last
          username
        }
      }

    }
  }
`;

export const GET_LEAD_LATEST = gql`
  query GetLeads($getLeadLatestRevisionId: ID!) {
    getLeadLatestRevision(id: $getLeadLatestRevisionId) {
      _id
      name
      status
      drafters {
        _id
      }
      client {
        _id
        code
      }
      revisions {
        _id
        content
        author {
          _id
        }
      }
      notes {
        _id
        createdAt
        content
        revision {
          _id
        }
        newRevision
        author {
          _id
          first
          last
          username
        }
      }
    }
  }
`;

export const GET_LEAD_TEMPLATES = gql`
  query GetLeadTemplates {
    getLeadTemplates {
      _id
      name
    }
  }
`;

export const GET_LEAD_TEMPLATE_LATEST = gql`
  query Query($getLeadTemplateLatestRevisionId: ID!) {
    getLeadTemplateLatestRevision(id: $getLeadTemplateLatestRevisionId) {
      _id
      active
      name
      revisions {
        _id
        createdAt
        sections {
          _id
          extensible
          rows {
            _id
            index
            extensible
            fields {
              _id
              data
              params
              index
              type
            }
          }
          index
          name
        }
      }
    }
  }
`;

export const GET_GOOGLE_DRIVE_CONFIG = gql`
  query Query {
    getGoogleDriveConfig {
      _id
      accountEmail
      studiesDriveName
      studiesDriveId
      studiesPath
    }
  }
`;