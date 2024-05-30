import { env } from "process";
import { AssignmentExpr, BinaryExpr, Block, Identifier, IfStmt, UnaryExpr, WhileStmt } from "../../frontend/ast.ts";
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

export function eval_while_stmt(stmt: WhileStmt, env: Environment): RuntimeVal {
  let result: RuntimeVal = MK_NULL();
  // console.log("JUST CHECKING")
  let condition = (evaluate(stmt.condition, env) as BooleanVal).value
  // console.log("COND ", condition)
  let ctr = 1
  while (condition) {
      result = evaluate(stmt.body, env);
      condition = evaluate(stmt.condition, env).value as BooleanVal
      // console.log("RES ", result)
      // console.log("COND ", condition)
      // if (ctr == 10) break;
      // ctr++
    }
  return result;
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
  let result : boolean;
  switch (operator) {
    case "AND":
      result = lhs.value && rhs.value;
      break;
    case "OR":
      result =  lhs.value || rhs.value;
      break;
    case "NOT":
      result = !lhs.value;
      break;
    default:
      throw `Unknown logical operator ${operator}`;
  }

  return { value: result, type: "boolean" };
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
  // console.log("BINOP ", binop)
  let lhsType
  // const lhsType = env.lookupVar((lhs as Identifier).symbol)
  if (binop.left.kind == "Identifier") {
    // console.log("ITS IDENTIFIER", binop.left)
    lhsType = env.lookupVar(binop.left.symbol)
    // console.log("LHS TYPE NUMBER", lhsType)
  }
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
    // console.log("NODE", node)
    
    if ((node.assignee as Identifier).dataType == "DEFINED") {
      // console.log("LOOK UP ", env.lookupVar((node.assignee as Identifier).symbol))
      switch(env.lookupVar((node.assignee as Identifier).symbol).type) {
        case "char":
          (node.assignee as Identifier).dataType = "CharacterLiteral"
          break;
        case "string":
          (node.assignee as Identifier).dataType = "StringLiteral"
          break;
        case "boolean":
          (node.assignee as Identifier).dataType = "BooleanLiteral"
          break;
        case "number":
          (node.assignee as Identifier).dataType = "IntegerLiteral"
          break;
        case "float":
          (node.assignee as Identifier).dataType = "FloatLiteral"
          break;

      }
    } 
    // console.log("NODE", node)
    if ((node.assignee as Identifier).dataType == "FloatLiteral" && node.value.kind == "IntegerLiteral" 
    || (node.assignee as Identifier).dataType == "IntegerLiteral" && node.value.kind == "FloatLiteral" ) {
      // console.log("CHECK 2")
      const varname = (node.assignee as Identifier).symbol
      return env.assignVar(varname, evaluate(node.value, env))
    } 

    // console.log("CHECk 3")
    if ((node.value.kind == "Identifier") && (env.lookupVar((node.value as Identifier).symbol).type === env.lookupVar((node.assignee as Identifier).symbol).type)) {
    } else if (node.assignee.dataType == "BooleanLiteral" && node.value.kind == "StringLiteral") {
    }else if (((node.assignee as Identifier).dataType != node.value.kind ) && node.value.kind != "AssignmentExpr" && node.value.kind != "BinaryExpr"
  
    ) throw `Data Type mismatch ${(node.assignee as Identifier).dataType} not equal to ${node.value.kind}`

    const varname = (node.assignee as Identifier).symbol
    const nodeValue = evaluate(node.value, env)
    // console.log("NODE VAL ", nodeValue, node.assignee)

    // check if they are the same
    switch(node.assignee.dataType) {
      case "BooleanLiteral":
        if (nodeValue.type != "boolean") throw "Error: Data Type mistmatch"
        break;
      case "IntegerLiteral":
        if (nodeValue.type != "number" && nodeValue.type != "float") throw "Error: Data Type mistmatch"
        nodeValue.value = parseInt(nodeValue.value)
        break;
      case "CharacterLiteral":
        if (nodeValue.type != "char") throw "Error: Data Type mistmatch"
        break;
    }
    return env.assignVar(varname, nodeValue)
}