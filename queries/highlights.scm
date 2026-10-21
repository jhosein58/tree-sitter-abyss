; Comments
(comment) @comment.line

; Keywords - Control
[
  "if"
  "else"
  "match"
] @keyword.control.conditional

[
  "while"
  "for"
  "in"
] @keyword.control.repeat

"ret" @keyword.control.return

[
  "break"
  "cont"
] @keyword.control

; Keywords - Definitions
"fn" @keyword.function

[
  "struct"
  "enum"
] @keyword.storage.type

[
  "import"
  "from"
] @keyword.control.import

; Keywords - Operators
[
  "as"
  "and"
  "or"
  "not"
] @keyword.operator

; Literals
[
  "true"
  "false"
] @constant.builtin.boolean

(number) @constant.numeric
(string) @string
(c_string) @string
(char) @constant.character

; Builtins & Special
"@" @special
(builtin_expression
  name: (identifier) @function.builtin)

"Self" @type.builtin
"self" @variable.builtin

(primitive_type) @type.builtin

; Functions
(binding_declaration
  name: (identifier) @function
  value: (function_expression))

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (identifier) @function.method))

; Types
(generic_type
  name: (identifier) @type)

(struct_field
  type: (identifier) @type)

(variable_declaration
  type: (identifier) @type)

(function_expression
  return_type: (identifier) @type)

(function_type
  return_type: (identifier) @type)

(pointer_type
  type: (identifier) @type)

(array_type
  element_type: (identifier) @type)

(cast_expression
  type: (identifier) @type)

(enum_expression
  backing_type: (identifier) @type)

(typed_struct_initializer
  type: (identifier) @type)

; Types bound to struct or enum
(binding_declaration
  name: (identifier) @type
  value: [(struct_expression) (enum_expression)])

; PascalCase convention for types
((identifier) @type
 (#match? @type "^[A-Z][a-zA-Z0-9_]*$"))

; Enum Variants
(enum_variant
  name: (identifier) @type.enum.variant)

; Variables and Parameters
(parameter
  name: (identifier) @variable.parameter)

(for_statement
  variables: (identifier) @variable)

(match_expression
  binder: (identifier) @variable)

(variable_declaration
  name: (identifier) @variable)

(import_item
  name: (identifier) @variable
  alias: (identifier)? @variable)

(field_expression
  field: (identifier) @variable.other.member)

(field_initializer
  name: (identifier) @variable.other.member)

(struct_field
  name: (identifier) @variable.other.member)

; Operators
[
  "::"
  ":="
  "="
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
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "**"
] @operator

; Delimiters & Punctuation
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
