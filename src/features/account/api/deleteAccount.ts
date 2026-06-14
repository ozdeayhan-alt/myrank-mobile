import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type DeleteAccountResponse = {
  ok?: boolean;
  error?: string;
};

export async function deleteAccount(): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeoutMs: 120000,
  });

  const data = (await response.json().catch(() => ({}))) as DeleteAccountResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Hesap silinemedi");
  }
}
