const isServer = typeof window === 'undefined';

const config = {
  development: {
    uri: isServer ? 'http://localhost:3000/api/graphql' : '/api/graphql',
  },
  production: {
    uri: isServer ? 'https://ops.biosiminnovations.com/api/graphql' : '/api/graphql',
  },
};

export default config;