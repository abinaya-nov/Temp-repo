import { test, expect } from './fixtures.js';

test('every identical explicit search resets pagination, selection and review results', async ({ page }) => {
  await page.goto('/');
  for (let index = 0; index < 2; index++) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Select TRON-136', exact: true }).check();
    await page.getByRole('button', { name: 'Estimate Selected Tickets', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Search tickets/ }).click();
    await expect(page.getByText('Page 1 of 4', { exact: true })).toBeVisible();
    await expect(page.getByText('18 matching issues · 0 selected across pages')).toBeVisible();
    await expect(page.getByRole('button', { name: /Review results/ })).toHaveCount(0);
  }
  await page.getByRole('checkbox', { name: 'Select TRON-141', exact: true }).check();
  await page.getByLabel('JQL query', { exact: true }).press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Select TRON-141', exact: true })).not.toBeChecked();
});

test('example executes immediately, including when its text is already in the input', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('JQL query', { exact: true }).fill('status = "Done"');
  await page.getByRole('button', { name: /Search tickets/ }).click();
  await expect(page.getByText('4 matching issues · 0 selected across pages')).toBeVisible();
  await page.getByRole('button', { name: /Try an example/ }).click();
  await expect(page.getByLabel('JQL query', { exact: true })).toHaveValue('project = TRON ORDER BY created DESC');
  await expect(page.getByText('18 matching issues · 0 selected across pages')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: /Try an example/ }).click();
  await expect(page.getByText('Page 1 of 4', { exact: true })).toBeVisible();
});

test('existing columns, pagination, status filter and cross-page selection continue working', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Columns', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Existing estimated hours', exact: true }).uncheck();
  await expect(page.locator('thead th').filter({ hasText: /^Existing estimated hours$/ })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Existing estimated hours', exact: true }).check();
  await expect(page.locator('thead th').filter({ hasText: /^Existing estimated hours$/ })).toBeVisible();
  await page.getByText('Columns', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select all issues on current page' }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select TRON-136', exact: true }).check();
  await expect(page.getByText('18 matching issues · 6 selected across pages')).toBeVisible();
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Select all issues on current page' })).toBeChecked();
  await page.getByRole('combobox', { name: 'Issues per page' }).selectOption('20');
  await expect(page.getByText('Page 1 of 1', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Filter tickets by status' }).selectOption('Done');
  await expect(page.getByText('4 matching issues · 0 selected across pages')).toBeVisible();
});

test('invalid and zero-result queries give explicit results and navigation still works', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('JQL query', { exact: true }).fill('project = TRON OR status = Done');
  await page.getByRole('button', { name: /Search tickets/ }).click();
  await expect(page.getByRole('alert')).toContainText('Unsupported demo JQL');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Overview');
  await page.getByRole('button', { name: 'Effort estimator', exact: true }).click();
  await page.getByLabel('JQL query', { exact: true }).fill('project = NONE');
  await page.getByRole('button', { name: /Search tickets/ }).click();
  await expect(page.getByRole('heading', { name: 'No tickets found' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});
