# Skills Index - Master Reference

This index helps AI agents identify and invoke the appropriate specialized skills for any task in this Next.js e-commerce project.

---

## 🔌 Skill Invocation Protocol

When a task is identified, use the `activate_skill` tool to invoke the appropriate skill:

```
activate_skill(name: "skill-name")
```

**For complex tasks requiring multiple skills:**

1.  Identify all relevant skills from this index
2.  Invoke each skill sequentially using the `skill` tool
3.  Follow the expert instructions from each skill's `SKILL.md`

---

## 🗺️ Quick Decision Tree

```
What task are you performing?
│
├─ Authentication/Clerk related?
│   ├─ Fresh setup → clerk-setup
│   ├─ Custom UI/styling → clerk-custom-ui
│   ├─ Next.js patterns (middleware, Server Actions) → clerk-nextjs-patterns
│   ├─ Database sync/webhooks → clerk-webhooks
│   └─ General Clerk questions → clerk (router)
│
├─ UI Components?
│   ├─ shadcn/ui components → shadcn-ui
│   └─ Design system/Tailwind → tailwind-design-system
│
├─ Forms?
│   └─ React Hook Form + Zod → react-hook-form-zod
│
├─ State Management?
│   └─ Redux Toolkit → redux-toolkit
│
├─ Database/Prisma?
│   └─ Schema, migrations, queries → prisma-expert
│
├─ Next.js Core?
│   ├─ Best practices/file conventions → next-best-practices
│   ├─ Caching/PPR (Next.js 16+) → next-cache-components
│   └─ Performance optimization → vercel-react-best-practices
│
├─ Architecture?
│   ├─ Project structure → project-structure
│   └─ Backend patterns (Clean/Hexagonal/DDD) → architecture-patterns
│
├─ Code Quality?
│   └─ Next.js/React/TypeScript standards → nextjs-react-redux-typescript-cursor-rules
│
└─ UI/UX Review?
    └─ Accessibility/design audit → web-design-guidelines
```

---

## ⛓️ Skill Chains (Common Recipes)

> **Note:** Use skill chains only for complex, multi-file features. For simple tasks (single file/component), invoke only the primary skill.

For complex features, chain these skills in order:

- **User Profile Form**: `shadcn-ui` (UI) → `react-hook-form-zod` (Logic) → `clerk-nextjs-patterns` (Auth Context).
- **Database Sync**: `clerk-webhooks` (Events) → `prisma-expert` (Schema/Queries).
- **Performance Audit**: `vercel-react-best-practices` (Analysis) → `next-cache-components` (Implementation).
- **New Feature Scaffolding**: `project-structure` (Placement) → `architecture-patterns` (Design) → `next-best-practices` (Logic).

---

## ⚖️ Precedence & Conflict Resolution

If multiple skills apply to a single file:

1.  **Logic over Framework**: For DB queries in a Next.js file, `prisma-expert` governs the query syntax, while `next-best-practices` governs how it's called (Server Components vs Actions).
2.  **Standards over Patterns**: `nextjs-react-redux-typescript-cursor-rules` always governs naming and file formatting (tabs vs spaces) regardless of the specific skill used.
3.  **Performance over Simplicity**: In high-traffic routes, `vercel-react-best-practices` overrides basic patterns from other skills.

---

## 📂 Skills Catalog

### 🔐 Authentication (Clerk)

| Skill                     | Primary Path Impact                       | When to Use                        | Key Features                                                           |
| ------------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| **clerk**                 | -                                         | General Clerk questions, routing   | Auto-routes to specific Clerk skills based on task                     |
| **clerk-setup**           | `middleware.ts`, `app/layout.tsx`, `.env` | Adding Clerk to project, migration | Framework detection, quickstart guides, API keys, Keyless flow         |
| **clerk-custom-ui**       | `app/(auth)/*`, `components/auth/*`       | Styling Clerk components           | Appearance prop, themes, layout, CSS customization, shadcn theme       |
| **clerk-nextjs-patterns** | `app/api/*`, Server Actions, Middleware   | Advanced Next.js + Clerk           | Server vs Client auth, middleware, Server Actions, API routes, caching |
| **clerk-webhooks**        | `app/api/webhooks/*`                      | Real-time events, DB sync          | User/org events, database synchronization, debugging, retries          |

