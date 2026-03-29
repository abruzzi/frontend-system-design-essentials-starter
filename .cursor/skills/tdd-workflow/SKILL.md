---
name: tdd-workflow
description: Follow the project's Test-Driven Development workflow using Vitest, React Testing Library, user-event, and MSW when implementing or modifying behavior
---

# Test-Driven Development Workflow

This skill implements the rules/tdd.mdc guidance in more detail for day‑to‑day work.

## When to use

Use this workflow when:

- implementing new features
- fixing bugs
- modifying existing behavior
- refactoring behavior with test coverage added first

This project prefers a test-first workflow:

1. write a failing test first
2. implement the smallest change needed to make it pass
3. refactor only after tests are green

The goal is to keep changes safe, incremental, and easy to reason about.

---

## Testing stack

Use the testing tools already used in this project:

- Vitest for unit and component tests
- React Testing Library for rendering and querying UI
- @testing-library/user-event for realistic user interactions
- MSW for mocking network requests
- jest-axe for accessibility assertions when relevant
- Playwright only for browser-level or smoke scenarios

Prefer the smallest test level that gives enough confidence.

- use Vitest and Testing Library by default
- use MSW for networking behavior
- use Playwright only when browser-level behavior really needs it

---

## Test file location

Place test files close to the file under test.

Prefer a `__tests__` directory near the source file.

Example structure:

src/board-page/board/ListView.tsx  
src/board-page/board/__tests__/ListView.test.tsx

src/components/Button.tsx  
src/components/__tests__/Button.test.tsx

For non-React modules:

src/utils/formatDate.ts  
src/utils/__tests__/formatDate.test.ts

---

## Naming conventions

### Test file names

Use these conventions:

- ComponentName.test.tsx for React components
- moduleName.test.ts for non-React modules

### describe block names

Use describe blocks to group tests by unit or behavior.

Example:

describe('ListView', () => {
  describe('assignee field', () => {
    it('shows the assignee field by default', () => {})
    it('hides the assignee field when disabled', () => {})
  })
})

### Test descriptions

Use specification-by-example descriptions.

Prefer:

- "hides the assignee column when assignee display is disabled"
- "shows loading state while data is being fetched"
- "renders the selected value after the user chooses an option"

Avoid vague names like:

- "works"
- "handles state"
- "tests ListView"

Good test names describe:

- the scenario
- the action or condition
- the expected outcome

---

## Test structure

Organize tests using **given / when / then**.

Example:

it('hides the assignee field when assignee display is disabled', () => {
  // given
  render(<ListView showAssignee={false} items={items} />)

  // when
  const assigneeHeader = screen.queryByRole('columnheader', { name: /assignee/i })

  // then
  expect(assigneeHeader).not.toBeInTheDocument()
})

Prefer small focused tests rather than large tests with many assertions.

---

## Core TDD workflow

For each change:

1. identify one small observable behavior
2. write a test for that behavior first
3. run the new test and confirm it fails
4. implement the minimum code needed to make it pass
5. run the relevant tests again
6. refactor only after tests are green
7. repeat for the next behavior

---

## Running tests

Prefer running the smallest relevant scope first.

Run a single test file:

npm test -- src/board-page/board/__tests__/ListView.test.tsx

Run tests by name:

npm test -- -t "hides the assignee field"

After the targeted test passes:

npm test
npm run lint

---

## Query guidance

Prefer React Testing Library queries in this order:

- getByRole
- getByLabelText
- getByText
- getByPlaceholderText

Use:

- queryBy... when asserting absence
- findBy... for async UI changes

Use data-testid only as a last resort.

---

## User interactions

Prefer userEvent over lower-level event simulation.

Use it for:

- clicking
- typing
- keyboard navigation
- selecting options
- tabbing

Tests should resemble real user interactions.

---

## Mocking and stubbing

### Networking

Use **MSW** for network mocking.

Test UI behavior around:

- loading
- success
- empty state
- error state

Avoid manually mocking fetch when possible.

### Module mocking

Avoid broad module mocking when possible.

Prefer:

1. real behavior
2. provider setup
3. MSW for HTTP boundaries
4. module mocking only as a last resort

---

## Refactoring guidance

Refactor only after tests pass.

Refactor to:

- improve naming
- remove duplication
- simplify logic
- split large functions
- improve readability

Avoid introducing abstractions without clear benefit.

---

## Output expectations

When applying this skill:

- place tests near the source file in `__tests__`
- write the failing test first
- organize tests using `describe`
- use specification-by-example test descriptions
- run the smallest relevant test first
- prefer MSW for networking mocks
- avoid module mocking unless necessary
- implement minimal code to pass the test
- refactor only after tests pass
