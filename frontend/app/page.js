import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-200 p-6">
        <h1 className="text-2xl font-bold">Ecommerce Page</h1>
        <p className="mt-2 text-zinc-600">
          Routing test
        </p>

        <nav className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/home" className="rounded-lg border p-3 hover:bg-zinc-50">Home</Link>
          <Link href="/product" className="rounded-lg border p-3 hover:bg-zinc-50">Product</Link>
          <Link href="/cart" className="rounded-lg border p-3 hover:bg-zinc-50">Cart</Link>
          <Link href="/login" className="rounded-lg border p-3 hover:bg-zinc-50">Login</Link>
        </nav>
      </section>
    </main>
  );
}