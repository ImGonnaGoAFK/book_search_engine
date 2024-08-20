const { AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const secret = "mysecretsshhhhh";

const resolvers = {
  Query: {
    users: async () => {
      return await User.find({});
    },
    user: async (_, { username }) => {
      return await User.findOne({ username });
    },
    books: async (_, { username }) => {
      if (!username) {
        return await Book.find({});
      }
      const user = await User.findOne({ username }).populate("savedBooks");
      return user.savedBooks;
    },
    book: async (_, { bookId }) => {
      return await Book.findById(bookId);
    },
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      const foundUser = await User.findById(user._id).populate("savedBooks");

      // Ensure savedBooks is always an array
      if (!foundUser.savedBooks) {
        foundUser.savedBooks = [];
      }

      return foundUser;
    },
  },

  User: {
    savedBooks: async (user) => {
      if (!user.savedBooks) return [];
      return user.savedBooks;
    },
  },

  Book: {
    authors: async (book) => {
      // Assuming authors are stored as subdocuments in Book
      return book.authors;
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError("Invalid credentials");
      }
      const token = signToken(
        { username: user.username, email: user.email, _id: user._id },
        secret,
        { expiresIn: "2h" }
      );

      return { token, user };
    },

    addUser: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError("A user with this email already exists.");
      }

      const newUser = new User({
        username,
        email,
        password,
        savedBooks: [],
      });

      const savedUser = await newUser.save();
      const token = signToken(
        {
          username: savedUser.username,
          email: savedUser.email,
          _id: savedUser._id,
        },
        secret,
        {
          expiresIn: "2h",
        }
      );

      console.log("Add user", username, email, password);
      return { token, user: savedUser };
    },
    saveBook: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to save a book.");
      }

      const existingUser = await User.findById(user._id);
      if (!existingUser) {
        console.log("User ID in saveBook:", user.id);
        console.log("Input for savedBooks:", input);
        console.error("User not found in the database:", user.id);
        throw new Error("User not found");
      }

      if (!existingUser.savedBooks) {
        existingUser.savedBooks = [];
      }

      const bookData = {
        bookId: input.bookId,
        authors: input.authors,
        description: input.description,
        title: input.title,
        image: input.image,
        link: input.link,
      };

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      ).populate("savedBooks");

      if (!updatedUser) {
        throw new Error("User not found after update");
      }
      return updatedUser;
    },

    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to remove a book."
        );
      }

      const userId = user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate("savedBooks");

      return updatedUser;
    },
  },
};

module.exports = resolvers;
