import { UserData } from "@/types"
import { APIRequestContext, Page } from "@playwright/test"

export const getAccessToken = async (role: 'user' | 'admin', request: APIRequestContext, page: Page) => {
    page.route('https://api.clerk.com/v1/**/*', async route => {
        const res =  [{
            id: 'user_1234'
        }]
        route.fulfill({ json: res })
    })

    page.route('https://codersforcauses.org/api/trpc/user.get', async route => {
        const res = [{ result: { data: {
            json: {
            id: 'user_1234',
            email: 'test@user.com',
            name: 'Test User',
            preferred_name: 'Test',
            student_number: '123456',
            role,
        } as UserData }}}]
        route.fulfill({ json: res })
    })

    const result = await request.post("/auth", {
        data: {
            email: 'test@user.com',
            code: '000000'
        }
    })

    const { token } = await result.json()
    return token
}