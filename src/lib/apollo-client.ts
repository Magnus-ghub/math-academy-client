import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createClient } from "graphql-ws";
import { useAuthStore } from "@/lib/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
const WS_URL = API_URL.replace(/^https?/, (p) => (p === "https" ? "wss" : "ws"));

const httpLink = createHttpLink({ uri: API_URL });

const authLink = new SetContextLink(({ headers }) => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("auth-storage");
      if (stored) token = JSON.parse(stored)?.state?.accessToken ?? null;
    } catch {}
  }
  return {
    headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) },
  };
});

const errorLink = new ErrorLink(({ error }) => {
  if (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")
  ) {
    useAuthStore.getState().logout();
  }
});

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: WS_URL,
          connectionParams: () => {
            try {
              const stored = localStorage.getItem("auth-storage");
              const token = stored ? JSON.parse(stored)?.state?.accessToken ?? null : null;
              return token ? { authorization: `Bearer ${token}` } : {};
            } catch {
              return {};
            }
          },
        }),
      )
    : null;

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === "OperationDefinition" && def.operation === "subscription";
      },
      wsLink,
      authLink.concat(httpLink),
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: errorLink.concat(splitLink),
  cache: new InMemoryCache(),
});
