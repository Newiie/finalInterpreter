import { env } from "process";
import { AssignmentExpr, BinaryExpr, Block, Identifier, IfStmt, UnaryExpr } from "../../frontend/ast.ts";
import { TokenType } from "../../frontend/lexer.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FloatVal, MK_NULL, NumberVal, RuntimeVal } from "../values.ts";

function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
  decimals: boolean
): RuntimeVal {
  let result: number | boolean;

  switch (operator) {
    case "+":
      result = lhs.value + rhs.value;
      break;
    case "-":
      result = lhs.value - rhs.value;
      break;
    case "*":
      result = lhs.value * rhs.value;
      break;
    case "/":
      if (rhs.value === 0) throw new Error("Math Error: can't divide by 0");
      result = lhs.value / rhs.value;
      break;
    case "%":
      result = lhs.value % rhs.value;
      break;
    case "<>":
      result = lhs.value != rhs.value;
      break;
    case "==":
      result = lhs.value == rhs.value;
      break;
    case ">=":
      result = lhs.value >= rhs.value;
      break;
    case "<=":
      result = lhs.value <= rhs.value;
      break;
    case "<":
      result = lhs.value < rhs.value;
      break;
    case ">":
      result = lhs.value > rhs.value;
      break;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }

  if (["<", ">", "<=", ">=", "==", "<>"].includes(operator)) {
    return { value: result, type: "boolean" };
  } else {
    return { value: result, type: decimals ? "float" : "number" };
  }
}

export function eval_if_stmt(stmt: IfStmt, env: Environment): RuntimeVal {
  const condition = evaluate(stmt.condition, env) as BooleanVal;
  if (condition.value) {
    return evaluate(stmt.thenBranch, env);
  } else if (stmt.elseBranch) {
    return evaluate(stmt.elseBranch, env);
  }
  return MK_NULL();
}

export function eval_block(block: Block, env: Environment): RuntimeVal {
  let result: RuntimeVal = MK_NULL();
  for (const stmt of block.body) {
    result = evaluate(stmt, env);
  }
  return result;
}

export function eval_logical_expr(
  lhs: BooleanVal,
  rhs: BooleanVal,
  operator: string,
): RuntimeVal {
  switch (operator) {
    case "AND":
      return lhs && rhs;
    case "OR":
      return lhs || rhs;
    case "NOT":
      return lhs && lhs;
    default:
      throw `Unknown logical operator ${operator}`;
  }
}

/**
 * Evaulates expressions following the binary operation type.
 */
export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment,
):  RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if ((lhs.type == "number" || lhs.type == "float") && (rhs.type == "number" || rhs.type == "float")) {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
      lhs.type === "float" || rhs.type === "float"
    );
  }  else if (lhs.type == "boolean" || rhs.type == "boolean")  {
    return eval_logical_expr(
      lhs as BooleanVal,
      rhs as BooleanVal,
      binop.operator, 
    );
  }

  // One or both are NULL
  return MK_NULL();
}

export function eval_unary_expr(expr: UnaryExpr, env: Environment): RuntimeVal {
  const operand = evaluate(expr.operand, env);
  
  if (expr.operator === TokenType.Not) {
    if (operand.type !== "boolean") {
      throw new Error(`Operator 'NOT' can only be applied to boolean values. Got ${operand.type}.`);
    }
    return {
      value: !operand.value,
      type: "boolean",
    } as BooleanVal;
  }

  throw new Error(`Unsupported unary operator ${expr.operator}`);
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