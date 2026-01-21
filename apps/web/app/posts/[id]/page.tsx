"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, loadSession } from "../../../lib/api";

type PostTargetAttempt = {
  id: string;
  attemptNo: number;
  status: string;
  error?: string | null;
};

type PostTarget = {
  id: string;
  status: string;
  scheduledAt?: string | null;
  socialAccount: { platform: string; displayName: string };
  attempts: PostTargetAttempt[];
};

type Post = {
  id: string;
  title: string;
  baseText: string;
  targets: PostTarget[];
};

export default function PostDetailsPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useMemo(() => loadSession(), []);

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Post>(`/posts/${params.id}`, token);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id, token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{post?.title ?? "Post details"}</h1>
        <p className="text-sm text-slate-600">Preview, status, and publish attempts.</p>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading post…</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {post && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Preview</h2>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div className="rounded border border-slate-200 p-3">{post.baseText}</div>
              </div>
            </div>
            <div className="rounded bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Status</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {post.targets.map((target) => (
                  <div key={target.id} className="rounded border border-slate-200 p-2">
                    <p className="font-semibold text-slate-900">
                      {target.socialAccount.platform} · {target.socialAccount.displayName}
                    </p>
                    <p>Scheduled: {target.scheduledAt ? new Date(target.scheduledAt).toLocaleString() : "Not set"}</p>
                    <p>Status: {target.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Attempts</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {post.targets.flatMap((target) =>
                target.attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded border border-slate-200 p-2">
                    Attempt #{attempt.attemptNo} • {attempt.status}
                    {attempt.error ? ` (${attempt.error})` : ""}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
