; --- Keywords ---
[
  "if"
  "else"
  "while"
  "for"
  "loop"
  "match"
] @keyword.control

[
  "return"
  "ret"
] @keyword.control.return

[
  "break"
  "continue"
] @keyword.control

[
  "import"
  "from"
] @keyword.control.import

"struct" @keyword.storage.type

[
  "and"
  "or"
  "not"
  "as"
  "is"
  "in"
] @keyword.operator

; --- Functions ---
(function_definition
  name: (identifier) @function)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (field_identifier) @function.method))

; --- Types & Constants ---
(primitive_type) @type.builtin
(type_identifier) @type
(constant_identifier) @constant

; --- Variables & Fields ---
(parameter_list (identifier) @variable.parameter)
(struct_field name: (field_identifier) @variable.other.member)
(field_expression field: (field_identifier) @variable.other.member)
(identifier) @variable

; --- Literals ---
(boolean) @constant.builtin.boolean
(null) @constant.builtin
(number) @constant.numeric
(string) @string
(c_string) @string
(char) @constant.character
(escape_sequence) @constant.character.escape

; --- Comments ---
(line_comment) @comment.line
(block_comment) @comment.block

; --- Operators & Punctuation ---
[
  "="
  ":="
  "+="
  "-="
  "*="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "/"
  "%"
  "&"
  "|"
  "^"
  "~"
  "<<"
  ">>"
  ".."
  "->"
  "=>"
  "::"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "."
] @punctuation.delimiter
