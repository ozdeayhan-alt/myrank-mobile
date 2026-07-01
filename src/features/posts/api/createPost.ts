import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { CreatePostInput } from "../types";

export type CreatePostResult = {
  id: string;
  mentionUserIds: string[];
};

type CreatePostApiResponse = {
  ok: boolean;
  id: string;
  mentionUserIds?: string[];
  error?: string;
};

export async function createPost(
  _authorId: string,
  input: CreatePostInput
): Promise<CreatePostResult> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    timeoutMs: 30_000,
  });

  const data = (await response.json()) as CreatePostApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Gönderi paylaşılamadı");
  }

  return {
    id: data.id,
    mentionUserIds: data.mentionUserIds ?? [],
  };
}