---

### 🎨 UI & Design

| Skill                      | Primary Path Impact                     | When to Use                    | Key Features                                                            |
| -------------------------- | --------------------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| **shadcn-ui**              | `components/ui/*`, `components.json`    | Adding shadcn components       | Component discovery, installation, customization, blocks, accessibility |
| **tailwind-design-system** | `app/globals.css`, `tailwind.config.ts` | Design system with Tailwind v4 | CSS-first config, design tokens, CVA variants, dark mode, animations    |
| **web-design-guidelines**  | `components/**/*`                       | UI review, accessibility audit | Vercel Web Interface Guidelines compliance checking                     |

---

### 📝 Forms & Validation

| Skill                   | Primary Path Impact  | When to Use                         | Key Features                                                                                   |
| ----------------------- | -------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **react-hook-form-zod** | `components/forms/*` | Type-safe forms, multi-step wizards | React Hook Form v7 + Zod v4, server validation, useFieldArray, shadcn integration, performance |

---

### 🗄️ State & Data

| Skill             | Primary Path Impact                              | When to Use             | Key Features                                                           |
| ----------------- | ------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------- |
| **redux-toolkit** | `store/**/*`, `lib/store/**/*`, `app/store/**/*` | Global state management | createSlice, RTK Query, selectors, normalization, async thunks         |
| **prisma-expert** | `prisma/**/*`, `lib/db/**/*`                     | Database operations     | Schema design, migrations, query optimization, relations, transactions |

---

### ⚡ Next.js Core

| Skill                           | Primary Path Impact          | When to Use                   | Key Features                                                                                 |
| ------------------------------- | ---------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| **next-best-practices**         | `app/**/*`, `proxy.ts`       | Next.js development standards | File conventions, RSC boundaries, async patterns, metadata, error handling, route handlers   |
| **next-cache-components**       | `app/**/*`, `next.config.ts` | Next.js 16+ caching           | Partial Prerendering (PPR), `use cache`, cacheLife, cacheTag, updateTag                      |
| **vercel-react-best-practices** | -                            | Performance optimization      | 57 rules across 8 categories: waterfalls, bundle size, server/client performance, re-renders |

---

### 🏗️ Architecture & Structure

| Skill                     | Primary Path Impact        | When to Use               | Key Features                                                           |
| ------------------------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| **project-structure**     | Root, Feature folders      | File organization, audits | Colocation, feature vs layer grouping, anti-patterns detection         |
| **architecture-patterns** | `lib/**/*`, `app/domain/*` | Backend architecture      | Clean Architecture, Hexagonal, Domain-Driven Design, tactical patterns |

---

### 📋 Code Standards

| Skill                                          | Primary Path Impact | When to Use            | Key Features                                                                 |
| ---------------------------------------------- | ------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| **nextjs-react-redux-typescript-cursor-rules** | -                   | Development guidelines | SOLID principles, component architecture, TypeScript, accessibility, testing |

---

## 🛠️ Skill Invocation Reference

### Direct Invocation by Name

```
Use activate_skill: "clerk-setup"
Use activate_skill: "shadcn-ui"
Use activate_skill: "prisma-expert"
```

### Task-Based Triggers

| User Request                    | Recommended Skill                          |
| ------------------------------- | ------------------------------------------ |
| "Add authentication"            | clerk-setup                                |
| "Style the sign-in page"        | clerk-custom-ui                            |
| "Protect this route"            | clerk-nextjs-patterns                      |
| "Sync users to database"        | clerk-webhooks                             |
| "Add a button component"        | shadcn-ui                                  |
| "Create a design system"        | tailwind-design-system                     |
| "Build a form with validation"  | react-hook-form-zod                        |
| "Set up global state"           | redux-toolkit                              |
| "Optimize database queries"     | prisma-expert                              |
| "Follow Next.js best practices" | next-best-practices                        |
| "Enable caching/PPR"            | next-cache-components                      |
| "Improve performance"           | vercel-react-best-practices                |
| "Where should this file go?"    | project-structure                          |
| "Implement Clean Architecture"  | architecture-patterns                      |
| "Review my code style"          | nextjs-react-redux-typescript-cursor-rules |
| "Check accessibility"           | web-design-guidelines                      |

