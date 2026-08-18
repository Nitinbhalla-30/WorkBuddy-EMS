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
