'use client';

import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ReactNode, useMemo } from 'react';
import { session } from './session';

/** Har so'rovga token + joriy workspace header'larini qo'shadi. */
export function WoodflowApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010/graphql',
    });

    const authLink = setContext((_, { headers }) => {
      const token = session.token();
      const wsId = session.currentWorkspaceId();
      return {
        headers: {
          ...headers,
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...(wsId ? { 'x-workspace-id': wsId } : {}),
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
