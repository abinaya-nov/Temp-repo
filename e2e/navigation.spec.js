import { test, expect } from './fixtures.js';

test('navigation preserves a changed query, status filter and visible columns', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('JQL query', { exact: true }).fill('project = TRON ORDER BY key ASC');
  await page.getByRole('button', { name: /Search tickets/ }).click();
  await page.getByRole('combobox', { name: 'Filter tickets by status' }).selectOption('Done');
  await page.getByRole('checkbox', { name: 'Select TRON-128', exact: true }).check();
  await page.getByText('Columns', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Summary', exact: true }).uncheck();
  await page.getByText('Columns', { exact: true }).click();
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.getByRole('button', { name: 'Open Effort Estimator', exact: true }).click();
  await expect(page.getByLabel('JQL query', { exact: true })).toHaveValue('project = TRON ORDER BY key ASC');
  await expect(page.getByRole('combobox', { name: 'Filter tickets by status' })).toHaveValue('Done');
  await expect(page.getByRole('checkbox', { name: 'Select TRON-128', exact: true })).toBeChecked();
  await expect(page.locator('thead th').filter({ hasText: /^Summary$/ })).toHaveCount(0);
});

test('distinct pages navigate repeatedly while retaining search, selection, page and review state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('18 matching issues · 0 selected across pages')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select TRON-136', exact: true }).check();
  await page.getByRole('button', { name: 'Estimate Selected Tickets', exact: true }).click();
  await page.getByRole('button', { name: 'Approve TRON-136', exact: true }).click();
  await page.keyboard.press('Escape');
  for (let index = 0; index < 4; index++) {
    await page.getByRole('button', { name: 'Overview', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Overview');
    await expect(page.getByRole('region', { name: 'Workspace overview' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Issue navigator' })).toBeHidden();
    await expect(page.getByLabel('JQL query', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toHaveClass(/active/);
    await page.getByRole('button', { name: index % 2 ? 'Effort estimator' : 'Open Effort Estimator', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ticket Effort Estimator');
    await expect(page.getByRole('button', { name: 'Effort estimator', exact: true })).toHaveClass(/active/);
    await expect(page.getByText('Page 2 of 4', { exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Select TRON-136', exact: true })).toBeChecked();
  }
  await page.getByRole('button', { name: 'Review results (1)' }).click();
  await expect(page.getByRole('dialog').getByText('Approved', { exact: true })).toBeVisible();
});

test('help integrates with FastAPI and Escape restores focus after focus moves within the dialog', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open help', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Help & getting started' });
  await expect(dialog.getByRole('status')).toContainText('Python backend available');
  await dialog.getByRole('heading', { level: 2 }).evaluate(element => { element.tabIndex = -1; element.focus(); });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Close panel' }).click();
  await expect(trigger).toBeFocused();
});

test('unavailable backend does not disable demo search or estimation', async ({ page }) => {
  await page.route('**/api/health', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open help', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Python backend unavailable');
  await page.keyboard.press('Escape');
  await page.getByLabel('JQL query', { exact: true }).fill('key = TRON-124');
  await page.getByRole('button', { name: /Search tickets/ }).click();
  await expect(page.getByText('1 matching issues · 0 selected across pages')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Select TRON-124', exact: true }).check();
  await page.getByRole('button', { name: 'Estimate Selected Tickets', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Estimation review' })).toContainText('DEMO BASELINE ESTIMATES');
});
