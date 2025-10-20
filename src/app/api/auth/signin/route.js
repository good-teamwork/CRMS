import sql from "@/app/api/utils/sql";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('API Route: Received login attempt for:', { email, password });

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Query the database for the user
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_active 
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return Response.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Create simple session token
    const token = Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    // Set cookie
    const response = Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.headers.set(
      "Set-Cookie",
      `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
