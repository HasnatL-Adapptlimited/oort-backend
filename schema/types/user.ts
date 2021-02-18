import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLBoolean, GraphQLList } from "graphql";
import { ApplicationType, PermissionType, RoleType } from ".";
import { Role, Permission, Application } from "../../models";
import { AppAbility } from "../../security/defineAbilityFor";

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLID,
            resolve(parent, args) {
                return parent._id;
            }
        },
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        oid: { type: GraphQLString },
        isAdmin: {
            type: GraphQLBoolean,
            resolve(parent, args) {
                return Role.exists({
                    application: null,
                    _id: { $in: parent.roles }
                });
            }
        },
        roles: {
            // TODO : check roles user can see
            type: new GraphQLList(RoleType),
            resolve(parent, args, context) {
                // Getting all roles / admin roles / application roles is determined by query populate at N+1 level.
                if (parent.roles && typeof(parent.roles === 'object')) {
                    return Role.find({}).where('_id').in(parent.roles.map(x => x._id));
                } else {
                    return Role.find({}).where('_id').in(parent.roles);
                }
            }
        },
        permissions: {
            type: new GraphQLList(PermissionType),
            async resolve(parent, args) {
                const roles = await Role.find().where('_id').in(parent.roles);
                // tslint:disable-next-line: no-shadowed-variable
                let permissions = [];
                for (const role of roles) {
                    if (role.permissions) {
                        permissions = permissions.concat(role.permissions);
                    }
                }
                permissions = [...new Set(permissions)];
                return Permission.find().where('_id').in(permissions);
            }
        },
        applications: {
            type: new GraphQLList(ApplicationType),
            async resolve(parent, args, context) {
                const ability: AppAbility = context.user.ability;
                return Application.accessibleBy(ability, 'read');
            }
        }
    })
});