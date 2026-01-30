# Testing Guide

Comprehensive testing documentation for Big-AGI MCP Assistant.

## Table of Contents

1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Coverage Reports](#coverage-reports)
7. [Best Practices](#best-practices)

---

## Overview

This project uses a comprehensive testing strategy:

- **Unit Tests**: Jest for testing individual modules
- **E2E Tests**: Playwright for end-to-end application testing
- **Linting**: ESLint for code quality
- **CI/CD**: GitHub Actions for automated testing and deployment

### Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Jest | Unit testing framework | ^29.7.0 |
| Playwright | E2E testing | ^1.40.1 |
| ESLint | Code linting | ^8.56.0 |
| GitHub Actions | CI/CD automation | Latest |

---

## Test Types

### 1. Unit Tests

Located in `__tests__/` directory.

**Files:**
- `api-service.test.js` - Tests for API service
- `multi-api-manager.test.js` - Tests for multi-API manager
- `config.test.js` - Tests for configuration manager

**What they test:**
- Individual function behavior
- Module interactions
- Error handling
- Edge cases

### 2. E2E Tests

Located in `tests/e2e/` directory.

**Files:**
- `app.spec.js` - Application launch and UI tests

**What they test:**
- Application startup
- UI interactions
- User workflows
- Visual elements
- Premium features

### 3. Linting

**Configuration:** `.eslintrc.json`

**What it checks:**
- Code style consistency
- Common errors
- Best practices
- Unused variables

---

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install
```

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/app.spec.js
```

### Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### All Tests

```bash
# Run everything (tests + lint)
npm run release
```

---

## Writing Tests

### Unit Test Example

```javascript
// __tests__/my-module.test.js
const { MyModule } = require('../src/my-module');

describe('MyModule', () => {
  let instance;

  beforeEach(() => {
    instance = new MyModule();
  });

  test('should initialize correctly', () => {
    expect(instance).toBeDefined();
    expect(instance.property).toBe('value');
  });

  test('should handle method calls', () => {
    const result = instance.method('input');
    expect(result).toBe('expected output');
  });

  test('should throw on invalid input', () => {
    expect(() => {
      instance.method(null);
    }).toThrow('Invalid input');
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/feature.spec.js
const { test, expect } = require('@playwright/test');

test.describe('My Feature', () => {
  test('should perform action', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');

    // Interact with UI
    await page.click('#myButton');

    // Assert result
    await expect(page.locator('.result')).toHaveText('Success');
  });
});
```

---

## CI/CD Pipeline

### Automated Testing

Every push and pull request triggers:

1. **Lint Check** - Code style validation
2. **Unit Tests** - All unit tests run
3. **Coverage Report** - Test coverage calculation
4. **E2E Tests** - End-to-end validation
5. **Build Test** - Ensure app builds correctly

### Platforms

Tests run on:
- Ubuntu (Linux)
- macOS
- Windows

### Node Versions

Tests run on:
- Node 18.x
- Node 20.x

### Workflow Files

- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/release.yml` - Release builds

### Viewing Results

1. Go to repository on GitHub
2. Click "Actions" tab
3. Select workflow run
4. View test results and artifacts

---

## Coverage Reports

### Generating Coverage

```bash
npm run test:coverage
```

### Viewing Coverage

```bash
# Open HTML report
open coverage/lcov-report/index.html

# Or check console output
cat coverage/coverage-summary.json
```

### Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | >80% | Check report |
| Branches | >75% | Check report |
| Functions | >80% | Check report |
| Lines | >80% | Check report |

### Coverage Files

- `coverage/` - HTML and JSON reports
- `coverage/lcov-report/index.html` - Visual report

---

## Best Practices

### 1. Test Organization

```
✅ DO: Group related tests
describe('Feature', () => {
  describe('SubFeature', () => {
    test('specific behavior', () => {});
  });
});

❌ DON'T: Put everything in one test
test('everything', () => {
  // Too much in one test
});
```

### 2. Test Independence

```javascript
✅ DO: Clean up after each test
beforeEach(() => {
  // Fresh setup
});

afterEach(() => {
  // Clean up
});

❌ DON'T: Depend on test order
test('first', () => { globalVar = 'value'; });
test('second', () => { expect(globalVar).toBe('value'); });
```

### 3. Clear Assertions

```javascript
✅ DO: Be specific
expect(result).toBe(42);
expect(array).toHaveLength(3);
expect(object).toEqual({ key: 'value' });

❌ DON'T: Be vague
expect(result).toBeTruthy();
expect(array.length > 0).toBe(true);
```

### 4. Test Names

```javascript
✅ DO: Describe behavior
test('should return sum of two numbers', () => {});
test('should throw error for negative input', () => {});

❌ DON'T: Be unclear
test('test1', () => {});
test('it works', () => {});
```

### 5. Mock External Dependencies

```javascript
✅ DO: Mock API calls
jest.mock('../src/api', () => ({
  fetch: jest.fn(() => Promise.resolve({ data: 'mock' }))
}));

❌ DON'T: Make real API calls in tests
test('fetches data', async () => {
  const data = await fetch('https://real-api.com');
  expect(data).toBeDefined();
});
```

---

## Troubleshooting

### Tests Failing

```bash
# Clear Jest cache
npx jest --clearCache

# Re-install dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests in verbose mode
npm test -- --verbose
```

### E2E Tests Not Running

```bash
# Re-install Playwright browsers
npx playwright install --force

# Check Electron path
which electron

# Run with debug mode
DEBUG=pw:api npx playwright test
```

### Coverage Not Generating

```bash
# Ensure Jest is configured
cat package.json | grep jest -A 10

# Clear coverage directory
rm -rf coverage/
npm run test:coverage
```

---

## Advanced Testing

### Debugging Tests

```bash
# Debug Jest tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug Playwright tests
npx playwright test --debug
```

### Performance Testing

```bash
# Measure test execution time
npm test -- --verbose --listTests

# Profile Jest
node --cpu-prof node_modules/.bin/jest
```

### Visual Regression Testing

```javascript
// Playwright visual comparison
test('visual test', async ({ page }) => {
  await expect(page).toHaveScreenshot('homepage.png');
});
```

---

## Continuous Improvement

### Adding More Tests

1. Identify untested code with coverage report
2. Write tests for critical paths first
3. Add edge case tests
4. Increase coverage incrementally

### Test Maintenance

- Review and update tests when code changes
- Remove obsolete tests
- Refactor duplicated test code
- Keep tests fast and focused

### Metrics to Track

- Test execution time
- Code coverage trends
- Flaky test frequency
- CI/CD pipeline duration

---

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [ESLint Documentation](https://eslint.org/docs/latest/)

### Tutorials

- [Testing Electron Apps](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

## Getting Help

**Issues with tests?**
1. Check this documentation
2. Review error messages carefully
3. Check CI/CD logs on GitHub
4. Open an issue with details

**Contributing tests?**
1. Follow existing patterns
2. Ensure all tests pass locally
3. Add documentation if needed
4. Submit PR with test coverage

---

**Happy Testing!** 🧪

*Last updated: January 2026*
