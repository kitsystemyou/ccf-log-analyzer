---
name: ccf-log-analyzer-ci
description: >-
  Use this skill when configuring, updating, or maintaining GitHub Actions CI workflows for automated TypeScript unit testing in ccf-log-analyzer.
---

# ccf-log-analyzer GitHub Actions CI Workflow Guide

This skill provides guidelines and configurations for automated unit testing via GitHub Actions CI in `ccf-log-analyzer`.

---

## 1. Workflow Configuration File
The workflow is defined in `.github/workflows/test.yml`.

```yaml
name: TypeScript Unit Tests

on:
  push:
    branches:
      - main
      - 'feat/**'
  pull_request:
    branches:
      - main

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Vitest unit tests
        run: npm test
```

---

## 2. Trigger Conditions
- **push**: Triggers on pushes to the `main` branch or any feature branch matching `feat/**`.
- **pull_request**: Triggers when a Pull Request is opened or updated targeting the `main` branch.

---

## 3. Maintenance Procedures
1. Whenever new dependencies or build scripts are added to `package.json`, verify that `npm ci` succeeds cleanly without lockfile conflicts.
2. Ensure all unit tests in `src/lib/__tests__/*.test.ts` pass locally (`npm test`) before pushing code to trigger CI pipelines.
