import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import type { BlogPost } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="hover-lift group flex flex-col overflow-hidden rounded-2xl border border-[#dde2ea] bg-white"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f0f4fa]">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b3d7a] to-[#1a6de3]">
            <Newspaper className="h-10 w-10 text-white/70" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {post.published_at && (
          <p className="text-xs font-medium uppercase tracking-wide text-[#1a6de3]">
            {formatDate(post.published_at)}
          </p>
        )}
        <h3 className="mt-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#0b3d7a] font-[family-name:var(--font-heading)]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6de3]">
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
