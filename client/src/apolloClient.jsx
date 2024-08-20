import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Auth from './utils/auth';

// Check if process and process.env are defined, if not, define them
if (typeof process === 'undefined') {
  globalThis.process = {
    env: {
      REACT_APP_GRAPHQL_ENDPOINT: 'http://localhost:3001/graphql', // Default value
    },
  };
} else if (typeof process.env === 'undefined') {
  process.env = {
    REACT_APP_GRAPHQL_ENDPOINT: 'http://localhost:3001/graphql', // Default value
  };
}

// Log the environment variable to check if it's correctly loaded
console.log('Environment Variables:', process.env);

// Define the HTTP link with the GraphQL endpoint
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
});

// Define the auth link to include the token in headers
const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;