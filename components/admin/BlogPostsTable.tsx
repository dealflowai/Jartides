"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import type { BlogPost } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPostsTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublish(post: BlogPost) {
    setBusyId(post.id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          cover_image: post.cover_image,
          author: post.author,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          published: !post.published,
        }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Could not update the post.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusyId(post.id);
    try {
      const res = await fetch(`/api/admin/blog?id=${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Could not delete the post.");
    } finally {
      setBusyId(null);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-600">No posts yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Create your first post to get the blog started.
        </p>
        <Link
          href="/admin/blog/new"
          className="mt-4 inline-block rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90"
        >
          New Post
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {posts.map((post) => {
          const busy = busyId === post.id;
          return (
            <li
              key={post.id}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50/60"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Title + meta */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="block truncate text-sm font-semibold text-gray-900 hover:text-[#0b3d7a]"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  /blog/{post.slug}
                  {post.published_at && ` · ${formatDate(post.published_at)}`}
                </p>
              </div>

              {/* Status */}
              <span
                className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-block ${
                  post.published
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {post.published ? "Published" : "Draft"}
              </span>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0b3d7a]"
                    title="View live"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => togglePublish(post)}
                  disabled={busy}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0b3d7a] disabled:opacity-40"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : post.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0b3d7a]"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(post)}
                  disabled={busy}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
