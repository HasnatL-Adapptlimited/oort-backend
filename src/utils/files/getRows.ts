import get from 'lodash/get';
import set from 'lodash/set';
// import getDisplayText from '../form/getDisplayText';

/**
 * Transforms records into export rows, using fields definition.
 * @param columns definition of export columns.
 * @param records list of records.
 * @returns list of export rows.
 */
export const getRows = async (columns: any[], records: any[]): Promise<any[]> => {
  const rows = [];
  for (const record of records) {
    const row = {};
    const data = record.data;
    for (const column of columns) {
      switch (column.type) {
        case 'checkbox': {
          if (column.value) {
            const value = data[column.field]?.includes(column.value) ? 1 : 0;
            set(row, column.name, value);
          } else {
            const value = data[column.field] || [];
            // const value = await getDisplayText(column.meta.field, data[column.field], context);
            set(row, column.name, Array.isArray(value) ? value.join(',') : value);
          }
          break;
        }
        case 'tagbox': {
          if (column.value) {
            const value = data[column.field]?.includes(column.value) ? 1 : 0;
            set(row, column.name, value);
          } else {
            const value = data[column.field] || [];
            // const value = await getDisplayText(column.meta.field, data[column.field], context);
            set(row, column.name, Array.isArray(value) ? value.join(',') : value);
            
          }
          break;
        }
        case 'multipletext': {
          const value = get(data, column.name);
          set(row, column.name, value);
          break;
        }
        case 'matrix': {
          const value = get(data, column.name);
          set(row, column.name, value);
          break;
        }
        case 'matrixdropdown': {
          const value = get(data, column.name);
          set(row, column.name, value);
          break;
        }
        default: {
          const value = column.default ? record[column.field] : data[column.field];
          set(row, column.name, value);
          break;
        }
      }
    }
    rows.push(row);
  }
  return rows;
};
