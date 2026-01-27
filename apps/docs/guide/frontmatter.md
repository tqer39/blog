# Frontmatter

Frontmatter is YAML metadata at the top of each article file. This guide explains the available fields.

## Basic Structure

Frontmatter is enclosed between triple dashes:

```yaml
---
title: Article Title
tags: [tag1, tag2]
---

Article content starts here...
```

## Required Fields

### title

The article title. This is the only required field.

```yaml
---
title: How to Use TypeScript Generics
---
```

## Optional Fields

### tags

An array of tags for categorization:

```yaml
---
title: My Article
tags: [typescript, programming, tutorial]
---
```

### category

The article category:

```yaml
---
title: My Article
category: tech
---
```

Available categories:
- `tech` - Technical articles
- `life` - Life experiences
- `books` - Book reviews
- `pta` - PTA-related

### description

A short description for SEO and previews:

```yaml
---
title: My Article
description: A brief summary of what this article covers
---
```

Keep descriptions under 160 characters for optimal display in search results.

## Status Fields

### status

Control article visibility:

```yaml
---
title: Work in Progress
status: draft
---
```

Available values:
- `draft` - Not visible to public
- `published` - Visible to all (default)

### publishedAt

Explicitly set the publish date:

```yaml
---
title: My Article
publishedAt: 2024-01-15
---
```

If not specified, the creation date is used.

### updatedAt

Track last update:

```yaml
---
title: My Article
updatedAt: 2024-02-20
---
```

## Complete Example

```yaml
---
title: Building a REST API with Hono
description: Learn how to create a type-safe REST API using Hono framework
tags: [hono, api, typescript, cloudflare-workers]
category: tech
status: published
publishedAt: 2024-01-15
updatedAt: 2024-02-20
---
```

## Date Formats

Dates can be specified in these formats:

```yaml
# ISO format (recommended)
publishedAt: 2024-01-15

# With time
publishedAt: 2024-01-15T09:30:00

# With timezone
publishedAt: 2024-01-15T09:30:00+09:00
```

## Best Practices

1. **Always include a title** - It's required and used everywhere
2. **Add relevant tags** - Helps with organization and discovery
3. **Write good descriptions** - Improves SEO and previews
4. **Use draft status** - For work-in-progress articles
5. **Keep tags consistent** - Use lowercase, hyphenated tags
