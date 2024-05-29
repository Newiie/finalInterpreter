import {
  NumberVal,
  RuntimeVal,
  MK_NULL,
  DisplayVal,
  FloatVal,
  CharVal,
  StringVal,
  BooleanVal,
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
  IfStmt,
  Block,
  UnaryExpr,
  WhileStmt,
  BooleanLiteral,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_expr,
  eval_identifier,
  eval_logical_expr,
  eval_unary_expr,
  eval_if_stmt,
  eval_block,
  eval_while_stmt,
} from "./eval/expressions.ts";
import { error } from "console";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  // console.log("BINOP ", astNode)
  switch (astNode.kind) {
    case "IntegerLiteral":
      return {
        value: (astNode as IntegerLiteral).value,
        type: "number",
      } as NumberVal;
    case "BooleanLiteral":
      if ((astNode as BooleanLiteral).value == "TRUE") {
        return {
          value: true,
          type: "boolean",
        } as BooleanVal;
      } else {
        return {
          value: false,
          type: "boolean",
        } as BooleanVal;
      }
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
      if ((astNode as BooleanLiteral).value == "TRUE") {
        return {
          value: true,
          type: "boolean",
        } as BooleanVal;
      } else if ((astNode as BooleanLiteral).value == "FALSE") {
        return {
          value: false,
          type: "boolean",
        } as BooleanVal;
      }
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringVal;

    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
      case "UnaryExpr":
        return eval_unary_expr(astNode as UnaryExpr, env);
    case "BinaryExpr":
      // console.log("CHECK 1")
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "IfStmt":
      return eval_if_stmt(astNode as IfStmt, env);
    case "WhileStmt":
      return eval_while_stmt(astNode as WhileStmt, env);
    case "Block":
      return eval_block(astNode as Block, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
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
  let i = 0
  let length = Node.value.length
  for (i = 0; i < length; i++) {
    if (Node.value[i].kind === "BinaryExpr") {
      outputString += eval_binary_expr(Node.value[i] as BinaryExpr, env).value;
    }
    else if (Node.value[i].kind === "Identifier") {
      const newStmt = Node.value[i] as Identifier;
      console.log("ENV", env.variables);
      console.log("Hello", Node.value[i], env.lookupVar(Node.value[i].symbol))
      const vara = env.lookupVar(newStmt.symbol) as NumberVal;
      const value = vara.value;
      outputString += value !== undefined ? value : "undefined";
    }
    else if (Node.value[i].kind === "StringLiteral") {
      const newStmt = Node.value[i] as StringLiteral;
      outputString += newStmt.value;
    } 
    else if (Node.value[i].kind === "EscapeLiteral") {
      const newStmt = Node.value[i] as EscapeLiteral;
      outputString += newStmt.value;
    }
    else if (Node.value[i].kind === "NewLine") {
      outputString += "\n";
    } 
    // else {
    //   // Handle other kinds of statements if needed
    // }
    // if ()
  }
  process.stdout.write(outputString); // Output the constructed string
  return { type: "display", value: "success" } as DisplayVal;
}

function eval_scan(node: Scan, env: Environment): RuntimeVal {
  const input = prompt(
    `Enter values for ${node.variables.map((v) => v.symbol).join(", ")}:`
  )
    ?.split(",")
    .map((val) => val.trim());

  if (input && input.length === node.variables.length) {
    console.log("EVAL SCAN IF");
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
        case "DEFINED":
          console.log("LOOK UP ", env.lookupVar((variable as Identifier).symbol))
          switch(env.lookupVar((variable as Identifier).symbol).type) {
            case "char":
              value = { value: input[index], type: "char" } as CharVal;
              break;
            case "number":
              value = {
                value: parseInt(input[index]),
                type: "number",
              } as NumberVal;
              break;
            case "float":
              value = {
                value: parseFloat(input[index]),
                type: "float",
              } as FloatVal;
              case "boolean":
                let temp;
                console.log(input[index]);
                if (input[index] == "\"FALSE\"") {
                  temp = false;
                } else if (input[index] == "\"TRUE\"") {
                  temp = true;
                } else {
                  throw "Input data does not match variable datatype";
                }

                value = {
                  value: temp,
                  type: "boolean",
                } as BooleanVal;
                break;
              break;
          }
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
