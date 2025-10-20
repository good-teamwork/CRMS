// Root API route handler
export async function GET() {
  return Response.json({ 
    message: 'API is running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/dashboard',
      '/api/merchants',
      '/api/mobile-apps',
      '/api/support',
      '/api/transactions'
    ]
  });
}

export async function POST() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

