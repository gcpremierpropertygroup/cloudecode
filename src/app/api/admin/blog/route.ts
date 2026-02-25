import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { BlogPost } from "@/lib/blog/posts";

const POSTS_KEY = "blog:posts";
const HIDDEN_KEY = "blog:hidden";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redisPosts = await getConfig<BlogPost[]>(POSTS_KEY, []);
    const hiddenSlugs = await getConfig<string[]>(HIDDEN_KEY, []);
    return NextResponse.json({ posts: redisPosts, hiddenSlugs });
  } catch (error) {
    console.error("Failed to load blog posts:", error);
    return NextResponse.json({ error: "Failed to load blog posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, title, description, date, readTime, category, content } = body;

    if (!slug || !title || !description || !date || !readTime || !category || !content) {
      return NextResponse.json(
        { error: "All fields are required: slug, title, description, date, readTime, category, content" },
        { status: 400 }
      );
    }

    const post: BlogPost = { slug, title, description, date, readTime, category, content };

    const existing = await getConfig<BlogPost[]>(POSTS_KEY, []);
    // Check for duplicate slug
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    existing.push(post);
    await setConfig(POSTS_KEY, existing);

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, title, description, date, readTime, category, content } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const existing = await getConfig<BlogPost[]>(POSTS_KEY, []);
    const idx = existing.findIndex((p) => p.slug === slug);

    if (idx === -1) {
      return NextResponse.json({ error: "Post not found in Redis" }, { status: 404 });
    }

    existing[idx] = {
      ...existing[idx],
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date }),
      ...(readTime && { readTime }),
      ...(category && { category }),
      ...(content && { content }),
    };

    await setConfig(POSTS_KEY, existing);
    return NextResponse.json({ success: true, post: existing[idx] });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, isStatic } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    if (isStatic) {
      // Hide a static post
      const hidden = await getConfig<string[]>(HIDDEN_KEY, []);
      if (!hidden.includes(slug)) {
        hidden.push(slug);
        await setConfig(HIDDEN_KEY, hidden);
      }
    } else {
      // Delete a Redis post
      const existing = await getConfig<BlogPost[]>(POSTS_KEY, []);
      const filtered = existing.filter((p) => p.slug !== slug);
      await setConfig(POSTS_KEY, filtered);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
