import { test, expect } from '@playwright/test'

test.describe('Board Operations', () => {
  test.beforeEach(async ({ page, request }) => {
    // Reset server state before each test
    try {
      await request.post('http://localhost:4000/api/test/reset')
    } catch {
      console.log('Note: Test reset endpoint not available.')
    }

    // Navigate to the board
    await page.goto('/')

    // Wait for the board to load
    await page.waitForSelector('article', { timeout: 10000 })

    // Wait for board to finish loading (cards should have IDs)
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('article span.font-mono')
      return cards.length > 0 && cards[0].textContent?.trim().length > 0
    }, { timeout: 10000 })

    // Give a moment for SSE connections and final rendering to settle
    await page.waitForTimeout(500)
  })

  test('should load board and display cards', async ({ page }) => {
    // Check that the header loaded (with user profile)
    await expect(page.locator('header')).toBeVisible()

    // Verify cards are visible (should have multiple cards)
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible()

    // Check that we have multiple cards
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Check that at least one card has a title
    const firstCardTitle = cards.first().locator('h3')
    await expect(firstCardTitle).toBeVisible()
  })

  test('should assign user to card', async ({ page }) => {
    // Use the THIRD card (first might be hard-coded)
    const thirdCard = page.locator('article').nth(2)

    // Click the assignee button to open the popover
    const assigneeButton = thirdCard.locator('button[aria-label="Open assignee picker"]')
    await assigneeButton.click()

    // Wait for the react-select control to appear
    await page.waitForSelector('.rs__control', { timeout: 5000 })

    // Type to trigger the menu to open and load users
    await page.locator('.rs__control input').type('a')

    // Wait for menu to appear with options
    await page.waitForSelector('.rs__option', { timeout: 10000 })

    // Select the first user from the dropdown
    const firstOption = page.locator('.rs__option').first()
    await expect(firstOption).toBeVisible()
    await firstOption.click()

    // Wait for popover to close and verify assignment
    await page.waitForTimeout(1000)
    const buttonText = await assigneeButton.textContent()
    expect(buttonText?.trim()).not.toBe('?')
  })

  test('should delete card', async ({ page }) => {
    // Get initial card count
    const initialCardCount = await page.locator('article').count()
    expect(initialCardCount).toBeGreaterThan(1) // Need at least 2 cards

    // Use the SECOND card (TICKET-1 is hard-coded and can't be deleted)
    const secondCard = page.locator('article').nth(1)
    const cardId = await secondCard.locator('span.font-mono').textContent()

    // Open card menu
    const menuButton = secondCard.locator('button[aria-label="Open card menu"]')
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // Wait for popover menu to appear and click archive
    const archiveButton = page.locator('button:has-text("Archive card")')
    await expect(archiveButton).toBeVisible()
    await archiveButton.click()

    // Wait for the specific card to disappear from the DOM
    if (cardId) {
      await expect(page.locator(`article:has(span.font-mono:text("${cardId.trim()}"))`)).not.toBeVisible({
        timeout: 5000
      })
    }

    // Verify card count decreased
    const newCardCount = await page.locator('article').count()
    expect(newCardCount).toBe(initialCardCount - 1)
  })
})
