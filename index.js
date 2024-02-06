import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import axios from "axios";
import morgan from "morgan";
import dotenv from "dotenv";

async function startServer() {
  dotenv.config();
  const app = express();
  const port = process.env.PORT;
  const server = new ApolloServer({
    typeDefs: `
        type Users{
            id:ID!
            name:String!
            username:String!
            email:String!
        }

        type Todos{
            id:ID!
            title:String!
            completed:Boolean
            user:Users
        }
        
        type Query{
            getTodos:[Todos]
            getUsers:[Users]
            getUser(id:ID!):Users
        }
        `,
    resolvers: {
      Todos: {
        user: async (todo) =>
          (
            await axios.get(
              `https://jsonplaceholder.typicode.com/users/${todo.id}`
            )
          ).data,
      },
      Query: {
        getTodos: async () =>
          (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
        getUsers: async () =>
          (await axios.get("https://jsonplaceholder.typicode.com/users")).data,
        getUser: async (parent, { id }) =>
          (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
            .data,
      },
    },
  });
  // middleware
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // start appolo server
  await server.start();
  // define graphql end-point
  app.use("/graphql", expressMiddleware(server));
  // listen server
  app.listen(port, () => console.log(`http://localhost:${port}`));
}

startServer();
