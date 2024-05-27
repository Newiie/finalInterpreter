import { Token, TokenType } from "./lexer";

export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "NullLiteral"
  | "Scan"

  // EXPRESSIONS
  | "IntegerLiteral"
  | "FloatLiteral"
  | "CharacterLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  
  | "Display"
  | "AssignmentExpr"
  | "Identifier"
  | "BinaryExpr"
  | "LogicalExpr"
  | "IfStmt"
  | "Block"
  
//   SPECIAL CHARACTER
  | "NewLine"
  | "CommentExpr"
  | "EscapeLiteral"

  ;

export interface Stmt {
    kind: NodeType
}

export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[];
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assignee: Expr;
    value: Expr;
}

export interface LogicalExpr {
    kind: "LogicalExpr";
    operator: TokenType;
    left: Expr;
    right?: Expr;
}

export interface Block extends Stmt{
    kind: "Block";
    statements: Stmt[];
  }
  
export interface IfStmt {
    kind: "IfStmt";
    condition: Expr;
    thenBranch: Block;
    elseBranch: Block | null;
}

export interface BinaryExpr extends Expr {
    left: Expr,
    right: Expr,
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
    dataType: string
  }

export interface IntegerLiteral extends Expr {
    kind: "IntegerLiteral"
    value: number,
}

export interface FloatLiteral extends Expr {
    kind: "FloatLiteral"
    value: number
}

export interface NewLine extends Expr {
    kind: "NewLine"
    value: "\n"
}

export interface EscapeLiteral extends Expr {
    kind: "EscapeLiteral"
    value: string
}

export interface CommentExpr extends Expr {
    kind: "CommentExpr"
    value: string
}

export interface StringLiteral extends Expr {
    kind: "StringLiteral"
    value: string
}

export interface BooleanLiteral extends Expr {
    kind: "BooleanLiteral"
    value: string
}

export interface Display extends Expr {
    kind: "Display"
    value: Array<Expr>
}

export interface Scan extends Stmt {
    kind: "Scan";
    variables: Identifier[];
}

export interface CharacterLiteral extends Expr {
    kind: "CharacterLiteral"
    value: string
}

export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    identifier: string;
    dataType: string
    value?: Expr;
  }

