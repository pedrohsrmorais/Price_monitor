//src/components/auth/isAuthenticated.ts
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
