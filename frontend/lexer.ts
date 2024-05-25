export enum TokenType {
    Number,
    Identifier,
    Equals,

    // DATA TYPE
    IntegerType,
    CharacterType,
    BoolType,
    StringType,

    // RESERVED
    BEGIN,
    END,

    // SPECIAL CHARCTERS
    NextLine,
    OpenParen, CloseParen,
    BinaryOperator,
    SemiColon,
    EOF,
    Let,
}

export interface Token {
    value: string,
    type: TokenType
}

export const KEYWORDS: Record<string, TokenType> = {
    INT: TokenType.IntegerType,
    CHAR: TokenType.CharacterType,
    BOOL: TokenType.BoolType,
    STRING: TokenType.StringType,
    BEGIN: TokenType.BEGIN,
    END: TokenType.EOF
  };

function token(value = "", type: TokenType): Token {
    return {value, type};
}

/**
 * Returns true if the character is whitespace like -> [\s, \t, \n]
 */
function isskippable(str: string) {
    return str == " " || str == "\t" || str == "\r";
}
  
/**
 Return whether the character is a valid integer -> [0-9]
*/
function isint(str: string) {
const c = str.charCodeAt(0);
const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
return c >= bounds[0] && c <= bounds[1];
}

/**
 * Returns whether the character passed in alphabetic -> [a-zA-Z]
 */
function isalpha(src: string) {
    return src.toUpperCase() != src.toLowerCase();
}

export function tokenize(srouceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = srouceCode.split("");

    while (src.length > 0) {
        // BEGIN PARSING ONE CHARACTER TOKENS
        if (src[0] == "(") {
          tokens.push(token(src.shift(), TokenType.OpenParen));
        } else if (src[0] == ")") {
          tokens.push(token(src.shift(), TokenType.CloseParen));
        } // HANDLE BINARY OPERATORS
        else if (
          src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
          src[0] == "%"
        ) {
          tokens.push(token(src.shift(), TokenType.BinaryOperator));
        } // Handle Conditional & Assignment Tokens
        else if (src[0] == "=") {
          tokens.push(token(src.shift(), TokenType.Equals));
        } else if (src[0] == "\n") {
          tokens.push(token(src.shift(), TokenType.NextLine));
        } // HANDLE MULTICHARACTER KEYWORDS, TOKENS, IDENTIFIERS ETC...
        else {
          // Handle numeric literals -> Integers
          if (isint(src[0])) {
            let num = "";
            while (src.length > 0 && isint(src[0])) {
              num += src.shift();
            }
    
            // append new numeric token.
            tokens.push(token(num, TokenType.Number));
          } // Handle Identifier & Keyword Tokens.
          else if (isalpha(src[0])) {
            let ident = "";
            while (src.length > 0 && isalpha(src[0])) {
              ident += src.shift();
            }
    
            // CHECK FOR RESERVED KEYWORDS
            const reserved = KEYWORDS[ident];
            // If value is not undefined then the identifier is
            // reconized keyword
            if (typeof reserved == "number") {
              tokens.push(token(ident, reserved));
            } else {
              // Unreconized name must mean user defined symbol.
              tokens.push(token(ident, TokenType.Identifier));
            }
          } else if (isskippable(src[0])) {
            // Skip uneeded chars.
            src.shift();
          } // Handle unreconized characters.
          // TODO: Impliment better errors and error recovery.
          else {
            console.error(
              "Unreconized character found in source: ",
              src[0].charCodeAt(0),
              src[0],
            );
            process.exit(1);
          }
        }
      }

      // tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
    return tokens
}