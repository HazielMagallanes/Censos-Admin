import { useEffect, useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = async () => {
    if (!email) return "Email is required.";
    // super simple email regex
    const re = /.+@.+\..+/;
    if (!re.test(email)) return "Please enter a valid email.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      // fake API delay
      await new Promise((r) => setTimeout(r, 900));

      // demo auth logic (accept any credentials for the demo)
      setSuccess(`Welcome back, ${email.split("@")[0]}!`);
      setError(null);

      // optionally handle "remember" (store in localStorage) - demo only
      if (remember) localStorage.setItem("demo_remember_email", email);
      else localStorage.removeItem("demo_remember_email");

      // clear password field after submit
      setPassword("");
    } catch (error) {
      setError("Something went wrong. Try again.");
      console.error(error);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  }

  // load remembered email on first render
  useEffect(() => {
    const saved = localStorage.getItem("demo_remember_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2 text-center">Iniciar Sesión</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-100 p-3 rounded">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="tú@ejemplo.com"
              autoComplete="email"
            />
          </label>


          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>

            <button type="button" className="text-indigo-600 hover:underline">
              Forgot?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <button className="text-indigo-600 hover:underline">Create one</button>
        </div>

        <div className="mt-6 border-t pt-4 text-center text-xs text-slate-400">Demo • No backend • Tailwind required</div>
      </div>
    </div>
  );
}

export default Login;