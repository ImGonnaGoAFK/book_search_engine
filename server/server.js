const express = require("express");
const path = require("path");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const cors = require("cors");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: 'https://book-search-engine-0ofb.onrender.com',
  credentials: true,
}));

app.use(authMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = req.user;
    console.log("Context user:", user);
    return { user };
  },
  cors: {
    origin: ['http://localhost:3000', 'https://render.com'], // List allowed origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// if we're in production, serve client/build as static assets
const startApolloServer = async () => {
  await server.start();

  // Use the same context function in both places for consistency
  const contextFunction = ({ req }) => {
    const user = req.user;
    return { user };
  };

  // Use the context function when applying the middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: contextFunction,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
