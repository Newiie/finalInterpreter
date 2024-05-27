export enum TokenType {
  Integer,
  Identifier,
  Equals,

  // DATA TYPE
  IntegerType,
  CharacterType,
  BoolType,
  StringType,
  FloatType,
  // RESERVED
  BEGIN,
  END,
  DISPLAY,
  SCAN,
  IF,
  ELSE,
  ELSEIF,
  BEGINIF,
  ENDIF,
  // SPECIAL CHARACTERS
  NextLine,
  EscapeChar,
  Comment,
  OpenParen, CloseParen,
  BinaryOperator,
  ComparisonOperator,
  SemiColon,
  Concatenation,
  NewLine,
  EOF,
  CODE,
  COLON,
  COMMA,
  Let,
  And,
  Or,
  Not,
}

export interface Token {
  value: string,
  type: TokenType,
  dataType: string
}

export const KEYWORDS: Record<string, TokenType> = {
  INT: TokenType.IntegerType,
  FLOAT: TokenType.FloatType,
  CHAR: TokenType.CharacterType,
  BOOL: TokenType.BoolType,
  STRING: TokenType.StringType,
  BEGIN: TokenType.BEGIN,
  END: TokenType.EOF,
  CODE: TokenType.CODE,
  DISPLAY: TokenType.DISPLAY,
  SCAN: TokenType.SCAN,
  AND: TokenType.And,
  OR: TokenType.Or,
  NOT: TokenType.Not,
};

function token(value = "", type: TokenType, dataType = ""): Token {
  return {value, type, dataType};
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
  return /^[0-9]$/.test(str);
}

/**
* Returns whether the character passed in alphabetic -> [a-zA-Z]
*/
function isalpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

export function tokenize(srouceCode: string): any[] {
  const tokens = new Array<Token>();
  const src = srouceCode.split("");

  while (src.length > 0) {
      // BEGIN PARSING ONE CHARACTER TOKENS
      if (src[0] == "(") {
          tokens.push(token(src.shift(), TokenType.OpenParen));
      } else if (src[0] == ")") {
          tokens.push(token(src.shift(), TokenType.CloseParen));
      } else if (src[0] == "&") {
          tokens.push(token(src.shift(), TokenType.Concatenation));
      } else if (src[0] == "$") {
          tokens.push(token(src.shift(), TokenType.NewLine));
      } else if (src[0] == ",") {
        tokens.push(token(src.shift(), TokenType.COMMA));
      } else if (src[0] == ":") {
        tokens.push(token(src.shift(), TokenType.COLON));
      } else if (src[0] == "[") {
        src.shift() // eats [
        tokens.push(token(src.shift(), TokenType.EscapeChar));
        if (src[0]!= "]") throw `Escape character espects ']'`
        src.shift()

      } else if (src[0] == "#") {
          tokens.push(token(src.shift(), TokenType.Comment));
          while(src.length > 0 && src[0] != "\n") {
            src.shift()
          }
      } else if (src[0] == "\'") {
          src.shift();
          tokens.push(token(src.shift(), TokenType.CharacterType));
          src.shift();
      } else if (src[0] == "\"") {
          let ident = "";
          src.shift();
          while (src.length > 0 && src[0] != "\"") {
              ident += src.shift();
          }
          if (src[0] != "\"") {
              console.error("Expected closing \"");
              process.exit(1);
          }
          src.shift();
          tokens.push(token(ident, TokenType.StringType));
      } // HANDLE BINARY OPERATORS
      else if ( 
        (src[0] === '+' && !isint(src[1])) || (src[0] === '-' && !isint(src[1]))  || src[0] == "*" || src[0] == "/" ||
          src[0] == "%" || (["<", ">", "<=", ">=", "==", "<>"].includes(src[0]))
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
          if (isint(src[0]) || (src[0] === '-' && isint(src[1])) || (src[0] === '+' && isint(src[1]))) {
              let num = "";
              let isFloat = false;

              // Handle potential unary operators
              if (src[0] === '-' || src[0] === '+') {
                  num += src.shift(); // Add the unary operator to the number
              }

              while (src.length > 0 && isint(src[0])) {
                  num += src.shift();
              }

              // Check for decimal point and fractional part
              if (src.length > 0 && src[0] === ".") {
                  isFloat = true;
                  num += src.shift(); // Include the decimal point

                  // Process fractional part
                  while (src.length > 0 && isint(src[0])) {
                      num += src.shift();
                  }
              }

              // Determine the type of the numeric literal
              const tokenDataType = tokens[tokens.length - 3]?.value;

              if (isFloat || tokenDataType === "FLOAT") {
                  tokens.push(token(num, TokenType.FloatType));
              } else {
                  tokens.push(token(num, TokenType.Integer));
              }
              // append new numeric token.

          } // Handle Identifier & Keyword Tokens.
          else if (isalpha(src[0]) || src[0] == "_") {
              const token_data_type = tokens[tokens.length - 3];
              while (src.length > 0) {
                  let ident = "";
                  while (src.length > 0 && (isalpha(src[0]) || src[0] == "_")) {
                      ident += src.shift();
                  }

                  // CHECK FOR RESERVED KEYWORDS
                  const reserved = KEYWORDS[ident];
                  // If value is not undefined then the identifier is
                  // recognized keyword
                  
                  if (typeof reserved == "number") {
                      if (ident == "DISPLAY" && src.shift() != ":") {
                          throw `DISPLAY command not found do you mean DISPLAY: ?`;
                      }
                      tokens.push(token(ident, reserved));
                      console.log("WENT", src[0])
                  } else {
                      // Unrecognized name must mean user defined symbol.
                      if (ident == "") break;
                      // console.log("LAST TOKEN ", tokens[tokens.length - 3])
                      while (src.length > 0 && (src[0] != "=" && src[0] != "\n" && src[0] != "\r" && src[0] != " " && src[0] != "," && src[0] != ")")) {
                          ident += src.shift();
                      }
                      console.log("IDENT", ident)
                      switch (token_data_type.value) {
                          case "FLOAT":
                              tokens.push(token(ident, TokenType.Identifier, "FloatLiteral"));
                              break;
                          case "CHAR":
                              tokens.push(token(ident, TokenType.Identifier, "CharacterLiteral"));
                              break;
                          case "BOOL":
                            tokens.push(token(ident, TokenType.Identifier, "BooleanLiteral"));
                            break;
                          default:
                              tokens.push(token(ident, TokenType.Identifier, "IntegerLiteral"));
                      }
                      
                  }
                  while (src[0] === " ") {
                    src.shift()
                  }
                  if (src[0] == ",") {
                    
                    tokens.push(token(src.shift(), TokenType.COMMA));
                  } else break;
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
  return tokens;
}
