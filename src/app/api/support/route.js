import sql from "@/app/api/utils/sql";

// Get support tickets with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT st.*, m.business_name, m.contact_name, m.email as merchant_email
      FROM support_tickets st
      LEFT JOIN merchants m ON st.merchant_id = m.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (merchantId) {
      paramCount++;
      query += ` AND st.merchant_id = $${paramCount}`;
      values.push(merchantId);
    }

    if (status) {
      paramCount++;
      query += ` AND st.status = $${paramCount}`;
      values.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND st.priority = $${paramCount}`;
      values.push(priority);
    }

    if (category) {
      paramCount++;
      query += ` AND st.category = $${paramCount}`;
      values.push(category);
    }

    query += ` ORDER BY st.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const tickets = await sql(query, values);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM support_tickets st WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (merchantId) {
      countParamCount++;
      countQuery += ` AND st.merchant_id = $${countParamCount}`;
      countValues.push(merchantId);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND st.status = $${countParamCount}`;
      countValues.push(status);
    }

    if (priority) {
      countParamCount++;
      countQuery += ` AND st.priority = $${countParamCount}`;
      countValues.push(priority);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND st.category = $${countParamCount}`;
      countValues.push(category);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      tickets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return Response.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}

// Create new support ticket
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      merchant_id,
      subject,
      description,
      priority = 'medium',
      category
    } = body;

    // Validate required fields
    if (!merchant_id || !subject || !description) {
      return Response.json({ error: 'Merchant ID, subject, and description are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO support_tickets (
        merchant_id, subject, description, priority, category
      ) VALUES (
        ${merchant_id}, ${subject}, ${description}, ${priority}, ${category}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return Response.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}