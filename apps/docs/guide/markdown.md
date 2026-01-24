# Markdown Basics

This guide covers the basic Markdown syntax for writing blog articles.

## Headings

Use `#` symbols to create headings. The number of `#` determines the level:

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

::: tip
Use headings hierarchically. Don't skip levels (e.g., don't jump from h2 to h4).
:::

## Lists

### Unordered Lists

Use `-`, `*`, or `+` for bullet points:

```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

### Ordered Lists

Use numbers followed by a period:

```markdown
1. First item
2. Second item
   1. Nested first
   2. Nested second
3. Third item
```

## Links

### External Links

```markdown
[Link text](https://example.com)
```

### Internal Links

Link to other articles or pages:

```markdown
[Another article](/articles/01EXAMPLE123456789012345)
```

### Anchor Links

Link to a heading within the same page:

```markdown
[Jump to Lists](#lists)
```

## Text Emphasis

### Bold

```markdown
**bold text**
```

### Italic

```markdown
*italic text*
```

### Strikethrough

```markdown
~~strikethrough text~~
```

### Combined

```markdown
***bold and italic***
```

## Blockquotes

Use `>` for quotes:

```markdown
> This is a quote.
> It can span multiple lines.

> Nested quotes work too:
> > Like this
```

## Tables

Create tables with pipes and hyphens:

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Alignment

Use colons to align columns:

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
```

## Horizontal Rules

Create a horizontal line with three or more hyphens, asterisks, or underscores:

```markdown
---
```

or

```markdown
***
```

## Inline Code

Wrap code with backticks:

```markdown
Use the `console.log()` function.
```

## Escape Characters

Use backslash to escape special characters:

```markdown
\*not italic\*
\# not a heading
```
