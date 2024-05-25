export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "NullLiteral"
  // EXPRESSIONS
  | "IntegerLiteral"
  | "AssignmentExpr"
  | "NumericLiteral"
  | "CharacterLiteral"
  | "Identifier"
  | "BinaryExpr";

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

export interface CharacterLiteral extends Expr {
    kind: "CharacterLiteral"
    value: number
}

export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    identifier: string;
    value?: Expr;
  }

