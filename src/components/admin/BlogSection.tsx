"use client";

import { useState, useEffect, useCallback } from "react";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

const CATEGORIES = [
  "Getting Started",
  "Regulations",
  "Market Analysis",
  "Travel Guide",
  "Events",
  "Tips",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogSection({ token }: { token: string }) {
  const [redisPosts, setRedisPosts] = useState<BlogPost[]>([]);
  const [hiddenSlugs, setHiddenSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editor
  const [editing, setEditing] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [readTime, setReadTime] = useState("5 min read");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.posts) setRedisPosts(data.posts);
      if (data.hiddenSlugs) setHiddenSlugs(data.hiddenSlugs);
    } catch {
      setError("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const resetForm = () => {
    setEditing(false);
    setEditSlug(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setReadTime("5 min read");
    setCategory(CATEGORIES[0]);
    setContent("");
    setAutoSlug(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditing(true);
    setEditSlug(post.slug);
    setTitle(post.title);
    setSlug(post.slug);
    setDescription(post.description);
    setDate(post.date);
    setReadTime(post.readTime);
    setCategory(post.category);
    setContent(post.content);
    setAutoSlug(false);
  };

  const handleSave = async () => {
    if (!title || !slug || !description || !content) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const method = editSlug ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/blog", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, title, description, date, readTime, category, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editSlug ? "Post updated!" : "Post created!");
        resetForm();
        fetchPosts();
      } else {
        setError(data.error || "Failed to save post");
      }
    } catch {
      setError("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postSlug: string, isStatic: boolean) => {
    const action = isStatic ? "hide" : "delete";
    if (!confirm(`${isStatic ? "Hide" : "Delete"} this post?`)) return;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug: postSlug, isStatic }),
      });
      if (res.ok) {
        setSuccess(`Post ${action}d`);
        fetchPosts();
      }
    } catch {
      setError(`Failed to ${action} post`);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title && !editSlug) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug, editSlug]);

  // Editor view
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">{editSlug ? "Edit Post" : "New Post"}</h2>
          <button onClick={resetForm} className="text-white/30 text-sm hover:text-white/60 transition-colors">
            Cancel
          </button>
        </div>

        <div className="bg-[#1F2937] border border-white/10 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your blog post title"
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Description (SEO)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description for search engines"
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-y"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your blog post in markdown...&#10;&#10;## Use headings&#10;**Bold text** for emphasis&#10;Regular paragraphs for content"
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-y font-mono text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !title || !slug || !description || !content}
              className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : editSlug ? "Update Post" : "Create Post"}
            </button>
            <button onClick={resetForm} className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Cancel
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setEditing(true)}
          className="bg-gold text-white px-6 py-2.5 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
        >
          + New Post
        </button>
      </div>

      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">
            Blog Posts <span className="text-white/30 font-normal text-sm ml-2">({redisPosts.length} in Redis)</span>
          </h2>
          <button onClick={fetchPosts} className="text-white/30 text-xs hover:text-white/60 transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : redisPosts.length === 0 ? (
          <p className="text-white/40 text-sm">No blog posts in Redis. Static posts from code are still live on the site.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Title</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Category</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Date</th>
                  <th className="text-right text-white/40 font-bold text-xs tracking-wider uppercase py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redisPosts.map((post) => (
                  <tr key={post.slug} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <span className="text-white">{post.title}</span>
                      <span className="block text-white/30 text-xs mt-0.5 font-mono">/blog/{post.slug}</span>
                    </td>
                    <td className="py-3 pr-4 text-white/60 hidden md:table-cell">{post.category}</td>
                    <td className="py-3 pr-4 text-white/60 hidden md:table-cell">{post.date}</td>
                    <td className="py-3 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-gold/70 hover:text-gold text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug, false)}
                        className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hiddenSlugs.length > 0 && (
        <div className="bg-[#1F2937]/50 border border-white/5 p-4">
          <p className="text-white/30 text-xs">
            Hidden static posts: {hiddenSlugs.join(", ")}
          </p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}
    </div>
  );
}
