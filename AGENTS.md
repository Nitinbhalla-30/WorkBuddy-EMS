# WorkBuddy EMS — Agent Instructions

## Graphify knowledge graph (query-first)

This project has a graphify knowledge graph at `graphify-out/graph.json` (957 nodes, 3027 edges covering all code and SQL schemas).

Before answering any architecture/codebase question, or grepping/reading many source files, consult the graph first:

```bash
graphify query "<question>" --graph "graphify-out/graph.json"   # scoped subgraph for a plain-language question
graphify path "A" "B" --graph "graphify-out/graph.json"         # shortest path between two concepts
graphify explain "X" --graph "graphify-out/graph.json"          # plain-language explanation of a node
```

Also useful:
- `graphify-out/GRAPH_REPORT.md` — god nodes, communities, surprising connections (broad architecture review).
- `graphify-out/graph.html` — interactive visualization, open in any browser.

Keep the graph current: after meaningful code changes run `graphify update .` (local AST only, no LLM/API cost). Commit `graphify-out/` so the map travels with the repo; add `graphify-out/cost.json` to `.gitignore` if it appears.

## Deploying — pushing to `main` is the deploy

`.github/workflows/deploy.yml` builds and publishes the site to Cloudflare Pages
(`workbuddy-ems`, production branch `main`) on **every push to `main`**. So a normal
`git commit` + `git push origin main` is a complete deploy on its own.

**Do not also run `npm run deploy` after a push.** It publishes the identical build to the
same project a second time — nothing breaks, but it burns a deploy and confuses the
deployment history. Choose one path per change:

```bash
npm run deploy     # manual fallback: use ONLY when you need to deploy without pushing —
                   # uncommitted local work, or an Actions run that failed/was skipped
```

`--commit-dirty=true` on that command is deliberate: it stops wrangler complaining when the
working tree has uncommitted changes, since the local `dist/` build is what gets uploaded.

If both paths really are needed for the same commit (e.g. a manual deploy to unblock the user
while the Actions queue is slow), ask first — otherwise assume the push is enough and report
the Actions run instead of re-deploying.
