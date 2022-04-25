import { GraphQLError, GraphQLList } from 'graphql';
import { StepType } from '../types';
import { Step } from '../../models';
import { AppAbility } from '../../security/defineAbilityFor';

export default {
  /*  List all steps available for the logged user.
        Throw GraphQL error if not logged.
    */
  type: new GraphQLList(StepType),
  resolve(parent, args, context) {
    // Authentication check
    const user = context.user;
    if (!user) {
      throw new GraphQLError(context.i18next.t('errors.userNotLogged'));
    }

    const ability: AppAbility = context.user.ability;
    return Step.accessibleBy(ability, 'read');
  },
};
