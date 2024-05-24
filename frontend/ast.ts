export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "NullLiteral"
  // EXPRESSIONS
  | "IntegerLiteral"
  | "NumericLiteral"
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

export interface BinaryExpr extends Expr {
    left: Expr,
    right: Expr,
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier"
    value: string
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral"
    value: number
}

export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    // constant: boolean;
    
    identifier: string;
    value?: Expr;
  }

