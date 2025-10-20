import sql from "@/app/api/utils/sql";

// Get single support ticket with responses
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get ticket details
    const ticketResult = await sql`
      SELECT st.*, m.business_name, m.contact_name, m.email as merchant_email
      FROM support_tickets st
      LEFT JOIN merchants m ON st.merchant_id = m.id
      WHERE st.id = ${id}
    `;

    if (ticketResult.length === 0) {
      return Response.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    // Get ticket responses
    const responsesResult = await sql`
      SELECT * FROM support_responses 
      WHERE ticket_id = ${id} 
      ORDER BY created_at ASC
    `;

    const ticket = ticketResult[0];
    ticket.responses = responsesResult;

    return Response.json(ticket);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return Response.json({ error: 'Failed to fetch support ticket' }, { status: 500 });
  }
}

// Update support ticket
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = ['subject', 'description', 'priority', 'status', 'category', 'assigned_to'];

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

    // Add updated_at timestamp
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add resolved_at if status is being set to resolved
    if (body.status === 'resolved') {
      paramCount++;
      updateFields.push(`resolved_at = $${paramCount}`);
      values.push(new Date().toISOString());
    }

    // Add ID for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE support_tickets 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return Response.json({ error: 'Failed to update support ticket' }, { status: 500 });
  }
}

// Add response to support ticket
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      response_text,
      is_staff_response = false,
      responder_name,
      responder_email
    } = body;

    // Validate required fields
    if (!response_text) {
      return Response.json({ error: 'Response text is required' }, { status: 400 });
    }

    // Check if ticket exists
    const ticketCheck = await sql`
      SELECT id FROM support_tickets WHERE id = ${id}
    `;

    if (ticketCheck.length === 0) {
      return Response.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    const result = await sql`
      INSERT INTO support_responses (
        ticket_id, response_text, is_staff_response, responder_name, responder_email
      ) VALUES (
        ${id}, ${response_text}, ${is_staff_response}, ${responder_name}, ${responder_email}
      ) RETURNING *
    `;

    // Update ticket's updated_at timestamp
    await sql`
      UPDATE support_tickets 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding support response:', error);
    return Response.json({ error: 'Failed to add support response' }, { status: 500 });
  }
}