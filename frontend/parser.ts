import { AssignmentExpr, CommentExpr, Display, NewLine, NumericLiteral } from "./ast.ts";
import {
    BinaryExpr,
    Expr,
    Identifier,
    Program,
    Stmt,
    StringLiteral,
    VarDeclaration
  } from "./ast.ts";

  import { Token, tokenize, TokenType, KEYWORDS } from "./lexer.ts";

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
    console.log(" TOKENS ", this.tokens)
    while (this.not_eof()) {
      // if (this.at().type == TokenType.NextLine) this.eat();
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): any {
    // skip to parse_expr
    switch (this.at().type) {
      case TokenType.IntegerType:
      case TokenType.CharacterType:
        return this.parse_var_declaration();
      case TokenType.NextLine:
        this.eat();
        return
      default:
        return this.parse_expr();
    }
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  parse_assignment_expr(): Expr {
    const left = this.parse_additive_expr();

    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr();
      return {value, assignee: left, kind: "AssignmentExpr"} as AssignmentExpr
    }

    return left;
  }

  private parse_primary_expr(): any {
    const tk = this.at().type

    switch(tk) {
        case TokenType.Identifier:
            return { kind: "Identifier", symbol: this.eat().value} as Identifier;
        case TokenType.Number:
            return { kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;
        case TokenType.Comment:
          return this.parse_comment()
        case TokenType.NextLine:
            this.eat()
            return;
        case TokenType.IntegerType:
          return this.parse_var_declaration();
        case TokenType.DISPLAY:
          return this.parse_display();

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
  parse_comment(): any {
    while (this.at().type != TokenType.NextLine) {
      console.log("AT, ", this.at())
      this.eat()
    }
  }

  parse_display(): any {
    this.expect(TokenType.DISPLAY, "This expects DISPLAY KEYWORD")
    let left: Expr[] = []
    while (true) {
      console.log("THISSS ", this.at().type)
      
      if (this.at().type == TokenType.Identifier)
        left.push({ kind: "Identifier", symbol: this.eat().value} as Identifier)
      else if (this.at().type == TokenType.StringType)
        left.push({ kind: "StringLiteral", value: this.eat().value} as StringLiteral)
      else if (this.at().type == TokenType.NewLine)
        left.push({ kind: "NewLine", value: this.eat().value} as NewLine)
      if (this.at().type == TokenType.NextLine) {
        break;
      }
      this.expect(TokenType.Concatenation, "Display expects concatatination symbol")
    }-
    console.log("DISPLAY TOKENS", left)
    return {kind: "Display", value: left} as Display
  }

  // LET IDENT;
  // ( LET | CONST ) IDENT = EXPR;
  parse_var_declaration(): Stmt {
    // const isConstant = this.eat().type == TokenType.Const;
    // this.eat()
    const DataType = this.eat();
    console.log("DATA TYPE ", DataType)
    if (!KEYWORDS[DataType.value]) {
      console.error("Unkown data type ", DataType.value)
      process.exit(1)
    }
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following DATA TYPES keywords.",
    ).value;

    if (this.at().type == TokenType.NextLine && this.at().type == TokenType.EOF) {
      this.eat(); // expect semicolon

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