"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../_store/store";
import { blogService } from "../../_services/blogServices";
import Link from "next/link";

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and content.");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a blog.");
      return;
    }

    setIsLoading(true);

    try {
      await blogService.createBlog({
        title: title.trim(),
        content: content.trim(),
        userId: user.id,
      });

      router.push("/blogs");
    } catch (err: any) {
      setError(err.message || "Failed to create blog.");
    } finally {
      setIsLoading(false);
    }
  };

  // Guard: redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Sign in to write
          </h2>
          <p className="text-sm text-foreground/60">
            You need to be logged in to create a blog post.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-full bg-primary hover:bg-accent text-foreground font-semibold text-sm shadow-sm transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blogs
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Create a <span className="text-primary">New Post</span>
          </h1>
          <p className="text-sm text-foreground/60">
            Posting as{" "}
            <span className="font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </span>
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5 shrink-0 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-secondary/30 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-background/50 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-medium"
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post..."
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-background/50 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-medium resize-y leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/blogs"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary/10 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-accent text-foreground font-bold text-sm shadow-sm shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
