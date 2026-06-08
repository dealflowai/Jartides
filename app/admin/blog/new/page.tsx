import { requireAdminPage } from "@/lib/admin";
import BlogEditor from "@/components/admin/BlogEditor";

export default async function NewBlogPostPage() {
  await requireAdminPage();
  return <BlogEditor />;
}
