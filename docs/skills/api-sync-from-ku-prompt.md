# API Sync from Ku Knowledge Base Prompt

Use this prompt when an API documentation source on ku.baidu-int.com has been updated and the frontend implementation needs to be synchronized.

## When to Use

- The user references a `docs/input/*.md` file and asks to sync with the latest upstream
- A ku knowledge base API document URL is provided and needs frontend alignment
- After backend API changes are announced and the frontend types/params need updating

## Required Inputs

- ku knowledge base document URL (e.g. `https://ku.baidu-int.com/knowledge/...`)
- The local `docs/input/` file that corresponds to this API doc (or `src/api/` files if no local copy exists)

```text
## Step 1 — Fetch latest from ku knowledge base

Extract the doc ID from the ku URL:
- 4-segment path → doc-id is the 4th segment (path4), repo-id is the 3rd segment (path3)

Run the ku CLI tool. The invocation depends on the host platform:

**macOS / Linux** (run directly):
```

cd ~/.comate/skills/.system/ku-doc-manage/bin
BAIDU_CC_USERNAME=<username> ./ku query-content --doc-id <doc-id> --protocol markdown

```
**Windows** (via WSL):
```

wsl bash -c "cd /mnt/c/Users/<username>/.comate/skills/.system/ku-doc-manage/bin && BAIDU_CC_USERNAME=<username> ./ku query-content --doc-id <doc-id> --protocol markdown"

```
Save the raw output to a temp file and extract the document content from the JSON `result.text` field.

## Step 2 — Update local input document

Update the corresponding `docs/input/` file (e.g. `source-api-*.md`):
1. Increment the `抓取时间` to today's date
2. Replace the whole body with the latest fetched content
3. Update the `更新内容` metadata line with a summary of what changed (diff the old vs new)

## Step 3 — Diff old vs new content

Compare the old local copy with the newly fetched content. Focus on these categories:
- **Path parameters**: URL path segment changes (e.g. `:clusterId` → `:clusterID`)
- **Query parameters**: new/removed/renamed query params
- **Response structures**: new/removed/renamed fields, type changes
- **New display/filter rules**: business logic rules now documented in the API spec

## Step 4 — Find corresponding frontend implementation

Search for the matching implementation files:

| Look for                          | Typical locations                           |
| --------------------------------- | ------------------------------------------- |
| API service functions             | `src/api/*.ts`                              |
| Entity type definitions           | `src/interface/entities/*.ts`               |
| Components consuming these APIs   | `src/pages/`, `src/components/`             |

## Step 5 — Build comparison table

For each difference found, create a table with these columns:

| # | Severity | Category | Detail | Current Code | New Spec | Affected Files |

Severity labels:
- **P0 破坏性**: breaking change — path/param rename, removed fields
- **P1 新需求**: new fields or display rules that don't break existing behavior
- **P2 预存问题**: existing code issues exposed by the diff (e.g. wrong mock data)

## Step 6 — Present to user for confirmation

Show the comparison table and ask the user to confirm which items to adjust. Wait for approval before proceeding.

## Step 7 — Adjust implementation

For each confirmed change, proceed in this order:

### Type definitions first
Edit `src/interface/entities/*.ts` — update interfaces to match new response structures.

### API params second
Edit `src/api/*.ts` — update param interfaces and endpoint path templates.

### Mock data third
If mock data exists (look for `{ mock: () => ... }`), check for mismatches with the new spec.

### Requirement docs last
For new display/filter rules discovered in the API doc, propagate them to the correct requirement documents under `docs/requirements/`.

## Step 8 — Verify

Run `yarn lint-type` and confirm it passes.

## Step 9 — Log

Append the change summary to `docs/logs/{year}/{month}-{day}.md`, listing:
- What was fetched and when
- Each file changed and what was changed
- Verification result (`yarn lint-type` passed)

## Gotchas

1. **The ku CLI is a Linux binary**: On macOS/Linux run it directly; on Windows use WSL.
```
