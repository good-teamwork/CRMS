import sql from "@/app/api/utils/sql";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password, role = 'admin' } = await request.json();
    console.log('API Route: Received signup attempt for:', { name, email, role });

    // Validation
    const errors = {};

    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!['admin', 'manager', 'support'].includes(role)) {
      errors.role = "Invalid role selected";
    }

    if (Object.keys(errors).length > 0) {
      return Response.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (existingUsers.length > 0) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name.trim()}, ${email.toLowerCase()}, ${passwordHash}, ${role}, true)
      RETURNING id, email, name, role, is_active, created_at
    `;

    if (newUser.length === 0) {
      return Response.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const user = newUser[0];

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
      message: "User created successfully",
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
    console.error("Signup error:", error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
