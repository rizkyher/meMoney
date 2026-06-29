export function load({ locals }) {
  return {
    user: locals.user,
    csrfToken: locals.csrfToken
  };
}
