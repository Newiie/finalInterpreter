import { Token } from "./lexer";

export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "NullLiteral"
  // EXPRESSIONS
  | "Display"
  | "IntegerLiteral"
  | "AssignmentExpr"
  | "NumericLiteral"
  | "CharacterLiteral"
  | "StringLiteral"
  | "Identifier"
  | "BinaryExpr"
  
//   SPECIAL CHARACTER
  | "NewLine"
  | "CommentExpr"
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


export interface BinaryExpr extends Expr {
    left: Expr,
    right: Expr,
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
  }

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral"
    value: number
}

export interface NewLine extends Expr {
    kind: "NewLine"
    value: "\n"
}

export interface CommentExpr extends Expr {
    kind: "CommentExpr"
    value: string
}

export interface StringLiteral extends Expr {
    kind: "StringLiteral"
    value: string
}

export interface Display extends Expr {
    kind: "Display"
    value: Array<Expr>
}

export interface CharacterLiteral extends Expr {
    kind: "CharacterLiteral"
    value: string
}

export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    identifier: string;
    value?: Expr;
  }

