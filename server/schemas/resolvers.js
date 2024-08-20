const { AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Book } = require("../models");

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
      return await User.findById(user._id);
    },
  },

  User: {
    savedBooks: async (user) => {
      // Assuming savedBooks are stored by their IDs in the User model
      return await Book.find({
        _id: { $in: user.savedBooks },
      });
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
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
    
      // Compare the provided password with the hashed password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }
    
      // Generate JWT token after successful authentication
      const token = jwt.sign({ id: user._id }, secret, { expiresIn: '2h' });
    
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
      });
    
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, secret, {
        expiresIn: "2h",
      });
    
      console.log("Add user", username, email, password);
      return { token, user: savedUser };
    },
    saveBook: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to save a book.");
      }

      const userId = user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      ).populate("savedBooks");

      return updatedUser;
    },

    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to remove a book.");
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
