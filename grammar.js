/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGN: 1,
  OR: 2,
  AND: 3,
  BIT_OR: 4,
  BIT_XOR: 5,
  BIT_AND: 6,
  EQUAL: 7,
  COMPARE: 8,
  SHIFT: 9,
  RANGE: 10,
  ADD: 11,
  MULT: 12,
  UNARY: 13,
  CALL: 14,
  FIELD: 15,
};

module.exports = grammar({
  name: 'abyss',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.import_statement,
      $.function_definition,
      $.constant_definition,
      $.type_definition,
      $.struct_definition,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.loop_statement,
      $.match_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.expression_statement,
      $.block
    ),

    line_comment: $ => token(seq('--', /.*/)),
    block_comment: $ => token(seq('-<', /([^-]|-[^>])*/, '>-')),

    import_statement: $ => seq(
      'import',
      optional(field('name', $.identifier)),
      optional(seq('from', field('source', choice($.string, $.identifier)))),
      optional(';')
    ),

    function_definition: $ => seq(
      field('name', $.identifier),
      '::',
      field('parameters', $.parameter_list),
      optional(seq('->', field('return_type', $._type))),
      field('body', $.block)
    ),

    constant_definition: $ => seq(
      field('name', $.constant_identifier),
      '::',
      field('value', $._expression),
      optional(';')
    ),

    type_definition: $ => seq(
      field('name', $.type_identifier),
      '::',
      field('value', choice($.struct_definition, $._type)),
      optional(';')
    ),

    struct_definition: $ => seq(
      'struct',
      '{',
      repeat(seq($.struct_field, optional(choice(',', ';')))),
      '}'
    ),

    struct_field: $ => seq(
      field('name', $.field_identifier),
      ':',
      field('type', $._type)
    ),

    parameter_list: $ => seq(
      '(',
      commaSep(seq(field('name', $.identifier), ':', field('type', $._type))),
      ')'
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),

    if_statement: $ => seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.if_statement, $.block))))
    ),

    while_statement: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $.block)
    ),

    for_statement: $ => seq(
      'for',
      field('variable', $.identifier),
      'in',
      field('iterator', $._expression),
      field('body', $.block)
    ),

    loop_statement: $ => seq(
      'loop',
      field('body', $.block)
    ),

    match_statement: $ => seq(
      'match',
      field('value', $._expression),
      '{',
      repeat($.match_arm),
      '}'
    ),

    match_arm: $ => seq(
      field('pattern', $._expression),
      '=>',
      choice($.block, seq($._statement, optional(',')))
    ),

    return_statement: $ => seq(
      choice('return', 'ret'),
      optional($._expression),
      optional(';')
    ),

    break_statement: $ => seq('break', optional(';')),
    continue_statement: $ => seq('continue', optional(';')),

    expression_statement: $ => seq(
      $._expression,
      optional(';')
    ),

    _expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.field_expression,
      $.assignment_expression,
      $.identifier,
      $.constant_identifier,
      $.type_identifier,
      $.literal,
      $.parenthesized_expression
    ),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._expression),
      field('operator', choice(
        '=', ':=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='
      )),
      field('right', $._expression)
    )),

    binary_expression: $ => {
      const table = [
        ['or', PREC.OR],
        ['and', PREC.AND],
        ['|', PREC.BIT_OR],
        ['^', PREC.BIT_XOR],
        ['&', PREC.BIT_AND],
        ['==', PREC.EQUAL],
        ['!=', PREC.EQUAL],
        ['is', PREC.EQUAL],
        ['<', PREC.COMPARE],
        ['<=', PREC.COMPARE],
        ['>', PREC.COMPARE],
        ['>=', PREC.COMPARE],
        ['in', PREC.COMPARE],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['..', PREC.RANGE],
        ['+', PREC.ADD],
        ('-', PREC.ADD),
        ('*', PREC.MULT),
        ('/', PREC.MULT),
        ('%', PREC.MULT),
      ];

      return choice(...table.map(([op, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', op),
          field('right', $._expression)
        ))
      ));
    },

    unary_expression: $ => prec(PREC.UNARY, choice(
      seq(choice('not', '!', '-', '~'), $._expression)
    )),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $._expression),
      field('arguments', $.argument_list)
    )),

    argument_list: $ => seq(
      '(',
      commaSep($._expression),
      ')'
    ),

    field_expression: $ => prec(PREC.FIELD, seq(
      field('argument', $._expression),
      '.',
      field('field', $.field_identifier)
    )),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')'
    ),

    literal: $ => choice(
      $.number,
      $.string,
      $.c_string,
      $.char,
      $.boolean,
      $.null
    ),

    number: $ => token(choice(
      /0[xX][0-9a-fA-F][0-9a-fA-F_]*/,
      /0[bB][01][01_]*/,
      /0[oO][0-7][0-7_]*/,
      /[0-9][0-9_]*\.[0-9_]+([eE][+-]?[0-9][0-9_]*)?/,
      /[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*/,
      /[0-9][0-9_]*/
    )),

    string: $ => seq(
      '"',
      repeat(choice(
        $.escape_sequence,
        token.immediate(/[^"\\]+/)
      )),
      '"'
    ),

    c_string: $ => seq(
      'c"',
      repeat(choice(
        $.escape_sequence,
        token.immediate(/[^"\\]+/)
      )),
      '"'
    ),

    char: $ => seq(
      "'",
      choice(
        $.escape_sequence,
        token.immediate(/[^'\\]/)
      ),
      "'"
    ),

    escape_sequence: $ => token.immediate(choice(
      /\\[nrtf0'"\\]/,
      /\\x[0-9a-fA-F]{2}/,
      /\\u\{[0-9a-fA-F]+\}/,
      /\\./
    )),

    boolean: $ => choice('true', 'false'),
    null: $ => choice('null', 'nil', 'NONE'),

    _type: $ => choice(
      $.primitive_type,
      $.type_identifier
    ),

    primitive_type: $ => token(choice(
      'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
      'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
      'f16', 'f32', 'f64', 'f128',
      'bool', 'unit', 'char', 'str'
    )),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    field_identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    constant_identifier: $ => /[A-Z][A-Z0-9_]*/,
    type_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,
  }
});

function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule)), optional(',')));
}
