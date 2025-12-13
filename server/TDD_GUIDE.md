# Test-Driven Development (TDD) Guide for SweetShop Project

## What is TDD?

Test-Driven Development is a software development methodology where you write tests **before** writing the actual implementation code. This follows the **Red-Green-Refactor** cycle:

### Red-Green-Refactor Pattern

```
┌──────────────────────────────────────────────────┐
│  1. RED: Write failing tests                     │
│     - Define what the code should do             │
│     - Test fails because code doesn't exist      │
│     - Commit with prefix: [RED]                  │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│  2. GREEN: Write minimal code to pass tests      │
│     - Implement only what's needed               │
│     - Make all tests pass                        │
│     - Commit with prefix: [GREEN]                │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│  3. REFACTOR: Improve code quality               │
│     - Optimize and clean up                      │
│     - Keep tests passing                         │
│     - Commit with prefix: [REFACTOR]             │
└──────────────────────────────────────────────────┘
```

## Project Setup - What We've Done

### 1. Testing Framework Installation
```bash
npm install --save-dev jest supertest @faker-js/faker
```

**Tools installed:**
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing APIs
- **@faker-js/faker**: Generate fake test data

### 2. Project Structure
```
server/
├── src/
│   ├── controllers/
│   │   ├── __tests__/
│   │   │   ├── auth.controller.test.js
│   │   │   └── sweets.controller.test.js
│   │   ├── auth.controller.js
│   │   └── sweets.controller.js
│   ├── middleware/
│   │   └── __tests__/
│   ├── utils/
│   │   └── __tests__/
│   └── models/
│       └── __tests__/
├── jest.config.js
└── package.json
```

### 3. Test Scripts in package.json
```json
{
  "scripts": {
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## How to Run Tests

### Run all tests
```bash
npm test
```

### Watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Check coverage
```bash
npm run test:coverage
```

## TDD Workflow - Step by Step

### Phase 1: RED (Write Failing Tests)

1. **Think about requirements**
   - What should the function do?
   - What inputs does it take?
   - What outputs should it produce?
   - What edge cases exist?

2. **Write the test**
   ```javascript
   describe('register', () => {
     it('should return 400 if name is missing', async () => {
       const req = {
         body: { email: 'test@example.com', password: 'pass' }
       };
       const res = mockRes();
       
       await register(req, res);
       
       expect(res.status).toHaveBeenCalledWith(400);
     });
   });
   ```

3. **Run the test** - It should fail!
   ```bash
   npm test
   ```

4. **Commit with [RED] prefix**
   ```bash
   git add src/controllers/__tests__/auth.controller.test.js
   git commit -m "[RED] Add test for missing name validation in register"
   ```

### Phase 2: GREEN (Implement Minimal Code)

1. **Write the simplest code to make the test pass**
   ```javascript
   const register = async (req, res) => {
     const { name, email, password } = req.body;
     
     if (!name || !email || !password) {
       return res.status(400).json({ message: 'Missing fields' });
     }
     
     // ... rest of implementation
   };
   ```

2. **Run tests** - They should pass!
   ```bash
   npm test
   ```

3. **Commit with [GREEN] prefix**
   ```bash
   git add src/controllers/auth.controller.js
   git commit -m "[GREEN] Implement field validation in register"
   ```

### Phase 3: REFACTOR (Improve Code Quality)

1. **Review the code for improvements**
   - Remove duplication
   - Extract helper functions
   - Improve readability

2. **Keep tests passing** while refactoring

3. **Commit with [REFACTOR] prefix**
   ```bash
   git commit -m "[REFACTOR] Extract validation logic to helper function"
   ```

## Test Structure Best Practices

### 1. Use Descriptive Test Names
```javascript
// ❌ Bad
it('test register', () => {});

// ✅ Good
it('should return 400 if email is missing', () => {});
it('should return 409 if email already exists', () => {});
it('should create user with hashed password', () => {});
```

### 2. Follow Arrange-Act-Assert Pattern
```javascript
it('should create user and return tokens', async () => {
  // ARRANGE - Set up test data
  const userData = { name: 'John', email: 'john@example.com', password: 'pass' };
  const req = { body: userData };
  const res = mockRes();
  
  User.findOne.mockResolvedValue(null);
  User.create.mockResolvedValue({ ...userData, _id: 'user-1' });
  
  // ACT - Execute the function
  await register(req, res);
  
  // ASSERT - Verify the results
  expect(User.create).toHaveBeenCalledWith(userData);
  expect(res.status).toHaveBeenCalledWith(201);
});
```

### 3. Mock Dependencies
```javascript
// Mock the User model
jest.mock('../../models/User');

