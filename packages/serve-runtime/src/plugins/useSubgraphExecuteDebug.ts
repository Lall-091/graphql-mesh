import { isAsyncIterable } from 'graphql-yoga';
import { defaultPrintFn } from '@graphql-mesh/transport-common';
import type { Logger } from '@graphql-mesh/types';
import type { GatewayPlugin } from '../types';

export function useSubgraphExecuteDebug<TContext>(opts: {
  logger: Logger;
}): GatewayPlugin<TContext> {
  return {
    onSubgraphExecute({ executionRequest, logger = opts.logger }) {
      if (executionRequest) {
        logger.debug(`subgraph-execute`, () =>
          JSON.stringify(
            {
              query: executionRequest.document && defaultPrintFn(executionRequest.document),
              variables: executionRequest.variables,
            },
            null,
            '  ',
          ),
        );
      }
      return function onSubgraphExecuteDone({ result }) {
        if (isAsyncIterable(result)) {
          return {
            onNext({ result }) {
              logger.debug(`subgraph-response-next`, result);
            },
            onEnd() {
              logger.debug(`subgraph-response-end`);
            },
          };
        }
        if (result) {
          logger.debug(
            `subgraph-response`,
            JSON.stringify(
              {
                data: result.data,
                errors: result.errors,
              },
              null,
              '  ',
            ),
          );
        }
      };
    },
  };
}
