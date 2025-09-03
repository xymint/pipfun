// API utilities for pipfun

const API_URL = process.env.NEXT_PUBLIC_API_URL as string | undefined;
const API_VERSION = (process.env.NEXT_PUBLIC_API_VERSION as string | undefined) ?? "v1";

const API_BASE = `${API_URL ?? ""}/api/${API_VERSION}`;

const mergeHeaders = (
  additionalHeaders?: Record<string, string>,
  includeAuth: boolean = true
): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(additionalHeaders || {}),
  };

  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<Response> => {
  console.log(`${API_BASE}/${endpoint}`);
  const headers = mergeHeaders(options.headers as Record<string, string>, includeAuth);
  const res = await fetch(`${API_BASE}/${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    console.warn("[api] unauthorized (401)");
  }
  return res;
};

export const fetchPublic = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  console.log(`${API_BASE}/${endpoint}`);
  const headers = mergeHeaders(options.headers as Record<string, string>, false);
  return fetch(`${API_BASE}/${endpoint}`, { ...options, headers });
};

export const fetchFormDataWithAuth = async (
  endpoint: string,
  formData: FormData,
  method: string = "POST",
  includeAuth: boolean = true,
  additionalHeaders: Record<string, string> = {}
): Promise<Response> => {
  console.log(`${API_BASE}/${endpoint}`);
  const headers = mergeHeaders(additionalHeaders, includeAuth);
  // do not set Content-Type; browser will set multipart boundary automatically
  delete (headers as any)["Content-Type"];
  return fetch(`${API_BASE}/${endpoint}`, {
    method,
    body: formData,
    headers,
  });
};