---

## 📊 Skill Metadata Summary

| Skill                                      | User-Invocable | Allowed Tools                                         | Risk Level |
| ------------------------------------------ | -------------- | ----------------------------------------------------- | ---------- |
| architecture-patterns                      | Yes            | -                                                     | -          |
| clerk                                      | Yes            | -                                                     | -          |
| clerk-custom-ui                            | Yes            | WebFetch                                              | -          |
| clerk-nextjs-patterns                      | Yes            | WebFetch                                              | -          |
| clerk-setup                                | Yes            | WebFetch                                              | -          |
| clerk-webhooks                             | Yes            | WebFetch                                              | -          |
| next-best-practices                        | No             | -                                                     | -          |
| next-cache-components                      | Yes            | -                                                     | -          |
| nextjs-react-redux-typescript-cursor-rules | Yes            | -                                                     | -          |
| prisma-expert                              | Yes            | -                                                     | Unknown    |
| project-structure                          | Yes            | Read, Glob, Grep                                      | -          |
| react-hook-form-zod                        | Yes            | -                                                     | -          |
| redux-toolkit                              | Yes            | -                                                     | -          |
| shadcn-ui                                  | Yes            | shadcn:\*, mcp_shadcn\*, Read, Write, Bash, web_fetch | -          |
| tailwind-design-system                     | Yes            | -                                                     | -          |
| vercel-react-best-practices                | Yes            | -                                                     | -          |
| web-design-guidelines                      | Yes            | WebFetch                                              | -          |

---

## 🏗️ Project Context

**Project Type**: Next.js E-commerce Application  
**Tech Stack**: Next.js, React, TypeScript, Redux Toolkit, Prisma, Clerk, shadcn/ui, Tailwind CSS

**Key Considerations**:

- Next.js 16+ features available (Cache Components, PPR)
- Clerk for authentication (Keyless flow enabled)
- shadcn/ui for components (check `components.json`)
- Prisma ORM for database (PostgreSQL/MySQL/SQLite)
- React 19 patterns (no forwardRef needed)
- Tailwind CSS v4 (CSS-first configuration)

---

## 🏷️ Version Information

| Skill                       | Version | Last Verified |
| --------------------------- | ------- | ------------- |
| react-hook-form-zod         | 2.1.0   | 2026-01-20    |
| clerk-\*                    | 1.0.0   | -             |
| vercel-react-best-practices | 1.0.0   | -             |
| web-design-guidelines       | 1.0.0   | -             |

---

## 📝 Notes for AI Agents

0.  **Search Index First**: Before planning any complex task, grep `.agent/skills/SKILLS-INDEX.md` for keywords related to the user request to identify relevant skills.
1.  **Check Path First**: If you are modifying files in `/prisma`, you likely need `prisma-expert`.
2.  **Verify `components.json`**: Always check this file before assuming shadcn/ui configuration.
3.  **Server by Default**: Use Server Components unless interactivity is explicitly required (`'use client'`).
4.  **No forwardRef**: Remember React 19 patterns - don't use `forwardRef` if not necessary.
5.  **Use WebFetch**: When skills require latest documentation (Clerk, shadcn).
6.  **Next.js 16+**: Use `cacheComponents: true` instead of experimental PPR flags.
7.  **Follow next-best-practices**: Apply `next-best-practices` as the default standard for all Next.js tasks (file conventions, RSC boundaries, async patterns, error handling).

---

_Generated for AI Agent Skill Selection | Ecommerce-Base Project_
