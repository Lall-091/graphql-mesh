import { getIntrospectionQuery } from 'graphql';
import { createTenv, getLocalHostName } from '@e2e/tenv';

const { serve, service } = createTenv(__dirname);

it('should serve a schema from a url without pathname', async () => {
  const cdn = await service('cdn');

  const { execute } = await serve({
    supergraph: `http://${getLocalHostName()}:${cdn.port}`,
  });

  await expect(execute({ query: getIntrospectionQuery() })).resolves.toMatchSnapshot();
});

it('should serve a schema from a url with pathname', async () => {
  const cdn = await service('cdn');

  const { execute } = await serve({
    supergraph: `http://${getLocalHostName()}:${cdn.port}/schema`,
  });

  await expect(execute({ query: getIntrospectionQuery() })).resolves.toMatchSnapshot();
});

it('should serve a schema from a url with pathname and extension', async () => {
  const cdn = await service('cdn');

  const { execute } = await serve({
    supergraph: `http://${getLocalHostName()}:${cdn.port}/schema.graphql`,
  });

  await expect(execute({ query: getIntrospectionQuery() })).resolves.toMatchSnapshot();
});
