# Blog APP — Project Spec for the Agent

## 1. Goal

Build the **frontend** of a full-stack Blog App and connect it to my **existing backend**. The result will be a CV portfolio project, so quality, polish, and a live demo link matter more than adding extra features.

**Do not invent new backend features.** Use what the backend already has and make it feel complete in the UI.

## 2. Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend (exists) | Express.js, TypeScript, Sequelize, MySQL |
| Validation | Zod (backend); mirror the same rules on frontend forms |
| Auth | JWT dual tokens (access + refresh) |

Use TypeScript everywhere.

## 3. Existing Backend Features (do not rebuild)

- JWT dual-token auth (access + refresh)
- Rate limiters
- Zod request validation
- RBAC (role-based access control)
- Soft delete
- Business constraints (rules enforced server-side)

**First task: read the backend code** (routes, controllers, Zod schemas, models, middleware) and write `docs/API.md` listing every endpoint, its method, auth/role requirement, request body, response shape, and error format. Build the frontend against that file. If anything is unclear or missing, ask me instead of guessing.

## 4. Frontend Requirements

### Pages (adjust to match the real API)
- Home: paginated list of posts
- Post detail
- Register and Login
- Create / Edit post (authors)
- My posts / dashboard
- Admin views, only if the backend roles support them
- 404 and error pages

### Auth handling
- Store and send the access token the way the backend expects (check whether refresh is a cookie or in the body).
- On `401`, silently call the refresh endpoint once, retry the request, and log out if refresh fails.
- Protect routes by auth state and role; hide UI the user's role can't use, but never rely on that for security.

### API client
- One typed API layer (`lib/api`) with a single fetch/axios instance, interceptors, and typed responses.
- No API calls scattered inside components.

### Error and edge-case handling
- Show Zod validation errors from the backend next to the matching form fields.
- Handle `429` (rate limit) with a friendly message and disable the submit button briefly.
- Soft delete: deleted items disappear from normal lists; add a restore/trash view only if the backend exposes it.
- Show backend business-rule errors as clear messages, not raw errors.
- Loading skeletons, empty states, and error states on every data view.

### UI/UX
- Fully responsive (mobile first), clean and modern look.
- Dark mode is a nice-to-have.
- Accessible: labels, focus states, keyboard navigation, semantic HTML.
- Use `react-hook-form` + `zod` for forms.

## 5. Suggested Structure

```
blog-app/
├── backend/          # existing
├── frontend/
│   ├── app/          # routes
│   ├── components/
│   ├── lib/api/      # typed API client
│   ├── lib/auth/     # token + refresh logic
│   ├── hooks/
│   └── types/
└── docs/API.md
```

## 6. Environment Variables

Frontend: `NEXT_PUBLIC_API_URL`

Backend (already exist, document them in `.env.example`): DB credentials, JWT secrets, token expiries, `CLIENT_URL` (for CORS).

Never commit real secrets.

## 7. Deployment (zero cost)

- **Frontend:** Vercel is preferred. GitHub Pages only works for a static export, which would limit Next.js features, so avoid it unless there is a reason.
- **Backend:** I have never deployed a backend. Find a free option for a Node/Express app, and a free MySQL-compatible database. **Check current free tiers first, since they change often**, then recommend one option with step-by-step instructions.
- Expect cold starts on free tiers. Add a loading state for the first request.
- Configure CORS for the deployed frontend URL.
- If the refresh token is a cookie and the frontend and backend are on different domains, set the cookie to `SameSite=None; Secure` and use `credentials: "include"`.
- Run Sequelize migrations on the hosted database.
- Add a health-check endpoint if one does not exist.

## 8. Definition of Done

- All existing backend features work end to end through the UI.
- No TypeScript or ESLint errors; `npm run build` passes.
- Frontend and backend are both deployed and connected, with a working live link.
- Seed data or a demo account so a recruiter can try it immediately.
- A strong `README.md` (see below).

## 9. README (for my CV)

Include: project summary, live demo link, screenshots or GIF, tech stack, features list, architecture diagram (frontend ↔ API ↔ MySQL), auth flow explanation, how to run locally, env var table, and a short "What I learned / design decisions" section.

## 10. Learning Mode (Important)

This project is primarily for **learning**. Act as a mentor, not just a code generator.

- **Teach as you build.** Before each major step, briefly explain what we're about to do and why. After it, summarize what was done and the key concept behind it.
- **Name the pattern.** When you use a best practice or design pattern (for example the API client layer, the token refresh interceptor, a custom hook, the container/presentational split, server vs client components, error boundaries), say what it is, why it's used, and what the alternative would have been.
- **Explain trade-offs.** When there are multiple valid approaches (state management, data fetching, token storage, folder structure), show the options, recommend one, and tell me why.
- **Use analogies** for abstract concepts, and keep explanations short and practical, with code examples rather than theory.
- **Point out mistakes to avoid.** Mention common pitfalls (security, performance, accessibility, hydration issues) when they're relevant.
- **Let me try first when it's valuable.** For key concepts, sometimes give me a small task or ask me to predict the outcome before showing the solution.
- **Leave learning notes.** Keep a `docs/LEARNING_NOTES.md` file and add a short entry per major step: the concept, why it matters, and one interview-style question with its answer.
- **Review my code honestly.** If I write or change something, give direct feedback on what's good and what could be improved.
- **Don't skip steps silently.** If you take a shortcut, tell me and explain what the "proper" way would be.

## 11. Working Rules for the Agent

- Work in small steps and explain what you did after each one.
- Ask me before making big decisions (new libraries, changing backend code).
- Prefer simple, readable code over clever code, because I need to understand and explain it in interviews.
- Do not change backend behavior unless a bug blocks the frontend. If it does, tell me first.