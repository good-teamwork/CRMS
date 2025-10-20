import sql from "@/app/api/utils/sql";

// Get all merchants with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = 'SELECT * FROM merchants WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(business_name) LIKE LOWER($${paramCount}) OR LOWER(contact_name) LIKE LOWER($${paramCount}) OR LOWER(email) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const merchants = await sql(query, values);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM merchants WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countValues.push(status);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (LOWER(business_name) LIKE LOWER($${countParamCount}) OR LOWER(contact_name) LIKE LOWER($${countParamCount}) OR LOWER(email) LIKE LOWER($${countParamCount}))`;
      countValues.push(`%${search}%`);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      merchants,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return Response.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

// Create new merchant
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      business_name,
      contact_name,
      email,
      phone,
      business_type,
      website,
      address,
      city,
      state,
      zip_code,
      country = 'US',
      monthly_processing_limit,
      processing_fee_rate = 0.0290
    } = body;

    // Validate required fields
    if (!business_name || !contact_name || !email) {
      return Response.json({ error: 'Business name, contact name, and email are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO merchants (
        business_name, contact_name, email, phone, business_type, 
        website, address, city, state, zip_code, country,
        monthly_processing_limit, processing_fee_rate
      ) VALUES (
        ${business_name}, ${contact_name}, ${email}, ${phone}, ${business_type},
        ${website}, ${address}, ${city}, ${state}, ${zip_code}, ${country},
        ${monthly_processing_limit}, ${processing_fee_rate}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating merchant:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create merchant' }, { status: 500 });
  }
}