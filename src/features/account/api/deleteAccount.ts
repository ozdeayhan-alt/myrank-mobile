import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type DeleteAccountResponse = {
  ok?: boolean;
  error?: string;
};

export async function deleteAccount(): Promise<void> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/account`, {
    method: "DELETE",
    timeoutMs: 120000,
  });

  const data = (await response.json().catch(() => ({}))) as DeleteAccountResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Hesap silinemedi");
  }
}
