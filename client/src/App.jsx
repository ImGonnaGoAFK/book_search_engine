// src/App.jsx
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient'; // Import your Apollo Client configuration
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
