import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <ModeToggle/>
      <Button>Home</Button>
    </main>
  );
}
