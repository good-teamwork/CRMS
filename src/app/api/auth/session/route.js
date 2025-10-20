export async function GET(request) {
  try {
    // Get the auth token from cookies
    const cookieHeader = request.headers.get('cookie');
    const authToken = cookieHeader
      ?.split(';')
      .find(cookie => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!authToken) {
      return Response.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    try {
      // Decode the token
      const tokenData = JSON.parse(Buffer.from(authToken, 'base64').toString());
      
      // Check if token is expired
      if (tokenData.exp && tokenData.exp < Date.now()) {
        return Response.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }

      return Response.json({
        user: {
          id: tokenData.sub,
          email: tokenData.email,
          name: tokenData.name,
          role: tokenData.role,
        }
      });
    } catch (error) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