// In your test
User.findOne.mockResolvedValue(null);
User.create.mockResolvedValue({ ...userData, _id: 'user-1' });
```

### 4. Test Edge Cases
```javascript
describe('purchase', () => {
  // Positive case
  it('should reduce stock on purchase', () => {});
  
  // Error cases
  it('should return 400 if quantity is invalid', () => {});
  it('should return 404 if sweet not found', () => {});
  it('should return 400 if insufficient stock', () => {});
  
  // Boundary cases
  it('should handle quantity of 1', () => {});
  it('should handle large quantities', () => {});
});
```

## Current Tests in the Project

### Auth Controller Tests
- ✅ register - 6 test cases
- ✅ login - 5 test cases
- ✅ logout - 2 test cases
- ✅ me - 3 test cases
- ✅ refresh - 3 test cases
**Total: 19 auth tests**

### Sweets Controller Tests
- ✅ list - 3 test cases
- ✅ create - 7 test cases
- ✅ getById - 2 test cases
- ✅ update - 3 test cases
- ✅ remove - 3 test cases
- ✅ purchase - 4 test cases
- ✅ restock - 4 test cases
- ✅ search - 4 test cases
**Total: 30 sweets tests**

**Grand Total: 49 test cases**

## Git Workflow for TDD

### Commit Messages Template
```
[RED] Add test for <feature>
[GREEN] Implement <feature> to pass tests
[REFACTOR] Improve <feature> implementation
```

### Example Git History
```
commit abc123 - [RED] Add tests for register field validation
commit def456 - [GREEN] Implement field validation in register
commit ghi789 - [RED] Add test for duplicate email check
commit jkl012 - [GREEN] Implement duplicate email check
commit mno345 - [REFACTOR] Extract validation to helper
commit pqr678 - [RED] Add tests for password hashing
commit stu901 - [GREEN] Implement password hashing
```

### View Your TDD Pattern
```bash
# See your commits
git log --oneline

# Filter by pattern
git log --oneline | grep RED
git log --oneline | grep GREEN
git log --oneline | grep REFACTOR
```

## Running Tests with Different Options

### 1. Run specific test file
```bash
npm test auth.controller.test.js
```

### 2. Run tests matching pattern
```bash
npm test -- --testNamePattern="register"
```

### 3. Watch mode with coverage
```bash
npm run test:coverage -- --watch
```

### 4. Run tests with verbose output
```bash
npm test -- --verbose
```

## Common Jest Assertions

```javascript
// Equality
expect(result).toBe(value);
expect(result).toEqual(expectedObject);

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(1);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Async
expect(promise).resolves.toEqual(value);
expect(promise).rejects.toThrow();
```

## Tips for Effective TDD

### ✅ Do's
- Write one test at a time
- Keep tests simple and focused
- Test one behavior per test
- Use meaningful test names
- Mock external dependencies
- Test error cases and edge cases
- Run tests frequently
- Make meaningful commits

### ❌ Don'ts
- Write too many tests at once
- Test implementation details
- Create test interdependencies
- Skip edge cases
- Write tests after code
- Make huge commits mixing code and tests
- Ignore failing tests

## Next Steps

1. **Run the existing tests:**
   ```bash
   npm test
   ```

2. **Write new tests for:**
   - Middleware (auth.js)
   - Utilities (tokens.js)
   - Models validation
   - API integration tests

3. **Follow the Red-Green-Refactor cycle:**
   - Write failing test
   - Implement code
   - Refactor if needed
   - Commit with appropriate prefix

4. **Achieve high coverage:**
   ```bash
   npm run test:coverage
   ```
   Aim for at least 80% coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

## Summary

TDD helps you:
- ✅ Write cleaner, more maintainable code
- ✅ Catch bugs early
- ✅ Have confidence when refactoring
- ✅ Document expected behavior
- ✅ Create reliable applications
- ✅ Have a clear development history with git

**Happy Testing! 🚀**
