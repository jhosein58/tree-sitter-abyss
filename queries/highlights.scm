(line_comment) @comment
(block_comment) @comment

[
  "import"
  "from"
  "struct"
  "if"
  "else"
  "while"
  "for"
  "in"
  "loop"
  "match"
  "return"
  "ret"
  "break"
  "continue"
  "and"
  "or"
  "not"
  "is"
  "true"
  "false"
  "null"
  "nil"
  "NONE"
] @keyword

(function_definition name: (identifier) @function)
(call_expression function: (identifier) @function.call)
(call_expression function: (field_expression field: (identifier) @function.method))
(primitive_type) @type.builtin
(type_identifier) @type
(constant_identifier) @constant
(parameter type: (type_identifier) @type)
(struct_field type: (type_identifier) @type)
(function_definition return_type: (type_identifier) @type)
(parameter name: (identifier) @variable.parameter)
(struct_field name: (identifier) @variable.member)
(field_expression field: (identifier) @variable.member)
(number) @number
(string) @string
(c_string) @string
(char) @character
(escape_sequence) @string.escape
