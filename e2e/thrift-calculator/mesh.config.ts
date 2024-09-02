import { Opts } from '@e2e/opts';
import { getLocalHostName } from '@e2e/tenv';
import { defineConfig } from '@graphql-mesh/compose-cli';
import { loadThriftSubgraph } from '@omnigraph/thrift';

const opts = Opts(process.argv);

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadThriftSubgraph('calculator', {
        source: './services/calculator/calculator.thrift',
        endpoint: `http://${getLocalHostName()}:${opts.getServicePort('calculator')}/thrift`,
        serviceName: 'Calculator',
      }),
    },
  ],
});
