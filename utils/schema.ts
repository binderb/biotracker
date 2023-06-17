import typeDefs from './typeDefs';
import typeDefsInventory from './typeDefsInventory';
import resolvers from './resolvers';
import resolversInventory from './resolversInventory';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';

export const schema = makeExecutableSchema({
  typeDefs: [typeDefs, typeDefsInventory],
  resolvers: merge(resolvers, resolversInventory)
});