import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowLeft, Calendar, User } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import type { BlogPost } from "@/lib/types";
import "@/components/blog/blog-content.css";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    return (data as BlogPost) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Post Not Found | Jartides" };
  }

  const title = post.meta_title || `${post.title} | Jartides Blog`;
  const description =
    post.meta_description || post.excerpt || "Read the latest from Jartides.";

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cleanContent = DOMPurify.sanitize(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: { "@type": "Organization", name: post.author || "Jartides" },
    publisher: { "@type": "Organization", name: "Jartides" },
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1 text-sm text-gray-400"
        >
          <Link href="/" className="transition-colors hover:text-[#0b3d7a]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="transition-colors hover:text-[#0b3d7a]">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-gray-600">{post.title}</span>
        </nav>

        {/* Title + meta */}
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl font-[family-name:var(--font-heading)]">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#1a6de3]" />
              {formatDate(post.published_at)}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#1a6de3]" />
              {post.author}
            </span>
          )}
        </div>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f0f4fa]">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* Footer / back link */}
        <div className="mt-14 border-t border-[#dde2ea] pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6de3] transition-colors hover:text-[#0b3d7a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </div>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#061a38] to-[#0b3d7a] px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl font-[family-name:var(--font-heading)]">
            Explore Our Research Peptides
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 md:text-base">
            99%+ purity, third-party tested, with COAs available for every batch.
          </p>
          <div className="mt-6">
            <Button href="/shop" variant="white">
              Shop Now
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
