import { MK_NULL } from "../runtime/values.ts";
import { AssignmentExpr, CommentExpr, Display, NewLine, IntegerLiteral, FloatLiteral, CharacterLiteral, BooleanLiteral, EscapeLiteral, Scan, LogicalExpr, IfStmt, Block, UnaryExpr } from "./ast.ts";
import {
    BinaryExpr,
    Expr,
    Identifier,
    Program,
    Stmt,
    StringLiteral,
    VarDeclaration,
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
    this.expect(TokenType.BEGIN, "The code must start with BEGIN");
    this.expect(TokenType.CODE, "The code must start with CODE");

    while (this.not_eof()) {
        const stmt = this.parse_stmt();
        if (Array.isArray(stmt)) {
            program.body.push(...stmt); // spread the array into the body
        } else if (stmt) {
            program.body.push(stmt);
        }
    }

    return program;
}


  private parse_stmt(): any {
    switch (this.at().type) {
        case TokenType.IntegerType:
        case TokenType.CharacterType:
        case TokenType.FloatType:
        case TokenType.BoolType:
            return this.parse_var_declaration(); // returns an array of declarations
        case TokenType.NextLine:
            this.eat();
            return;
        case TokenType.IF:
            return this.parse_if_stmt();
        default:
            return this.parse_expr();
    }
}


private parse_expr(): Expr {
  return this.parse_assignment_expr();
}

private parse_assignment_expr(): Expr {
  const left = this.parse_logical_expr();
  if (this.at().type == TokenType.Equals) {
    console.log("HUH");
    this.eat();
    const value = this.parse_assignment_expr();
    console.log("THE FINAL VALUE IS: ", value);
    return { value, assignee: left, kind: "AssignmentExpr" } as AssignmentExpr;
  }

  return left;
}

private parse_logical_expr(): Expr {
  let left = this.parse_comparison();

  while (this.at().type === TokenType.And || this.at().type === TokenType.Or) {
    const operator = this.eat().value;
    const right = this.parse_comparison();
    left = { kind: "BinaryExpr", operator, left, right } as BinaryExpr;
  }

  return left;
}


private parse_comparison(): Expr {
  let left = this.parse_additive_expr();

  while (["<", ">", "<=", ">=", "==", "<>"].includes(this.at().value)) {
    const operator = this.eat().value;
    const right = this.parse_additive_expr();
    left = { kind: "BinaryExpr", left, right, operator } as BinaryExpr;
  }
  return left;
}

private parse_unary_expr(): UnaryExpr {
  const operator = this.eat().type; // eat the NOT token
  const operand = this.parse_primary_expr();
  return { kind: "UnaryExpr", operator, operand } as UnaryExpr;
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

  
  private parse_primary_expr(): any {
    const tk = this.at().type
    const dataType = this.at().dataType
    console.log("TK ", this.at())
    switch(tk) {
        case TokenType.Not:
          return this.parse_unary_expr();
        case TokenType.Identifier:
            return { kind: "Identifier", symbol: this.eat().value, dataType} as Identifier;
        case TokenType.Integer:
            return { kind: "IntegerLiteral", value: parseInt(this.eat().value)} as IntegerLiteral;
        case TokenType.FloatType:
          return { kind: "FloatLiteral", value: parseFloat(this.eat().value)} as FloatLiteral;
        case TokenType.CharacterType:
          return { kind: "CharacterLiteral", value: this.eat().value} as CharacterLiteral;
        case TokenType.StringType:
          return { kind: "StringLiteral", value: this.eat().value} as StringLiteral;
        case TokenType.Comment:
          return this.parse_comment()
        case TokenType.NextLine:
            this.eat()
            return;
        case TokenType.IntegerType:
          return this.parse_var_declaration();
        case TokenType.DISPLAY:
          return this.parse_display();
        case TokenType.SCAN:
          return this.parse_scan();
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
      if (this.at().type == TokenType.Identifier)
        left.push({ kind: "Identifier", symbol: this.eat().value} as Identifier)
      else if (this.at().type == TokenType.StringType)
        left.push({ kind: "StringLiteral", value: this.eat().value} as StringLiteral)
      else if (this.at().type == TokenType.NewLine)
        left.push({ kind: "NewLine", value: this.eat().value} as NewLine)
      else if (this.at().type == TokenType.EscapeChar)
        left.push({ kind: "EscapeLiteral", value: this.eat().value} as EscapeLiteral)
      if (this.at().type == TokenType.NextLine) {
        break;
      }
      this.expect(TokenType.Concatenation, "Display expects concatatination symbol")
    }
    // console.log("DISPLAY TOKENS", left)
    return {kind: "Display", value: left} as Display
  }

  private parse_scan(): Scan {
    this.expect(TokenType.SCAN, "Expected 'SCAN' keyword.");
    this.expect(TokenType.COLON, "Expected ':' after 'SCAN'.");

    const variables: Identifier[] = [];
    do {
        const identifier = this.expect(TokenType.Identifier, "Expected identifier in SCAN statement.");
        variables.push({ kind: "Identifier", symbol: identifier.value, dataType: identifier.dataType } as Identifier);
        if (this.at().type == TokenType.COMMA) {
            this.eat();
        } else {
            break;
        }
    } while (true);

    this.expect(TokenType.NextLine, "Expected newline after SCAN statement.");

    return { kind: "Scan", variables };
}

  // LET IDENT;
  // ( LET | CONST ) IDENT = EXPR;
  parse_var_declaration(): VarDeclaration[] {
    const DataTypeVariable = this.eat();
    let DataType = "";
    switch (DataTypeVariable.value) {
        case "CHAR":
            DataType = "CharacterLiteral";
            break;
        case "FLOAT":
            DataType = "FloatLiteral";
            break;
        case "INT":
            DataType = "IntegerLiteral";
            break;
        case "BOOL":
          DataType = "BooleanLiteral";
          break;
        default:
            console.error("Unknown data type ", DataTypeVariable.value);
            process.exit(1);
    }

    const declarations: VarDeclaration[] = [];

    while (true) {
        const identifier = this.expect(
            TokenType.Identifier,
            "Expected identifier name following DATA TYPES keywords."
        ).value;
        let value: Expr
        switch(DataTypeVariable.value) {
          case "CHAR":
            value = { kind: "CharacterLiteral", value: ''} as CharacterLiteral
            break;
          case "FLOAT":
              value = { kind: "FloatLiteral", value: parseFloat("0")} as FloatLiteral
              break;
          case "INT":
              value = { kind: "IntegerLiteral", value: parseInt("0")} as IntegerLiteral
              break;
          case "BOOL":
            value = { kind: "BooleanLiteral", value: "TRUE"} as BooleanLiteral
            break;
          default:
              console.error("Unknown data type ", DataTypeVariable.value);
              process.exit(1);
        }
        if (this.at().type == TokenType.Equals) {
            this.eat(); // consume the equals token
            value = this.parse_expr();
        }

        declarations.push({
            kind: "VarDeclaration",
            identifier,
            dataType: DataType,
            value,
        });

        if (this.at().type == TokenType.NextLine || this.at().type == TokenType.EOF) {
            this.eat(); // consume nextline or EOF
            break;
        }

        if (this.at().type == TokenType.COMMA) {
            this.eat(); // consume comma
            continue; // proceed to the next declaration
        } else {
            console.error("Expected comma or end of line after variable declaration");
            process.exit(1);
        }
    }

    return declarations;
}
}