import { useState, FormEvent } from "react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <h1 className="text-center text-2xl font-bold text-ucd-aggie dark:text-ucd-gold">
          <span className="text-ucd-gold">d</span>Advisor
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Sign in to plan your schedule
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30 dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              placeholder="you@ucdavis.edu"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-ucd-gold focus:outline-none focus:ring-2 focus:ring-ucd-gold/30 dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-ucd-aggie py-2.5 font-medium text-white transition hover:bg-ucd-aggie/90 focus:outline-none focus:ring-2 focus:ring-ucd-gold focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Mock login — any email and password will work.
        </p>
      </div>
    </div>
  );
}
