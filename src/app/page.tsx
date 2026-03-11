import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to UserForge
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Learn PostgreSQL through a practical user management application
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-3 text-blue-600">📊 Core CRUD</h3>
          <p className="text-slate-600 mb-4">
            Create, Read, Update, and Delete user records with PostgreSQL
          </p>
          <Link href="/users" className="text-blue-600 hover:underline font-medium">
            Manage Users →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-3 text-green-600">🔍 Search</h3>
          <p className="text-slate-600 mb-4">
            Use ILIKE for case-insensitive full-text search on name and email
          </p>
          <Link href="/users" className="text-green-600 hover:underline font-medium">
            Search Users →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-3 text-purple-600">
            📑 Pagination
          </h3>
          <p className="text-slate-600 mb-4">
            Learn LIMIT and OFFSET for efficient data pagination
          </p>
          <Link href="/users" className="text-purple-600 hover:underline font-medium">
            See Pagination →
          </Link>
        </div>
      </section>

      <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
        <h3 className="font-bold text-blue-900 mb-3">🎓 Learning Concepts</h3>
        <ul className="text-slate-700 space-y-2 text-sm grid md:grid-cols-2 gap-4">
          <li>✅ PostgreSQL connection pooling with node-postgres</li>
          <li>✅ Prepared statements for SQL injection prevention</li>
          <li>✅ CRUD operations with raw SQL</li>
          <li>✅ ILIKE search (case-insensitive pattern matching)</li>
          <li>✅ Pagination with LIMIT/OFFSET</li>
          <li>✅ Indexes for performance optimization</li>
          <li>✅ Timestamps and data validation</li>
          <li>✅ Error handling and database constraints</li>
        </ul>
      </section>

      <section className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded">
        <h3 className="font-bold text-amber-900 mb-2">⚠️ Before Getting Started</h3>
        <ol className="text-slate-700 space-y-2 text-sm">
          <li>1. Create a PostgreSQL database on <a href="https://railway.app" target="_blank" className="text-blue-600 hover:underline">Railway.app</a></li>
          <li>2. Get your DATABASE_URL from Railway dashboard</li>
          <li>3. Update <code className="bg-white px-2 py-1 rounded">.env.local</code> with your DATABASE_URL</li>
          <li>4. Run the schema from <code className="bg-white px-2 py-1 rounded">src/db/schema.sql</code> in Railway</li>
          <li>5. Start the app with <code className="bg-white px-2 py-1 rounded">npm run dev</code></li>
        </ol>
      </section>
    </div>
  );
}

