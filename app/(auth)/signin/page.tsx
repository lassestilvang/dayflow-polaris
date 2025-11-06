import { Button } from "../../../components/ui/button";

export default function SignInPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in to Dayflow Polaris
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Future: secure SSO via WorkOS. For now, this is a placeholder screen.
        </p>
      </div>
      <Button
        className="mt-2 w-full"
        disabled
        aria-disabled="true"
      >
        Continue with WorkOS (coming soon)
      </Button>
    </div>
  );
}