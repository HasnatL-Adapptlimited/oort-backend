import GraphQLJSON from "graphql-type-json";
import { defaultFields, defaultRecordFields } from "../../const/defaultRecordFields";
import getTypeFromField from "./getTypeFromField";

const getFieldName = (field) => {
    const name = field.name.split('-').join('_');
    return field.resource ? `${name}_id` : name;
}

export const getMetaFields = (fields) => {
    fields = Object.fromEntries(
        fields.filter(x => x.name).map(x => [getFieldName(x), {
            type: GraphQLJSON
        }])
    );
    for (const field of defaultFields) {
        fields[field] = { type: GraphQLJSON };
    }
    return fields;
}

export default (fields, filter = false) => {
    fields = Object.fromEntries(
        fields.filter(x => x.name).map(x => [getFieldName(x), {
            type: getTypeFromField(x)
        }])
    );
    for (const element of defaultRecordFields) {
        fields[element.field] = { type: element.type(filter) };
    }
    return fields;
}