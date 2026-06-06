import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
});

const authLink = new SetContextLink(({ headers }) => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        token = JSON.parse(stored)?.state?.accessToken ?? null;
      }
    } catch {
      // ignore parse errors
    }
  }
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});