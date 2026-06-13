const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  analyze:         (body, token)    => request("/api/analyze",                   { method: "POST", body: JSON.stringify(body) }, token),
  syncProfile:     (token)          => request("/api/auth/sync",                 { method: "POST" }, token),
  getMe:           (token)          => request("/api/auth/me",                   {}, token),
  getHistory:      (token, page=1)  => request(`/api/user/history?page=${page}`, {}, token),
  getUsage:        (token)          => request("/api/user/usage",                {}, token),
  updateProfile:   (body, token)    => request("/api/user/profile",              { method: "PATCH", body: JSON.stringify(body) }, token),
  deleteAccount:   (token)          => request("/api/user/account",              { method: "DELETE" }, token),
  getThreads:      (params)         => request(`/api/forum/threads?${new URLSearchParams(params)}`),
  getThread:       (id)             => request(`/api/forum/threads/${id}`),
  createThread:    (body, token)    => request("/api/forum/threads",             { method: "POST", body: JSON.stringify(body) }, token),
  deleteThread:    (id, token)      => request(`/api/forum/threads/${id}`,        { method: "DELETE" }, token),
  createComment:   (id, body, tok)  => request(`/api/forum/threads/${id}/comments`, { method: "POST", body: JSON.stringify(body) }, tok),
  likeComment:     (id, token)      => request(`/api/forum/comments/${id}/like`,   { method: "POST" }, token),
  submitFeedback:  (body)           => request("/api/user/feedback",                { method: "POST", body: JSON.stringify(body) }),
  createCheckout:  (token, billing)  => request("/api/stripe/create-checkout",   { method: "POST", body: JSON.stringify({ billing: billing || "monthly" }) }, token),
  openPortal:      (token)          => request("/api/stripe/portal",             { method: "POST" }, token),
  health:          ()               => request("/api/health"),
};
