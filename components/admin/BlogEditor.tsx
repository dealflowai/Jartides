"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import slugify from "slugify";
import {
  Loader2,
  ImagePlus,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { BlogPost } from "@/lib/types";

const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

const LABEL_CLS = "mb-1.5 block text-sm font-medium text-gray-700";

function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true }).slice(0, 200);
}

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Jartides Team");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description ?? ""
  );
  const [published, setPublished] = useState(post?.published ?? false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep the slug auto-synced with the title until the admin edits it by hand.
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(toSlug(value));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave(publishState?: boolean) {
    const willPublish = publishState ?? published;
    if (!title.trim()) {
      setError("Please add a title before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      ...(isEdit ? { id: post!.id } : {}),
      title: title.trim(),
      slug: toSlug(slug || title),
      excerpt: excerpt.trim(),
      content,
      cover_image: coverImage || null,
      author: author.trim() || "Jartides Team",
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      published: willPublish,
    };

    try {
      const res = await fetch("/api/admin/blog", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to save post."
        );
      }
      setPublished(willPublish);
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog?id=${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Failed to delete post.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-28">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#0b3d7a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? "Edit Post" : "New Post"}
      </h1>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className={LABEL_CLS}>Title</label>
          <input
            className={INPUT_CLS}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. A Beginner's Guide to Research Peptides"
          />
        </div>

        {/* Slug */}
        <div>
          <label className={LABEL_CLS}>URL Slug</label>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-[#1a6de3] focus-within:ring-1 focus-within:ring-[#1a6de3]">
            <span className="select-none pl-3 text-sm text-gray-400">
              /blog/
            </span>
            <input
              className="w-full bg-transparent px-1 py-2 text-sm text-gray-900 outline-none"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(toSlug(slug))}
              placeholder="post-url-slug"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Auto-filled from the title. Used in the post&apos;s web address.
          </p>
        </div>

        {/* Cover image */}
        <div>
          <label className={LABEL_CLS}>Cover Image</label>
          {coverImage ? (
            <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image
                src={coverImage}
                alt="Cover preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-red-600"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-[#1a6de3] hover:bg-[#1a6de3]/5 hover:text-[#1a6de3] disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-sm font-medium">
                    Click to upload a cover image
                  </span>
                  <span className="text-xs">JPEG, PNG or WebP, up to 10 MB</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className={LABEL_CLS}>Excerpt</label>
          <textarea
            className={INPUT_CLS}
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the blog listing and link previews."
          />
        </div>

        {/* Content */}
        <div>
          <label className={LABEL_CLS}>Content</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post here..."
            minHeight="320px"
          />
        </div>

        {/* Author */}
        <div>
          <label className={LABEL_CLS}>Author</label>
          <input
            className={INPUT_CLS}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Jartides Team"
          />
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">
            Search Engine Optimization
          </h3>
          <p className="mb-4 text-xs text-gray-500">
            Optional. Leave blank to use the title and excerpt automatically.
          </p>
          <div className="space-y-4">
            <div>
              <label className={LABEL_CLS}>Meta Title</label>
              <input
                className={INPUT_CLS}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Page title shown in Google"}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Meta Description</label>
              <textarea
                className={INPUT_CLS}
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={excerpt || "Short description shown in search results"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm ml-64">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            {published ? (
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <Eye className="h-4 w-4" /> Published
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <EyeOff className="h-4 w-4" /> Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving || uploading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {published ? "Unpublish" : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b3d7a]/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : published ? (
                "Update Post"
              ) : (
                "Publish"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
