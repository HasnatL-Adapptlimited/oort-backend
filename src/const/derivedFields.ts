/**
 * Interface for a simple operator
 * If type is 'value', the operator is a constant, stored in the value field
 * If type is 'field', the operator is the value for that the field with the name stored in value
 */
interface SimpleOperator {
  type: 'value' | 'field';
  value: string | number | boolean;
}

/**
 * Interface for a recursive operator
 */
interface RecursiveOperator {
  type: 'expression';
  value: Operation;
}

export type Operator = SimpleOperator | RecursiveOperator;

export type DateOperationTypes =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

export type SingleOperatorOperationsTypes =
  | DateOperationTypes
  | 'exists'
  | 'size';
/** Interface for an operation with a single operator */
interface SingleOperatorOperation {
  operation: SingleOperatorOperationsTypes;
  operator: Operator;
}
export type DoubleOperatorOperationsTypes =
  | 'sub'
  | 'div'
  | 'gte'
  | 'gt'
  | 'lte'
  | 'lt'
  | 'eq'
  | 'ne'
  | 'datediff';
/** Interface for an operation with two operators (the order matters) */
interface DoubleOperatorOperation {
  operation: DoubleOperatorOperationsTypes;
  operator1: Operator;
  operator2: Operator;
}

export type MultipleOperatorsOperationsTypes =
  | 'add'
  | 'mul'
  | 'and'
  | 'or'
  | 'concat';
/** Interface for an operation with multiple operators */
interface MultipleOperatorsOperation {
  operation: MultipleOperatorsOperationsTypes;
  operators: Operator[];
}

export type Operation =
  | MultipleOperatorsOperation
  | SingleOperatorOperation
  | DoubleOperatorOperation;
