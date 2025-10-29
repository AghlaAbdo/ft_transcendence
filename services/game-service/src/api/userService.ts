import { USER_SERVICE_HOST } from '../config/env';

export async function fetchUser(userId: string) {
  try {
    const url = `${USER_SERVICE_HOST}/api/users/${userId}`;
    const response = await fetch(url, {
      // Include internal headers if needed for security or tracing
      headers: {
        'X-Internal-Request': 'game-service',
      },
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
