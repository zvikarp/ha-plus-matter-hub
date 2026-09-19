export async function expectJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await responseMessage(response));
  }
  return response.json() as Promise<T>;
}

export async function expectSuccess(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(await responseMessage(response));
  }
}

async function responseMessage(response: Response): Promise<string> {
  const detail = await response.text().catch(() => "");
  return detail || `${response.status} ${response.statusText}`;
}
