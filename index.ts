
import fs from 'fs';
import { TokenType, tokenize } from './frontend/lexer';
import Parser from './frontend/parser'
import { evaluate } from "./runtime/interpreter.ts";
import Environment from "./runtime/environment.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER } from "./runtime/values.ts";

fs.readFile(`./test.txt`, "utf8", (err, data) => {
    if (err) {
      console.error("No such file with .CODE extension found.");
      return;
    }

    const tokenized = tokenize(data)
    // console.log(tokenized)
    if (tokenized[tokenized.length - 2].type != TokenType.EOF) {
      console.error("All codes are placed inside BEGIN CODE and END CODE!")
      return;
    }
    const parser = new Parser()
    const env = new Environment();

    // Create Default Global Enviornment
    // env.declareVar("x", MK_NUMBER(100));
    env.declareVar("true", MK_BOOL(true));
    env.declareVar("false", MK_BOOL(false));
    // env.declareVar("null", MK_NULL(), false);

    // console.log(env.lookupVar("x"))
    // console.log(env.lookupVar("true"))
    // console.log(env.lookupVar("false"))
    // console.log(env.lookupVar("null"))

    const ast = parser.produceAST(data)
    // console.log("AST ", ast)
    let filteredArray = ast.body.filter(element => element !== undefined);
    ast.body = filteredArray
    console.log("FILTERED ", filteredArray)
    const result = evaluate(ast, env);
    console.log("NO ERROR!")
    console.log(result);
});

