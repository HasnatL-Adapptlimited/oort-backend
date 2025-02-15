import { ApolloServer } from 'apollo-server-express';
import schema from '../../../src/schema';
import { SafeTestServer } from '../../server.setup';
import { ApiConfiguration, Role } from '@models';

let server: ApolloServer;

/**
 * Test ApiConfigurations query.
 */
describe('ApiConfigurations query tests', () => {
  const query = '{ apiConfigurations { totalCount, edges { node { id } } } }';

  test('query with wrong user returns error', async () => {
    server = await SafeTestServer.createApolloTestServer(schema, {
      name: 'Wrong user',
      roles: [],
    });
    const result = await server.executeOperation({ query });
    expect(result.errors).toBeUndefined();
    expect(result).toHaveProperty(['data', 'apiConfigurations', 'totalCount']);
    expect(result.data?.apiConfigurations.edges).toEqual([]);
    expect(result.data?.apiConfigurations.totalCount).toEqual(0);
  });
  test('query with admin user returns expected number of apiConfigurations', async () => {
    const count = await ApiConfiguration.countDocuments();
    console.log('ApiConfiguration count ==>> ', count);
    const admin = await Role.findOne(
      { title: 'admin' },
      'id permissions'
    ).populate({
      path: 'permissions',
      model: 'Permission',
    });
    server = await SafeTestServer.createApolloTestServer(schema, {
      name: 'Admin user',
      roles: [admin],
    });
    const result = await server.executeOperation({ query });
    expect(result.errors).toBeUndefined();
    expect(result).toHaveProperty(['data', 'apiConfigurations', 'totalCount']);
    expect(result.data?.apiConfigurations.totalCount).toEqual(count);
  });
});
