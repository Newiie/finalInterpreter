import {
  NumberVal,
  RuntimeVal,
  MK_NULL,
  DisplayVal,
  FloatVal,
  CharVal,
  StringVal,
} from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  Display,
  Identifier,
  IntegerLiteral,
  FloatLiteral,
  Program,
  Stmt,
  StringLiteral,
  CharacterLiteral,
  EscapeLiteral,
  VarDeclaration,
  Scan,
  LogicalExpr,
  IfStmt,
  Block,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_expr,
  eval_identifier,
  eval_logical_expr,
} from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "IntegerLiteral":
      return {
        value: (astNode as IntegerLiteral).value,
        type: "number",
      } as NumberVal;
    case "FloatLiteral":
      return {
        value: (astNode as FloatLiteral).value,
        type: "float",
      } as FloatVal;
    case "CharacterLiteral":
      return {
        value: (astNode as CharacterLiteral).value,
        type: "char",
      } as CharVal;
    case "StringLiteral":
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "LogicalExpr":
      return eval_logical_expr(astNode as LogicalExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    // Handle unimplimented ast types as error.
    case "Display":
      return eval_display(astNode as Display, env);
    case "Scan":
      return eval_scan(astNode as Scan, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}

function eval_display(Node: Display, env: Environment): RuntimeVal {
  let outputString = "";
  for (const stmt of Node.value) {
    if (stmt.kind === "Identifier") {
      const newStmt = stmt as Identifier;
      const vara = env.lookupVar(newStmt.symbol) as NumberVal;
      const value = vara.value;
      outputString += value !== undefined ? value : "undefined";
    } else if (stmt.kind === "StringLiteral") {
      const newStmt = stmt as StringLiteral;
      outputString += newStmt.value;
    } else if (stmt.kind === "EscapeLiteral") {
      const newStmt = stmt as EscapeLiteral;
      outputString += newStmt.value;
    } else if (stmt.kind === "NewLine") {
      outputString += "\n";
    } else {
      // Handle other kinds of statements if needed
    }
  }
  console.log(outputString); // Output the constructed string
  return { type: "display", value: "success" } as DisplayVal;
}

function eval_scan(node: Scan, env: Environment): RuntimeVal {
  const input = prompt(
    `Enter values for ${node.variables.map((v) => v.symbol).join(", ")}:`
  )
    ?.split(",")
    .map((val) => val.trim());

  if (input && input.length === node.variables.length) {
    node.variables.forEach((variable, index) => {
      let value: RuntimeVal;
      switch (variable.dataType) {
        case "IntegerLiteral":
          value = {
            value: parseInt(input[index]),
            type: "number",
          } as NumberVal;
          break;
        case "FloatLiteral":
          value = {
            value: parseFloat(input[index]),
            type: "float",
          } as FloatVal;
          break;
        case "CharacterLiteral":
          value = { value: input[index], type: "char" } as CharVal;
          break;
        default:
          throw new Error(`Unsupported data type: ${variable.dataType}`);
      }
      env.assignVar(variable.symbol, value);
    });
    return { type: "null", value: null } as RuntimeVal;
  } else {
    throw new Error(
      "Input count does not match the number of variables in SCAN statement."
    );
  }
}
