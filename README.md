# tree-sitter-abyss

Abyss language grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

## Features

- Full coverage of modern Abyss syntax:
  - Function declarations and signatures (`name :: fn(...) RetType { ... }`)
  - Struct definitions, methods, and composite initializers (`.{ ... }`, `Type.{ ... }`)
  - Enums with explicit backing types and variants (`enum u8 { ok = 0 }`)
  - Control flow: `if` / `else`, `while`, `for` .. `in`, `match` (including `match val in v`)
  - Flow control: `ret`, `break`, `cont`
  - Casts (`expr as Type`), builtins (`@sizeof`, `@is`, `@tag`)
  - Generic types and functions (`Vec(T)`)
  - Union types (`i32 | bool`) and pointer types (`&T`, `&&T`, `*T`)
  - Modules and aliased imports (`import A, B as C from "path"`)
  - Complete literal support (integers, hex, floats, strings, c-strings, characters, booleans)
  - Single-line comments (`-- ...`)
- Queries for syntax highlighting, code folding, indentation, and text objects.

## Helix Configuration

Add to `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "abyss"
scope = "source.abyss"
injection-regex = "abyss"
file-types = ["a"]
comment-token = "--"
indent = { tab-width = 4, unit = "    " }
roots = []

[[grammar]]
name = "abyss"
source = { path = "/path/to/tree-sitter-abyss" }
```

Build the grammar in Helix:

```bash
hx --grammar build
```
