# TDD Git Workflow Guide

## Quick Start: Git Setup for TDD

### 1. Initialize Git Repository (if not already done)
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "[INIT] Initial project setup with TDD framework and comprehensive tests"
```

## TDD Commit Workflow

### Step-by-Step TDD Example

#### Phase 1: RED (Write Failing Tests)
```bash
# 1. Write your test file
# 2. Check test fails
npm test -- --testNamePattern="your test name"

# 3. Stage and commit
git add src/controllers/__tests__/your.test.js
git commit -m "[RED] Add test for feature X validation"
```

Example:
```bash
git add src/controllers/__tests__/auth.controller.test.js
git commit -m "[RED] Add tests for register field validation"
```

#### Phase 2: GREEN (Write Minimal Code)
```bash
# 1. Implement the feature
# 2. Run tests - they should pass
npm test

# 3. Stage and commit
git add src/controllers/auth.controller.js
git commit -m "[GREEN] Implement field validation in register"
```

#### Phase 3: REFACTOR (Improve Code)
```bash
# 1. Refactor code (keep tests passing)
# 2. Run tests to verify
npm test

# 3. Stage and commit
git add src/controllers/auth.controller.js
git commit -m "[REFACTOR] Extract validation to helper function"
```

## Git Commands for TDD

### View Your TDD History
```bash
# See all commits
git log --oneline

# See only RED commits
git log --oneline --grep="\[RED\]"

# See only GREEN commits
git log --oneline --grep="\[GREEN\]"

# See only REFACTOR commits
git log --oneline --grep="\[REFACTOR\]"
```

### Example Output
```
abc1234 [REFACTOR] Extract validation to utils
def5678 [GREEN] Implement email validation
ghi9012 [RED] Add test for duplicate email check
jkl3456 [REFACTOR] Improve error messages
mno7890 [GREEN] Implement required fields validation
pqr1234 [RED] Add test for missing fields
stu5678 [INIT] Initial project setup
```

### Count Your Test Cases
```bash
# Count all [RED] commits (number of test suites)
git log --oneline --grep="\[RED\]" | wc -l

# Count all [GREEN] commits (number of implementations)
git log --oneline --grep="\[GREEN\]" | wc -l
```

## Useful Git Flags for TDD

### Pretty Print Log
```bash
git log --oneline --graph --all --decorate
```

### See Changes in Commit
```bash
git show <commit-hash>
git diff <commit1> <commit2>
```

### Amend Last Commit (if you made a mistake)
```bash
# Add more files to last commit
git add .
git commit --amend --no-edit

# Change commit message
git commit --amend -m "[GREEN] New message"
```

### Undo Changes
```bash
# Undo uncommitted changes
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## GitHub Repository Setup

### 1. Create Remote Repository
- Go to GitHub.com
- Click "New Repository"
- Name it: `sweetshop-tdd`
- Don't initialize with README

### 2. Connect Local to Remote
```bash
git remote add origin https://github.com/YOUR-USERNAME/sweetshop-tdd.git
```

### 3. Push to GitHub
```bash
# First time
git branch -M main
git push -u origin main

# Subsequent pushes
git push
```

### 4. View on GitHub
```bash
# See history on GitHub
https://github.com/YOUR-USERNAME/sweetshop-tdd/commits/main

# Filter by commit message
https://github.com/YOUR-USERNAME/sweetshop-tdd/commits/main?grep=%5BRED%5D
```

## Best Practices

### ✅ Good Git Practices for TDD
1. **Atomic commits** - One logical change per commit
   ```bash
   git commit -m "[RED] Add test for X"
   git commit -m "[GREEN] Implement X"
   git commit -m "[REFACTOR] Improve X"
   ```

2. **Clear messages** - Explain what and why
   ```bash
   git commit -m "[GREEN] Implement user registration with password hashing"
   ```

3. **Frequent commits** - After each phase
   ```bash
   # After writing test
   git commit -m "[RED] Add register validation tests"
   
   # After implementation
   git commit -m "[GREEN] Add field validation to register"
   
   # After cleanup
   git commit -m "[REFACTOR] Extract validation logic"
   ```

4. **Push regularly**
   ```bash
   git push  # After completing a feature
   ```

### ❌ Avoid These Mistakes
- ❌ Large commits mixing tests and code
- ❌ Vague commit messages like "bug fix"
- ❌ Forgetting [RED], [GREEN], [REFACTOR] tags
- ❌ Not running tests before committing
- ❌ Committing failing tests without [RED] tag

## Viewing Your TDD Progress

### Count Test Coverage by Commits
```bash
# See how many features you've completed
git log --oneline | grep "\[GREEN\]" | wc -l

# See how many tests you've written
git log --oneline | grep "\[RED\]" | wc -l
```

### Example Report
```
Total Test Suites Written: 15 ([RED] commits)
Total Features Implemented: 14 ([GREEN] commits)
Total Refactorings: 8 ([REFACTOR] commits)
Overall Coverage: ~85%
```

## CI/CD Integration (Optional)

### GitHub Actions Example
Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

## Tips for Success

1. **Write one test at a time** 🔴
2. **Make it pass with minimal code** 🟢
3. **Refactor and commit** 🔵
4. **Push to GitHub** 📤
5. **Repeat!** 🔄

## Quick Reference

```bash
# Start a new feature
git checkout -b feature/user-authentication

# Write test
npm test -- --watch

# Commit test
git add .
git commit -m "[RED] Add authentication tests"

# Implement
# Run tests
npm test

# Commit implementation
git commit -m "[GREEN] Implement authentication"

# Refactor if needed
git commit -m "[REFACTOR] Improve auth module"

# Push
git push origin feature/user-authentication

# Create PR on GitHub
# ... merge to main
```

---

**Remember: Red → Green → Refactor → Commit → Repeat! 🚀**
