import { GraphQLNonNull, GraphQLID, GraphQLError, GraphQLBoolean } from "graphql";
import GraphQLJSON from "graphql-type-json";
import errors from "../../const/errors";
import { Form, Record, Version } from "../../models";
import { AppAbility } from "../../security/defineAbilityFor";
import transformRecord from "../../utils/transformRecord";
import { RecordType } from "../types";
import mongoose from 'mongoose';
import convertFilter from "../../utils/convertFilter";

export default {
    /*  Edits an existing record.
        Create also an new version to store previous configuration.
    */
    type: RecordType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        data: { type: new GraphQLNonNull(GraphQLJSON) },
    },
    async resolve(parent, args, context) {
        // Authentication check
        const user = context.user;
        if (!user) { throw new GraphQLError(errors.userNotLogged); }

        const ability: AppAbility = user.ability;
        const oldRecord: Record = await Record.findById(args.id);
        let canUpdate = false;
        // Check permissions with two layers
        if (oldRecord && ability.can('update', oldRecord)) {
            canUpdate = true;
        } else {
            const form = await Form.findById(oldRecord.form);
            const roles = user.roles.map(x => mongoose.Types.ObjectId(x._id));
            const permissionFilters = [];
            form.permissions.canUpdateRecords.forEach(x => {
                if ( !x.role || roles.some(role => role.equals(x.role))) {
                    const filter = {};
                    Object.assign(filter,
                        x.access && convertFilter(x.access, Record, user)
                    );
                    permissionFilters.push(filter);
                }
            });
            canUpdate = permissionFilters.length ? await Record.exists({ $and: [{ _id: args.id}, { $or: permissionFilters }] }) : false;
        }
        if (canUpdate) {
            const version = new Version({
                createdAt: oldRecord.modifiedAt ? oldRecord.modifiedAt : oldRecord.createdAt,
                data: oldRecord.data,
                createdBy: user.id
            });
            const form = await Form.findById(oldRecord.form);
            transformRecord(args.data, form.fields);
            const update: any = {
                data: { ...oldRecord.data, ...args.data },
                modifiedAt: new Date(),
                $push: { versions: version._id },
            }
            const record = Record.findByIdAndUpdate(
                args.id,
                update,
                { new: true }
                );
                await version.save();
                return record;
        } else {
            throw new GraphQLError(errors.permissionNotGranted);
        }
    },
}