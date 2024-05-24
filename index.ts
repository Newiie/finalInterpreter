
import fs from 'fs';
import { tokenize } from './lexer';
// import Parser from './frontend/parser'
// import { evaluate } from "./runtime/interpreter.ts";
// import Environment from "./runtime/environment.ts";
// import { MK_BOOL, MK_NULL, MK_NUMBER } from "./runtime/values.ts";

fs.readFile(`./test.txt`, "utf8", (err, data) => {
    if (err) {
      console.error("No such file with .CODE extension found.");
      return;
    }

    const tokenized = tokenize(data)
    console.log(tokenized)
    // const parser = new Parser()
    // const env = new Environment();

    // Create Default Global Enviornment
    // env.declareVar("x", MK_NUMBER(100), false);
    // env.declareVar("true", MK_BOOL(true), false);
    // env.declareVar("false", MK_BOOL(false), false);
    // env.declareVar("null", MK_NULL(), false);

    // console.log(env.lookupVar("x"))
    // console.log(env.lookupVar("true"))
    // console.log(env.lookupVar("false"))
    // console.log(env.lookupVar("null"))

    // const ast = parser.produceAST(data)
    // console.log("AST ", ast)
    // const result = evaluate(ast, env);
    // console.log(result);
    // for (const token of tokenized) {
    //     console.log(token)
    // }
});

