// import applyFilters from './applyFilters';

import { GraphQLError } from "graphql";
import errors from "../../../const/errors";
import { Form, Record, User } from "../../../models";
import getFilter from "./getFilter";
import getSortField from "./getSortField";
import getPermissionFilters from "../../getPermissionFilters";
import { AppAbility } from "../../../security/defineAbilityFor";

export default (id) => async (
    _,
    { sortField, sortOrder = 'asc', page = 0, perPage = 25, filter = {} },
    context
) => {

    const user: User = context.user;
    if (!user) {
        throw new GraphQLError(errors.userNotLogged);
    }

    const mongooseFilter = getFilter(filter);

    Object.assign(mongooseFilter,
        { $or: [{ resource: id }, { form: id }] }
    );

    /* Example of test filters:
    role: admin
    access: everything -> can acess all records where id is defined by the top

    role: coordinator
    access: everything part of same country ( based on creator )

    role: partner
    access: everything part of same country + same agency ( based on creator )

    */
   
    const ability: AppAbility = user.ability;
    let permissionFilters = [];
    if (ability.cannot('read', 'Record')) {
        const form = await Form.findOne({ $or: [{ resource: id }, { form: id }] });
        permissionFilters = getPermissionFilters(user, form, 'canSeeRecords');
    }

    return Record.find(permissionFilters.length ? { $and: [mongooseFilter, { $or: permissionFilters }] } : mongooseFilter)
        .sort([[getSortField(sortField), sortOrder]])
        .skip(page * perPage)
        .limit(perPage);
};