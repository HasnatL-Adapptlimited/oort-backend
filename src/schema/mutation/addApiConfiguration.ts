import { GraphQLNonNull, GraphQLString, GraphQLError } from 'graphql';
import { ApiConfiguration } from '../../models';
import { ApiConfigurationType } from '../types';
import { AppAbility } from '../../security/defineUserAbility';
import { authType, status } from '../../const/enumTypes';
import { validateApi } from '../../utils/validators/validateApi';

export default {
  /*  Creates a new apiConfiguration.
        Throws an error if not logged or authorized, or arguments are invalid.
    */
  type: ApiConfigurationType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parent, args, context) {
    const user = context.user;
    if (!user) {
      throw new GraphQLError(context.i18next.t('errors.userNotLogged'));
    }
    const ability: AppAbility = user.ability;
    if (ability.can('create', 'ApiConfiguration')) {
      if (args.name !== '') {
        validateApi(args.name);
        const apiConfiguration = new ApiConfiguration({
          name: args.name,
          status: status.pending,
          authType: authType.serviceToService,
          permissions: {
            canSee: [],
            canUpdate: [],
            canDelete: [],
          },
        });
        return apiConfiguration.save();
      }
      throw new GraphQLError(
        context.i18next.t('errors.invalidAddApiConfigurationArguments')
      );
    } else {
      throw new GraphQLError(context.i18next.t('errors.permissionNotGranted'));
    }
  },
};
