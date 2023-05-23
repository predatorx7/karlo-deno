import config from "./configs.ts";
import typeDefs from "./schema.ts";
import { Handler, Server } from "std/http/server";
import { resolvers } from "./resolvers.ts";
import { makeExecutableSchema } from "graphql_tools";
import { GraphQLHTTP } from "gql";
import { kDebugMode } from "./utils/is_debug.ts";

const ping: Handler = (_: Request): Response => {
  return new Response("pong", { status: 200 });
};

const health: Handler = (_: Request): Response => {
  return new Response(
    JSON.stringify({
      "up": true,
      "server-start-time": serverStartTime?.toISOString(),
    }),
    { status: 200 },
  );
};

const unknown: Handler = (_: Request): Response => {
  return new Response("Not Found", { status: 404 });
};

let serverStartTime: Date | undefined;

const main = async () => {
  serverStartTime = new Date();
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new Server({
    handler: async (req, connInfo) => {
      const { pathname } = new URL(req.url);
      if (pathname === "/ping") return ping(req, connInfo);
      if (pathname === "/health") return health(req, connInfo);
      if (pathname !== "/graphql") return unknown(req, connInfo);
      return await GraphQLHTTP<Request>({
        schema,
        graphiql: kDebugMode,
      })(req);
    },
    port: config.PORT,
  });

  console.info(`Starting server on port ${config.PORT}`);

  setTimeout(() => {
    for (const addr of server.addrs) {
      const address = addr as {
        hostname?: string;
        port: number;
      };
      console.log(
        `🚀 Server ready at http://${address.hostname}:${address.port}`,
      );
    }
  }, 1000);

  await server.listenAndServe();
};

main();
