const PREC = {
  ASSIGN: 1,
  LOGIC_OR: 2,
  LOGIC_AND: 3,
  COMPARE: 4,
  BIT_OR: 5,
  BIT_XOR: 6,
  BIT_AND: 7,
  SHIFT: 8,
  TERM: 9,
  FACTOR: 10,
  CAST: 11,
  UNARY: 12,
  CALL: 13,
  INDEX: 14,
  MEMBER: 15,
};

module.exports = grammar({
  name: 'abyss',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  conflicts: $ => [
    [$.function_expression],
    [$.parameter, $._type],
    [$.struct_field, $._type],
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.import_statement,
      $.binding_declaration,
      $.variable_declaration,
      $.while_statement,
      $.for_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.expression_statement,
    ),

    comment: _ => token(seq('--', /[^\r\n]*/)),

    import_statement: $ => seq(
      'import',
      comma_separated1($.import_item),
      'from',
      field('source', $.string),
      optional(';'),
    ),

    import_item: $ => seq(
      field('name', $.identifier),
      optional(seq('as', field('alias', $.identifier))),
    ),

    binding_declaration: $ => prec(PREC.ASSIGN, seq(
      field('name', $.identifier),
      '::',
      field('value', $._expression),
      optional(choice(',', ';')),
    )),

    variable_declaration: $ => seq(
      field('name', $.identifier),
      choice(
        seq(':=', field('value', $._expression)),
        seq(
          ':',
          field('type', $._type),
          optional(seq(
            choice('=', ':'),
            field('value', $._expression),
          )),
        ),
      ),
      optional(';'),
    ),

    return_statement: $ => prec.right(seq(
      'ret',
      optional($._expression),
      optional(';'),
    )),

    break_statement: _ => seq('break', optional(';')),
    continue_statement: _ => seq('cont', optional(';')),

    expression_statement: $ => seq(
      $._expression,
      optional(';'),
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    _expression: $ => choice(
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.cast_expression,
      $.call_expression,
      $.builtin_expression,
      $.field_expression,
      $.index_expression,
      $.struct_initializer,
      $.typed_struct_initializer,
      $.function_expression,
      $.struct_expression,
      $.enum_expression,
      $.if_expression,
      $.match_expression,
      $.block,
      $.parenthesized_expression,
      $.identifier,
      'self',
      $.primitive_type,
      $.literal,
    ),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._expression),
      field('operator', choice(
        '=', '+=', '-=', '*=', '/=', '%=',
        '&=', '|=', '^=', '<<=', '>>=',
      )),
      field('right', $._expression),
    )),

    binary_expression: $ => choice(
      ...[
        ['or', PREC.LOGIC_OR],
        ['and', PREC.LOGIC_AND],
        ['==', PREC.COMPARE],
        ['!=', PREC.COMPARE],
        ['<', PREC.COMPARE],
        ['<=', PREC.COMPARE],
        ['>', PREC.COMPARE],
        ['>=', PREC.COMPARE],
        ['|', PREC.BIT_OR],
        ['^', PREC.BIT_XOR],
        ['&', PREC.BIT_AND],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['+', PREC.TERM],
        ['-', PREC.TERM],
        ['*', PREC.FACTOR],
        ['/', PREC.FACTOR],
        ['%', PREC.FACTOR],
      ].map(([op, p]) => prec.left(p, seq(
        field('left', $._expression),
        field('operator', op),
        field('right', $._expression),
      )))
    ),

    unary_expression: $ => prec(PREC.UNARY, seq(
      field('operator', choice('-', 'not', '~', '&', '*', '&&', '**')),
      field('argument', $._expression),
    )),

    cast_expression: $ => prec(PREC.CAST, seq(
      field('value', $._expression),
      'as',
      field('type', $._type),
    )),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    builtin_expression: $ => prec(PREC.CALL, seq(
      '@',
      field('name', $.identifier),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq(
      '(',
      comma_separated($._expression),
      ')',
    ),

    field_expression: $ => prec(PREC.MEMBER, seq(
      field('argument', $._expression),
      '.',
      field('field', $.identifier),
    )),

    index_expression: $ => prec(PREC.INDEX, seq(
      field('argument', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    struct_initializer: $ => seq(
      '.',
      '{',
      repeat(seq($.field_initializer, optional(choice(',', ';')))),
      '}',
    ),

    typed_struct_initializer: $ => prec(PREC.MEMBER, seq(
      field('type', $._expression),
      '.',
      '{',
      repeat(seq($.field_initializer, optional(choice(',', ';')))),
      '}',
    )),

    field_initializer: $ => seq(
      field('name', $.identifier),
      ':',
      field('value', $._expression),
    ),

    function_expression: $ => seq(
      'fn',
      field('parameters', $.parameter_list),
      optional(field('return_type', $._type)),
      optional(field('body', $.block)),
    ),

    parameter_list: $ => seq(
      '(',
      comma_separated($.parameter),
      ')',
    ),

    parameter: $ => choice(
      seq(
        comma_separated1(field('name', choice('self', $.identifier))),
        field('type', $._type),
      ),
      field('type', $._type),
    ),

    struct_expression: $ => seq(
      'struct',
      '{',
      repeat($._struct_item),
      '}',
    ),

    _struct_item: $ => choice(
      $.binding_declaration,
      $.struct_field,
    ),

    struct_field: $ => seq(
      comma_separated1(field('name', $.identifier)),
      optional(':'),
      field('type', $._type),
      optional(choice(',', ';')),
    ),

    enum_expression: $ => seq(
      'enum',
      optional(field('backing_type', $._type)),
      '{',
      repeat($._enum_item),
      '}',
    ),

    _enum_item: $ => choice(
      $.binding_declaration,
      $.enum_variant,
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(seq('=', field('value', $._expression))),
      optional(choice(',', ';')),
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', choice($.if_expression, $.block)),
      )),
    )),

    while_statement: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $.block),
    ),

    for_statement: $ => seq(
      'for',
      field('variables', comma_separated_no_trailing($.identifier)),
      'in',
      field('iterators', comma_separated_no_trailing($._expression)),
      field('body', $.block),
    ),

    match_expression: $ => seq(
      'match',
      choice(
        seq(
          field('binder', $.identifier),
          'in',
          field('value', $._expression),
        ),
        field('value', $._expression),
      ),
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      choice(
        field('pattern', comma_separated_no_trailing($._expression)),
        'else',
      ),
      field('body', $.block),
      optional(choice(',', ';')),
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    _type: $ => choice(
      $.primitive_type,
      'Self',
      $.identifier,
      $.pointer_type,
      $.array_type,
      $.generic_type,
      $.function_type,
      $.union_type,
      $.parenthesized_type,
    ),

    pointer_type: $ => prec(PREC.UNARY, seq(
      choice('&', '*', '&&', '**'),
      field('type', $._type),
    )),

    array_type: $ => seq(
      '[',
      optional(field('size', choice($.number, $.identifier))),
      ']',
      field('element_type', $._type),
    ),

    generic_type: $ => prec(PREC.CALL, seq(
      field('name', choice('Self', $.identifier)),
      '(',
      comma_separated($._type),
      ')',
    )),

    function_type: $ => prec.right(seq(
      'fn',
      field('parameters', $.parameter_list),
      optional(field('return_type', $._type)),
    )),

    union_type: $ => prec.left(PREC.BIT_OR, seq(
      field('left', $._type),
      '|',
      field('right', $._type),
    )),

    parenthesized_type: $ => seq('(', $._type, ')'),

    primitive_type: _ => choice(
      'u8', 'u16', 'u32', 'u64', 'u128',
      'i8', 'i16', 'i32', 'i64', 'i128',
      'f16', 'f32', 'f64', 'f128',
      'bool', 'unit', 'type',
    ),

    literal: $ => choice(
      $.number,
      $.string,
      $.c_string,
      $.char,
      $.boolean,
    ),

    number: _ => token(choice(
      /0[xX][0-9a-fA-F][0-9a-fA-F_]*/,
      /0[bB][01][01_]*/,
      /0[oO][0-7][0-7_]*/,
      /[0-9][0-9_]*\.[0-9_]+([eE][+-]?[0-9][0-9_]*)?/,
      /[0-9][0-9_]*[eE][+-]?[0-9][0-9_]*/,
      /[0-9][0-9_]*/,
    )),

    string: _ => token(seq(
      '"',
      repeat(choice(
        seq('\\', choice(/x[0-9a-fA-F]{2}/, /./)),
        /[^"\\\r\n]/,
      )),
      '"',
    )),

    c_string: _ => token(seq(
      'c"',
      repeat(choice(
        seq('\\', choice(/x[0-9a-fA-F]{2}/, /./)),
        /[^"\\\r\n]/,
      )),
      '"',
    )),

    char: _ => token(seq(
      "'",
      choice(
        seq('\\', choice(/x[0-9a-fA-F]{2}/, /./)),
        /[^'\\\r\n]/,
      ),
      "'",
    )),

    boolean: _ => choice('true', 'false'),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});

function comma_separated(rule) {
  return optional(seq(rule, repeat(seq(',', rule)), optional(',')));
}

function comma_separated1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}

function comma_separated_no_trailing(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
