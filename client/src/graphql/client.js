import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { Kind, OperationTypeNode } from 'graphql';
import { createClient as createWsClient } from 'graphql-ws'
import { getAccessToken } from '../auth';

const httpLink = new HttpLink({
  uri: 'http://localhost:9000/graphql',
});

const wsLink = new GraphQLWsLink(createWsClient({
  url: 'ws://localhost:9000/graphql',
  connectionParams: () => ({ accessToken: getAccessToken() })
}));

function isSubscription({ query }) {
  const defintion = getMainDefinition(query);
  return defintion.kind === Kind.OPERATION_DEFINITION
    && defintion.operation === OperationTypeNode.SUBSCRIPTION
}

export const client = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

export default client;
