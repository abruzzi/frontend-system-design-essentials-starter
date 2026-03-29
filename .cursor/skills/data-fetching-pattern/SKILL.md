---
name: data-fetching-pattern
description: Follow the project's standard data fetching workflow using custom hooks, AbortController, MSW, and test-first practices for reliable and consistent data access
---

# Data Fetching Pattern

This skill defines how data fetching should be implemented and tested in this project.

It ensures consistency in:

- how data is requested
- how loading and error states are handled
- how requests are cancelled
- how behavior is tested

The goal is to keep data fetching predictable, testable, and aligned with the project's architecture.

---

## When to use

Use this workflow when:

- adding a feature that fetches data from an API
- modifying an existing data-fetching flow
- refactoring data access logic
- introducing new backend integration

Prefer this pattern over ad-hoc `fetch` calls inside components.

---

## Core principles

Follow these principles when implementing data fetching:

- keep data fetching logic inside **custom hooks**
- keep components focused on **rendering UI**
- always handle **loading, success, and error states**
- cancel in-flight requests when no longer needed
- test behavior from the user's perspective

---

## Implementation structure

### Create a custom hook

Encapsulate all data fetching logic in a hook.

Example:

```ts
function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchTasks() {
      try {
        setLoading(true)

        const response = await fetch('/api/tasks', {
          signal: controller.signal,
        })

        const data = await response.json()
        setTasks(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()

    return () => controller.abort()
  }, [])

  return { tasks, loading, error }
}
```

### Test examples for the `data-fetching-pattern` skill

To make the tests concrete, let’s assume we have a component like this:

```tsx
function TaskList() {
  const { tasks, loading, error } = useTasks()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Something went wrong</div>
  if (tasks.length === 0) return <div>No tasks found</div>

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

---

## 1. Loading state

This test verifies that the loading state appears while the request is still in progress.

```tsx
it('shows loading state while data is being fetched', () => {
  // given
  server.use(
    http.get('/api/tasks', async () => {
      await delay('infinite')
      return HttpResponse.json([])
    })
  )

  render(<TaskList />)

  // then
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

---

## 2. Success with data

This verifies that the UI renders data returned from the backend.

```tsx
it('renders tasks when data is returned', async () => {
  // given
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.json([
        { id: 1, title: 'Write tests' },
        { id: 2, title: 'Refactor component' },
      ])
    })
  )

  render(<TaskList />)

  // when
  const firstTask = await screen.findByText('Write tests')
  const secondTask = await screen.findByText('Refactor component')

  // then
  expect(firstTask).toBeInTheDocument()
  expect(secondTask).toBeInTheDocument()
})
```

---

## 3. Success with empty data

This checks the empty state explicitly.

```tsx
it('renders empty state when the server returns no tasks', async () => {
  // given
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.json([])
    })
  )

  render(<TaskList />)

  // when
  const emptyState = await screen.findByText('No tasks found')

  // then
  expect(emptyState).toBeInTheDocument()
})
```

---

## 4. Error state

This verifies that the UI handles a failed request properly.

```tsx
it('shows an error message when the request fails', async () => {
  // given
  server.use(
    http.get('/api/tasks', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(<TaskList />)

  // when
  const errorMessage = await screen.findByText('Something went wrong')

  // then
  expect(errorMessage).toBeInTheDocument()
})
```

---

## 5. Replacing loading with data

This is a nice behavioral test because it checks the transition, not just the final state.

```tsx
it('replaces the loading state with fetched tasks', async () => {
  // given
  server.use(
    http.get('/api/tasks', async () => {
      await delay(100)
      return HttpResponse.json([{ id: 1, title: 'Prepare demo' }])
    })
  )

  render(<TaskList />)

  // then
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // when
  const task = await screen.findByText('Prepare demo')

  // then
  expect(task).toBeInTheDocument()
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```
