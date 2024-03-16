import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <main className="flex-1 grid items-center justify-center">
      <h1 className="text-3xl text-white text-center">Hello poller thing</h1>
    </main>
  );
}
