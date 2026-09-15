"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { blogService, Blog } from "../_services/blogServices";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await blogService.getAllBlogs();
      setBlogs(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching blogs.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${blog.firstName} ${blog.lastName}`.toLowerCase();
    return (
      blog.title.toLowerCase().includes(query) ||
      blog.content.toLowerCase().includes(query) ||
      fullName.includes(query)
    );
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-secondary/30">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-secondary/30 text-foreground border border-secondary/40">
              Community Feed
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Explore <span className="text-primary">Articles</span>
            </h1>
            <p className="text-sm sm:text-base text-foreground/70 max-w-lg">
              Read the latest stories, lore, and ideas published by writers across the community.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-secondary/40 bg-white/60 text-foreground placeholder:text-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <svg
                className="w-4 h-4 text-foreground/40 absolute left-3.5 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchBlogs}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-secondary/10 animate-pulse p-6 border border-secondary/20 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-secondary/30 rounded-full" />
                  <div className="h-6 w-3/4 bg-secondary/30 rounded-lg" />
                  <div className="h-4 w-full bg-secondary/20 rounded-md" />
                  <div className="h-4 w-2/3 bg-secondary/20 rounded-md" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-secondary/20">
                  <div className="w-8 h-8 rounded-full bg-secondary/30" />
                  <div className="h-3 w-28 bg-secondary/20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBlogs.length === 0 && (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-secondary/60">
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-primary mx-auto flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">No articles found</h3>
            <p className="text-sm text-foreground/60 mt-1">
              {searchQuery
                ? `No results match "${searchQuery}". Try another keyword.`
                : "No blogs have been posted yet. Be the first to share one!"}
            </p>
          </div>
        )}

        {/* Blogs Grid */}
        {!isLoading && !error && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => {
              const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <article
                  key={blog.id}
                  className="group flex flex-col justify-between bg-white rounded-2xl p-6 border border-secondary/40 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-foreground/50 tracking-wide">
                      {formattedDate}
                    </span>

                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                      {blog.content}
                    </p>
                  </div>

                  {/* Author Footer */}
                  <div className="pt-5 mt-5 border-t border-secondary/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-foreground font-black text-xs flex items-center justify-center border border-primary/40">
                        {blog.firstName[0]}
                        {blog.lastName[0]}
                      </div>
                      <span className="text-xs font-semibold text-foreground/80">
                        {blog.firstName} {blog.lastName}
                      </span>
                    </div>

                    <Link
                      href={`/blogs/${blog.id}`}
                      className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                    >
                      Read
                      <svg
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
