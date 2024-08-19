const { AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Book } = require("../models");

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
    login: async (_, {email, password}) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AuthenticationError("Invalid credentials");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return { token, user };
    },

    addUser: async (_, {username,email,password}) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError("A user with this email already exists.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      console.log('Add user', username, email, password);
      return { token, user: savedUser };
    },
    saveBook: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to save a book.");
      }

      const userId = user._id;
      const { bookId, authors, description, title, image, link } = input;

      const book = new Book({
        bookId,
        authors,
        description,
        title,
        image,
        link,
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedBooks: book._id } },
        { new: true }
      ).populate("savedBooks");

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
        { $pull: { savedBooks: bookId } },
        { new: true }
      ).populate("savedBooks");

      return updatedUser;
    },
  },
};

module.exports = resolvers;
