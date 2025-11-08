import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should authenticate a user with a code', async ({ request }) => {
        // TODO
    });

    test('should not authenticate an unknown email', async ({ request }) => {
        // TODO
    });

    test('should not authenticate an invalid code', async ({ request }) => {
        // TODO
    });

    test('should not authenticate a user with an already used code', async ({ request }) => {
        // TODO
    });

    test('should not authenticate an existing user with a new code', async ({ request }) => {
        // TODO
    });

    test('should verify a user token', async ({ request }) => {
        // TODO
    });

    test('should verify an admin token', async ({ request }) => {
        // TODO
    });

    test('should not verify a tampered token', async ({ request }) => {
        // TODO
    });
});
