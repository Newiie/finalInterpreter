import { Program, VarDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment,
): RuntimeVal {
  // if (declaration.value?.kind == "FloatLiteral" && declaration.dataType == "IntegerLiteral") 
  if (
    (declaration.value?.kind != declaration.dataType && declaration.value?.kind != "BinaryExpr") &&
    (declaration.value?.kind != "StringLiteral" && declaration.dataType != "BooleanLiteral")
  ) throw `Initialzation not applicable DataType mismatch`
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value);
}