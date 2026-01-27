# Coding Conventions

## Language & Style

- **Language**: TypeScript (strict mode)
- **Formatter**: Biome (replaces ESLint + Prettier)
- **Line width**: 80 characters
- **Indent**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `ArticleCard.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Files (types) | camelCase | `article.ts` |
| React Components | PascalCase | `ArticleCard` |
| Functions | camelCase | `getArticles` |
| Constants | SCREAMING_SNAKE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `Article`, `ApiResponse` |
| Env vars | SCREAMING_SNAKE | `CMS_API_KEY` |

## File Organization

### Components

```text
ComponentName/
├── index.tsx          # Main component (re-export)
├── ComponentName.tsx  # Implementation
├── ComponentName.test.tsx  # Tests
└── types.ts           # Component-specific types
```

### API Handlers (Hono)

```typescript
// handlers/{resource}.ts
export const getArticles = factory.createHandlers(...);
export const getArticleById = factory.createHandlers(...);
```

## Commit Message Convention

Format: `<type>(<scope>): <description>`

| Type | Use case |
|------|----------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Formatting |
| refactor | Code restructure |
| test | Tests |
| chore | Maintenance |

Example: `feat(blog): add dark mode toggle`

## Testing Conventions

- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `e2e/*.spec.ts`
- Test framework: Vitest (unit), Playwright (E2E)
- Coverage target: 80% for src/lib/

## Import Order

1. React/Next.js
2. External packages
3. Internal packages (@blog/*)
4. Relative imports (components, utils)
5. Types
6. Styles

## Error Handling

- API: Return structured error responses with status codes
- Frontend: Use error boundaries for component errors
- Logging: Use console.error for errors, avoid console.log in production
