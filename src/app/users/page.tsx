'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const limit = 10;

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const endpoint = isSearching && searchTerm
        ? `/api/users/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
        : `/api/users?page=${page}&limit=${limit}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setPages(data.data.pages);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setIsSearching(true);
    setTimeout(() => loadUsers(), 0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
    setIsSearching(false);
    setTimeout(() => loadUsers(), 0);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          loadUsers();
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link
          href="/users/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
        >
          + Add User
        </Link>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-slate-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Search
          </button>
          {isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-slate-400 hover:bg-slate-500 text-white px-6 py-2 rounded font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No users found. {!isSearching && <Link href="/users/add" className="text-blue-600 hover:underline">Create one</Link>}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Country</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Created</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{user.country || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50 font-medium"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-slate-600 font-medium">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="px-4 py-2 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50 font-medium"
              >
                Next →
              </button>
            </div>
          )}

          <div className="text-sm text-slate-500 text-center">
            Total: <span className="font-bold">{total}</span> users
          </div>
        </>
      )}
    </div>
  );
}

