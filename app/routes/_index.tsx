import type { MetaFunction } from "@remix-run/cloudflare";

export const loader = async () => {
  return { hello: "world" };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `CFC: ${data?.hello}` },
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
