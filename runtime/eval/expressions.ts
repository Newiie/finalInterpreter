import { AssignmentExpr, BinaryExpr, Identifier } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FloatVal, MK_NULL, NumberVal, RuntimeVal } from "../values.ts";

function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
  decimals: boolean
): NumberVal  {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    // TODO: Division by zero checks
    if (rhs.value == 0) throw `Math Error: cant divide by 0`
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }
  // if (!decimals) return { value: parseInt(result.toString()), type: "number" };
  return { value: result, type: "number" };
}

/**
 * Evaulates expressions following the binary operation type.
 */
export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment,
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  // Only currently support numeric operations
  if (lhs.type == "number" && rhs.type == "number") {

    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
      false,
    );
  } else if (lhs.type == "float" || rhs.type == "float") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
      true,
    );
  }

  // One or both are NULL
  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment,
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}


export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
    if (node.assignee.kind != "Identifier") {
        throw `Invalid assignment expr ${JSON.stringify(node.assignee)}`
    }

    if (((node.assignee as Identifier).dataType != node.value.kind) && node.value.kind != "AssignmentExpr") throw `Data Type mismatch ${(node.assignee as Identifier).dataType} not equal to ${node.value.kind}`

    const varname = (node.assignee as Identifier).symbol
    return env.assignVar(varname, evaluate(node.value, env))
}