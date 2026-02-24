import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-gold mb-4">404</h1>
        <h2 className="font-serif text-2xl text-white mb-4">Page Not Found</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button as="a" href="/">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
