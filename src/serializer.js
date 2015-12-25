import transit from "transit-js";
import { List } from "immutable";
import Syntax from "./syntax";
import { TokenClass, TokenType } from "shift-parser/dist/tokenizer";

let typeMap = [TokenType.STRING, TokenType.EOS, TokenType.LPAREN, TokenType.RPAREN,
               TokenType.LBRACK, TokenType.RBRACK, TokenType.LBRACE, TokenType.RBRACE,
               TokenType.COLON, TokenType.SEMICOLON, TokenType.PERIOD, TokenType.ELLIPSIS,
               TokenType.ARROW, TokenType.CONDITIONAL, TokenType.INC, TokenType.DEC,
               TokenType.ASSIGN, TokenType.ASSIGN_BIT_OR, TokenType.ASSIGN_BIT_XOR,
               TokenType.ASSIGN_BIT_AND, TokenType.ASSIGN_SHL, TokenType.ASSIGN_SHR,
               TokenType.ASSIGN_SHR_UNSIGNED, TokenType.ASSIGN_ADD, TokenType.ASSIGN_SUB,
               TokenType.ASSIGN_MUL, TokenType.ASSIGN_DIV, TokenType.ASSIGN_MOD,
               TokenType.COMMA, TokenType.OR, TokenType.AND, TokenType.BIT_OR,
               TokenType.BIT_XOR, TokenType.BIT_AND, TokenType.SHL, TokenType.SHR,
               TokenType.SHR_UNSIGNED, TokenType.ADD, TokenType.SUB, TokenType.MUL,
               TokenType.DIV, TokenType.MOD, TokenType.EQ, TokenType.NE,
               TokenType.EQ_STRICT, TokenType.NE_STRICT, TokenType.LT, TokenType.GT,
               TokenType.LTE, TokenType.GTE, TokenType.INSTANCEOF, TokenType.IN,
               TokenType.NOT, TokenType.BIT_NOT, TokenType.AWAIT, TokenType.DELETE,
               TokenType.TYPEOF, TokenType.VOID, TokenType.BREAK, TokenType.CASE,
               TokenType.CATCH, TokenType.CLASS, TokenType.CONTINUE, TokenType.DEBUGGER,
               TokenType.DEFAULT, TokenType.DO, TokenType.ELSE, TokenType.EXPORT,
               TokenType.EXTENDS, TokenType.FINALLY, TokenType.FOR, TokenType.FUNCTION,
               TokenType.IF, TokenType.IMPORT, TokenType.LET, TokenType.NEW,
               TokenType.RETURN, TokenType.SUPER, TokenType.SWITCH, TokenType.THIS,
               TokenType.THROW, TokenType.TRY, TokenType.VAR, TokenType.WHILE,
               TokenType.WITH, TokenType.NULL, TokenType.TRUE, TokenType.FALSE,
               TokenType.YIELD, TokenType.NUMBER, TokenType.STRING, TokenType.REGEXP,
               TokenType.IDENTIFIER, TokenType.CONST, TokenType.TEMPLATE,
               TokenType.ILLEGAL];

let ListHandler = transit.makeWriteHandler({
  tag: () => "array",
  rep: (v) => v
});

let SyntaxHandler = transit.makeWriteHandler({
  tag: () => "stx",
  rep: (v) => {
    if (List.isList(v.token)) {
      return [v.token];
    } else {
      let t = transit.objectToMap(v.token);
      t.set("type", typeMap.indexOf(v.token.type));
      return [t];
    }
  }
});

let writer = transit.writer("json", {
  handlers: transit.map([
    List, ListHandler,
    Syntax, SyntaxHandler
  ])
});
let reader = transit.reader("json", {
  arrayBuilder: {
    init: (node) => List().asMutable(),
    add: (ret, val, node) => ret.push(val),
    finalize: (ret, node) => ret.asImmutable(),
    fromArray: (arr, node) => List(arr)
  },
  handlers: {
    "stx": (rep) => {
      if (List.isList(rep[0])) {
        let token = rep[0];
        return new Syntax(token);
      } else {
        let token = transit.mapToObject(rep[0]);
        token.type = typeMap[rep[0].get("type")];
        token.slice = transit.mapToObject(rep[0].get("slice"));
        return new Syntax(token);
      }
    }
  }

});

export {
  reader as deserialize, writer as serialize
};
