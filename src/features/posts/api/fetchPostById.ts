import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { Post } from "../types";

type PostApiPost = Omit<Post, "createdAt"> & {
  createdAt?: string;
};

type PostApiResponse = {
  ok: boolean;
  post?: PostApiPost;
  error?: string;
};

function mapApiPost(post: PostApiPost): Post {
  return {
    ...post,
    createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
  };
}

export async function fetchPostById(postId: string): Promise<Post | null> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "GET",
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as PostApiResponse;

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(data.error ?? "Post fetch failed");
  }

  return data.post ? mapApiPost(data.post) : null;
}
