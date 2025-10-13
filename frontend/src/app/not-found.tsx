import Link from "next/link";
import LoadingPong from "@/components/LoadingPong";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-[calc(100vh_-_72px)] text-white text-center p-6">
      {/* Animated Ping Pong */}
      <LoadingPong />

      {/* Text */}
      <h1 className="text-5xl font-bold mb-2">404</h1>
      <p className="text-lg text-gray-300 mb-6">
        Oops! The ball missed the table — this page doesn’t exist.
      </p>

      <Link
        href="/"
        className="px-5 py-2 bg-purple text-gray-50 font-semibold rounded-full hover:bg-light-purple transition"
      >
        Back to Home
      </Link>
    </main>
  );
}
