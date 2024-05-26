import { NumberVal, RuntimeVal, MK_NULL, DisplayVal, FloatVal, CharVal } from "./values.ts";
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
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import { eval_assignment, eval_binary_expr, eval_identifier } from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "IntegerLiteral":
      return {
        value: ((astNode as IntegerLiteral).value),
        type: "number",
      } as NumberVal;
      case "FloatLiteral":
        return {
          value: ((astNode as FloatLiteral).value),
          type: "float",
        } as FloatVal;
      case "CharacterLiteral":
        return {
          value: ((astNode as CharacterLiteral).value),
          type: "char",
        } as CharVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "AssignmentExpr":
        return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    // Handle unimplimented ast types as error.
    case "Display":
      return eval_display(astNode as Display, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode,
      );
      process.exit(0);
  }
}

function eval_display(Node: Display, env: Environment): RuntimeVal {
  let outputString = "";
  for (const stmt of Node.value) {
    if (stmt.kind === "Identifier") {
      const newStmt = stmt as Identifier
      const vara = (env.lookupVar(newStmt.symbol)) as NumberVal ;
      const value = vara.value
      outputString += value !== undefined ? value : "undefined";
    } else if (stmt.kind === "StringLiteral") {
      const newStmt = stmt as StringLiteral
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
