import { NumericLiteral } from "./ast.ts";
import {
    BinaryExpr,
    Expr,
    Identifier,
    Program,
    Stmt,
    VarDeclaration
  } from "./ast.ts";

  import { Token, tokenize, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof () : boolean {
      return this.tokens[0].type != TokenType.EOF
  }

  private at() {
      return this.tokens[0] as Token;
  }
  private eat() {
      const prev = this.tokens.shift() as Token;
      return prev;
  }

  private peek() : Token {
      return this.tokens[0] as Token
  }

  private expect(type: TokenType, err: any) {
    const nextToken = this.peek();
    //checks if it is END OF FILE
    if (err === "Variable declaration statment must end with nextline." && nextToken.type == TokenType.EOF) {
      return nextToken;
    } 

    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      process.exit(1);
    }

    return prev;
  }
  
  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };
    this.expect(TokenType.BEGIN, "The code must start with begin")
    // Parse until end of file
    // console.log(" TOKENS ", this.tokens)
    while (this.not_eof()) {
      // if (this.at().type == TokenType.NextLine) this.eat();
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): any {
    // skip to parse_expr
    console.log(" TYPE ", this.at())
    switch (this.at().type) {
      case TokenType.IntegerType:
      case TokenType.CharacterType:
      case TokenType.Identifier:
        return this.parse_var_declaration();
      case TokenType.NextLine:
        console.log("WHAT IS EATEN: ", this.eat())
        return
      default:
        return this.parse_expr();
    }
  }

  private parse_expr(): Expr {
    return this.parse_additive_expr();
  }


  private parse_primary_expr(): any {
    const tk = this.at().type

    switch(tk) {
        case TokenType.Identifier:
            return { kind: "Identifier", value: this.eat().value} as Identifier;
        case TokenType.Number:
            return { kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;
        case TokenType.NextLine:
            this.eat()
            return;
        case TokenType.IntegerType:
          return this.parse_var_declaration();

        case TokenType.OpenParen: {
          this.eat(); // eat the opening paren
          const value = this.parse_expr();
          this.expect(
            TokenType.CloseParen,
            "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
          ); // closing paren
          return value;
        }
        default:
            console.error("Unexpected token found during parsing! ", this.at())
            process.exit(1)
    }
    
  }

  // LET IDENT;
  // ( LET | CONST ) IDENT = EXPR;
  parse_var_declaration(): Stmt {
    // const isConstant = this.eat().type == TokenType.Const;
    // this.eat()
    const DataType = this.eat();
    console.log("DATA TYPE ", DataType)
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords.",
    ).value;

    if (this.at().type == TokenType.NextLine && this.at().type == TokenType.EOF) {
      this.eat(); // expect semicolon
      // if (isConstant) {
      //   throw "Must assigne value to constant expression. No value provided.";
      // }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration.",
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      // constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.NextLine,
      "Variable declaration statment must end with nextline.",
    );

    return declaration;
  }
      
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }
}