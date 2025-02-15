import { GraphQLError, GraphQLID, GraphQLInt } from 'graphql';
import { PullJobConnectionType, encodeCursor, decodeCursor } from '../types';
import { PullJob } from '@models';
import { AppAbility } from '@security/defineUserAbility';
import { logger } from '@services/logger.service';
import checkPageSize from '@utils/schema/errors/checkPageSize.util';

/** Default page size */
const DEFAULT_FIRST = 10;

/**
 * Return all pull jobs available for the logged user.
 * Throw GraphQL error if not logged.
 */
export default {
  type: PullJobConnectionType,
  args: {
    first: { type: GraphQLInt },
    afterCursor: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    // Make sure that the page size is not too important
    const first = args.first || DEFAULT_FIRST;
    checkPageSize(first);
    try {
      // Authentication check
      const user = context.user;
      if (!user) {
        throw new GraphQLError(
          context.i18next.t('common.errors.userNotLogged')
        );
      }

      const ability: AppAbility = context.user.ability;
      const abilityFilters = PullJob.accessibleBy(ability, 'read').getFilter();
      const filters: any[] = [abilityFilters];

      const afterCursor = args.afterCursor;
      const cursorFilters = afterCursor
        ? {
            _id: {
              $gt: decodeCursor(afterCursor),
            },
          }
        : {};

      let items: any[] = await PullJob.find({
        $and: [cursorFilters, ...filters],
      }).limit(first + 1);

      const hasNextPage = items.length > first;
      if (hasNextPage) {
        items = items.slice(0, items.length - 1);
      }
      const edges = items.map((r) => ({
        cursor: encodeCursor(r.id.toString()),
        node: r,
      }));
      return {
        pageInfo: {
          hasNextPage,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        edges,
        totalCount: await PullJob.countDocuments({ $and: filters }),
      };
    } catch (err) {
      logger.error(err.message, { stack: err.stack });
      if (err instanceof GraphQLError) {
        throw new GraphQLError(err.message);
      }
      throw new GraphQLError(
        context.i18next.t('common.errors.internalServerError')
      );
    }
  },
};
