export type ValueType = "null" | "number" | "boolean" | "display" | "float" | "char" | "string";

export interface RuntimeVal {
  value: any;
  type: ValueType;
}

/**
 * Defines a value of undefined meaning
 */
export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export interface DisplayVal extends RuntimeVal {
  type: "display";
  value: string;
}

/**
 * Runtime value that has access to the raw native javascript number.
 */
export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface FloatVal extends RuntimeVal {
  type: "float";
  value: number;
}

export interface CharVal extends RuntimeVal {
  type: "char";
  value: string;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullVal;
}

