export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Article Platform</h1>
      <p className="text-gray-600">
        Explore articles, manage categories, and write content.
      </p>
      <div className="flex gap-3">
        <a
          className="home-cta rounded border px-4 py-2 hover:bg-[var(--primary)] hover:!text-black transition-colors"
          href="/articles"
        >
          Browse Articles
        </a>
        <a
          className="home-cta rounded border px-4 py-2 hover:bg-[var(--primary)] hover:!text-black transition-colors"
          href="/login"
        >
          Login
        </a>
        <a
          className="home-cta rounded border px-4 py-2 hover:bg-[var(--primary)] hover:!text-black transition-colors"
          href="/register"
        >
          Register
        </a>
      </div>
    </div>
  );
}
