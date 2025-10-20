export async function POST() {
  const response = Response.json({ message: 'Logged out successfully' });
  
  // Clear the auth token cookie
  response.headers.set(
    'Set-Cookie',
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  );
  
  return response;
}
