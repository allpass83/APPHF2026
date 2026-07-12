export function createAppUrl(route) {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `${window.location.origin}${import.meta.env.BASE_URL}#${normalizedRoute}`;
}
