import type { Route } from "./+types/results";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Results - CFC Election" },
        { name: "description", content: "View the results of the election" },
    ];
}

export default function Results() {
    return (
        <main>
            results
        </main>
    );
}
