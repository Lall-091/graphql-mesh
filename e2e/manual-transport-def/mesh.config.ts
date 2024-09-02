import { Opts } from '@e2e/opts';
import { getLocalHostName } from '@e2e/tenv';
import {
  defineConfig as defineComposeConfig,
  loadGraphQLHTTPSubgraph,
} from '@graphql-mesh/compose-cli';
import { defineConfig as defineGatewayConfig } from '@graphql-mesh/serve-cli';
import rest from '@graphql-mesh/transport-rest';
import { loadOpenAPISubgraph } from '@omnigraph/openapi';

const opts = Opts(process.argv);

export const composeConfig = defineComposeConfig({
  subgraphs: [
    {
      sourceHandler: loadOpenAPISubgraph('greetings', {
        source: `http://${getLocalHostName()}:${opts.getServicePort('greetings')}/openapi.json`,
        endpoint: `http://${getLocalHostName()}:${opts.getServicePort('greetings')}`,
      }),
    },
    {
      sourceHandler: loadGraphQLHTTPSubgraph('helloer', {
        endpoint: `http://${getLocalHostName()}:${opts.getServicePort('helloer')}/graphql`,
      }),
    },
  ],
});

export const gatewayConfig = defineGatewayConfig({
  transports: {
    rest,
    http: import('@graphql-mesh/transport-http'),
  },
});
