import { GraphQLError, GraphQLID, GraphQLNonNull } from 'graphql';
import { Application } from '@models';
import { DistributionListType } from '../types';
import { AppAbility } from '@security/defineUserAbility';
import extendAbilityForApplications from '@security/extendAbilityForApplication';
import { validateEmail } from '@utils/validators';
import DistributionListInputType from '@schema/inputs/distributionList.input';
import { logger } from '@services/logger.service';

/**
 * Mutation to add a new distribution list.
 */
export default {
  type: DistributionListType,
  args: {
    application: { type: new GraphQLNonNull(GraphQLID) },
    distributionList: { type: new GraphQLNonNull(DistributionListInputType) },
  },
  async resolve(_, args, context) {
    try {
      const user = context.user;
      if (!user) {
        throw new GraphQLError(
          context.i18next.t('common.errors.userNotLogged')
        );
      }
      const ability: AppAbility = extendAbilityForApplications(
        user,
        args.application
      );
      if (ability.cannot('update', 'DistributionList')) {
        throw new GraphQLError(
          context.i18next.t('common.errors.permissionNotGranted')
        );
      }
      // Prevent wrong emails to be saved
      if (
        args.distributionList.emails.filter((x) => !validateEmail(x)).length > 0
      ) {
        throw new GraphQLError(
          context.i18next.t('common.errors.invalidEmailsInput')
        );
      }

      const update = {
        $addToSet: {
          distributionLists: {
            name: args.distributionList.name,
            emails: args.distributionList.emails,
          },
        },
      };

      const application = await Application.findByIdAndUpdate(
        args.application,
        update,
        { new: true }
      );

      return application.distributionLists.pop();
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
