import { NumberVal, RuntimeVal, MK_NULL, DisplayVal } from "./values.ts";
import {
    AssignmentExpr,
  BinaryExpr,
  Display,
  Identifier,
  NumericLiteral,
//   IntegerLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import { eval_assignment, eval_binary_expr, eval_identifier } from "./eval/expressions.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
//   if (!astNode) return MK_NULL()
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value),
        type: "number",
      } as NumberVal;
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
      const value = env.lookupVar(stmt.symbol).value;
      outputString += value !== undefined ? value : "undefined";
    } else if (stmt.kind === "StringLiteral") {
      outputString += stmt.value;
    } else if (stmt.kind === "NewLine") {
      outputString += "\n";
    } else {
      // Handle other kinds of statements if needed
    }
  }
  console.log(outputString); // Output the constructed string
  return { type: "display", value: "success" } as DisplayVal;
}
