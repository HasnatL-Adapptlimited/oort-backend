import { GraphQLList, GraphQLBoolean, GraphQLID, GraphQLError } from 'graphql';
import { Group } from '../../models';
import { GroupType } from '../types';
import { AppAbility } from '../../security/defineUserAbility';

/**
 * Lists groups.
 * Throws error if user is not logged or does not have permission
 */
export default {
  type: new GraphQLList(GroupType),
  args: {
    all: { type: GraphQLBoolean },
    application: { type: GraphQLID },
  },
  resolve(parent, args, context) {
    // Authentication check
    const user = context.user;
    if (!user) {
      throw new GraphQLError(context.i18next.t('errors.userNotLogged'));
    }

    const ability: AppAbility = context.user.ability;
    return Group.accessibleBy(ability, 'read');
  },
};
