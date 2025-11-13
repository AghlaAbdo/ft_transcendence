import { USER_SERVICE_HOST, INTERNAL_API_KEY } from '../config/env';

export async function fetchUser(userId: string) {
  if (!INTERNAL_API_KEY || !USER_SERVICE_HOST) return null;
  try {
    const url = `${USER_SERVICE_HOST}/api/users/${userId}`;
    const response = await fetch(url, {
      // Include internal headers if needed for security or tracing
      // headers: {
      //   'X-Internal-Request': 'game-service',
      // },
      headers: { 'x-internal-key': INTERNAL_API_KEY },
    });
    if (!response.ok) {
      console.log("Couldn't fetch user: something wet wrong");
      console.log('url: ', url);
      return null;
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error(
      `Failed to connect to User Service at ${USER_SERVICE_HOST}:`,
      error,
    );
    return null;
  }
}
