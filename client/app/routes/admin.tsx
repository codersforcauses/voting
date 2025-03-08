import type { Route } from "./+types/admin";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Admin Page" },
        { name: "description", content: "ADMIN ADMIN ADMIN" },
    ];
}

export default function Admin() {
    return (
        <main>
            admin
        </main>
    );
}
