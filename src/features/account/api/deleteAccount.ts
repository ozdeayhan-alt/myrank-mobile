import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

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
  throwIfNotOk(response, data, data.error ?? "Hesap silinemedi");
}
