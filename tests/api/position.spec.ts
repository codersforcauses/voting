import { test, expect } from '@playwright/test';
import { getAccessToken } from './utils';

test.describe('Positions', () => {
    test('should get all positions', async ({ request }) => {
        const position = await request.get("/position")
        expect(position.ok()).toBeTruthy()
        expect(await position.json()).toEqual([
            {
              id: 1,
              title: 'President',
              description: 'Runs the club',
              priority: 1,
              openings: 1
            },
            {
              id: 2,
              title: 'Vice President',
              description: 'Assists the President',
              priority: 2,
              openings: 1
            },
            {
              id: 3,
              title: 'Secretary',
              description: 'Keeps minutes of meetings',
              priority: 3,
              openings: 1
            },
            {
              id: 4,
              title: 'Treasurer',
              description: 'Manages club finances',
              priority: 4,
              openings: 1
            },
            {
              id: 5,
              title: 'Technical Lead',
              description: 'Oversees technical projects',
              priority: 5,
              openings: 1
            },
            {
              id: 6,
              title: 'Marketing Officer',
              description: 'Handles marketing and promotions',
              priority: 6,
              openings: 1
            },
            {
              id: 7,
              title: 'Fresher Representative',
              description: 'Represents the interests of first year students',
              priority: 7,
              openings: 1
            },
            {
              id: 8,
              title: 'Ordinary Committee Member',
              description: 'General committee member',
              priority: 8,
              openings: 6
            }
          ])
    })

    test('should create position', async ({ request }) => {
        // TODO
    })

    test('should update position', async ({ request }) => {
        // TODO
    })

    test('should delete position', async ({ request }) => {
        // TODO
    })
});