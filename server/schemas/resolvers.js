const { AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {User, Book} = require('../models')

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
      const user = await User.findOne({ username }).populate('savedBooks');
      return user.savedBooks;
    },
    book: async (_, { bookId }) => {
      return await Book.findById(bookId);
    },
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      return await User.findById(user._id);
    },
  },

  User: {
    savedBooks: async (user) => {
      // Assuming savedBooks are stored by their IDs in the User model
      return await Book.find({
        '_id': { $in: user.savedBooks }
      });
    }
  },

  Book: {
    authors: async (book) => {
      // Assuming authors are stored as subdocuments in Book
      return book.authors;
    }
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return { token, user };
    }
  }
};

module.exports = resolvers;
