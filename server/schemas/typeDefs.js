const typeDefs = `
type User {
    _id: ID
    username: String
    email: String
    savedBooks: [Book]!
    bookCount: Int
}

type Book {
    _id: ID
    authors: [String]
    description: String
    bookId: String
    image: String
    link: String
    title: String
}

type Author {
    name: String
}

type Auth {
    token: ID!
    user: User!
}

type Query {
    users: [User]
    user(username: String!): User
    books(username: String): [Book]
    book(bookId: ID!): Book
    me: User
}

`;
