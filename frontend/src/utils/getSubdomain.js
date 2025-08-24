export function getSubdomain() {
  const host = window.location.hostname;
  const parts = host.split(".");
  console.log("parts", parts)

  if (host.includes("lvh.me") || host.includes("localhost")) {
    if (parts.length === 2) {
      console.log("Subdomain detected:", parts[0]);
      return parts[0];
    }
    return null;
  }
}
