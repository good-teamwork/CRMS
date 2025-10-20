import sql from "@/app/api/utils/sql";

// Get all mobile applications with analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        ma.*,
        COUNT(at.id) as total_transactions,
        SUM(at.transaction_amount) as total_revenue_amount,
        SUM(at.our_revenue) as total_our_revenue,
        COUNT(CASE WHEN at.is_free_version_transaction = TRUE THEN 1 END) as free_version_transactions,
        COUNT(CASE WHEN at.processed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_transactions
      FROM mobile_applications ma
      LEFT JOIN app_transactions at ON ma.id = at.app_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND ma.status = $${paramCount}`;
      values.push(status);
    }

    query += `
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
    `;

    const apps = await sql(query, values);

    // Get recent app transactions for each app
    const appsWithTransactions = await Promise.all(
      apps.map(async (app) => {
        const recentTransactions = await sql`
          SELECT * FROM app_transactions 
          WHERE app_id = ${app.id} 
          ORDER BY processed_at DESC 
          LIMIT 5
        `;
        
        return {
          ...app,
          recent_transactions: recentTransactions,
          total_transactions: parseInt(app.total_transactions || 0),
          total_revenue_amount: parseFloat(app.total_revenue_amount || 0),
          total_our_revenue: parseFloat(app.total_our_revenue || 0),
          free_version_transactions: parseInt(app.free_version_transactions || 0),
          recent_transactions_count: parseInt(app.recent_transactions || 0)
        };
      })
    );

    return Response.json({ apps: appsWithTransactions });
  } catch (error) {
    console.error('Error fetching mobile apps:', error);
    return Response.json({ error: 'Failed to fetch mobile applications' }, { status: 500 });
  }
}

// Create new mobile application
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      app_name,
      app_type,
      description,
      version,
      status = 'active',
      revenue_rate = 0.0020,
      is_free_version = false,
      total_downloads = 0,
      active_users = 0
    } = body;

    if (!app_name || !app_type) {
      return Response.json({ error: 'App name and type are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO mobile_applications (
        app_name, app_type, description, version, status, 
        revenue_rate, is_free_version, total_downloads, active_users
      ) VALUES (
        ${app_name}, ${app_type}, ${description}, ${version}, ${status},
        ${revenue_rate}, ${is_free_version}, ${total_downloads}, ${active_users}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating mobile app:', error);
    return Response.json({ error: 'Failed to create mobile application' }, { status: 500 });
  }
}

// Update mobile application
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json({ error: 'App ID is required' }, { status: 400 });
    }

    const setClause = [];
    const values = [];
    let paramCount = 0;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (setClause.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    paramCount++;
    setClause.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // Add id for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE mobile_applications 
      SET ${setClause.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Mobile application not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating mobile app:', error);
    return Response.json({ error: 'Failed to update mobile application' }, { status: 500 });
  }
}