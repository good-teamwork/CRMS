import sql from "@/app/api/utils/sql";

// Get single merchant
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const merchant = await sql`
      SELECT * FROM merchants WHERE id = ${id}
    `;

    if (merchant.length === 0) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return Response.json(merchant[0]);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return Response.json({ error: 'Failed to fetch merchant' }, { status: 500 });
  }
}

// Update merchant
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'business_name', 'contact_name', 'email', 'phone', 'business_type',
      'website', 'address', 'city', 'state', 'zip_code', 'country',
      'status', 'onboarding_step', 'monthly_processing_limit', 
      'processing_fee_rate', 'approved_at'
    ];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add ID for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE merchants 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating merchant:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to update merchant' }, { status: 500 });
  }
}