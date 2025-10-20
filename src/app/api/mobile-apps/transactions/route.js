import sql from "@/app/api/utils/sql";

// Get app transactions with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('app_id');
    const search = searchParams.get('search');
    const transactionType = searchParams.get('transaction_type');
    const freeVersionOnly = searchParams.get('free_version_only');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT 
        at.*,
        ma.app_name,
        ma.app_type,
        ma.is_free_version as app_has_free_version
      FROM app_transactions at
      JOIN mobile_applications ma ON at.app_id = ma.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (appId) {
      paramCount++;
      query += ` AND at.app_id = $${paramCount}`;
      values.push(appId);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(at.reference_number) LIKE LOWER($${paramCount}) OR
        LOWER(at.user_email) LIKE LOWER($${paramCount}) OR
        LOWER(at.description) LIKE LOWER($${paramCount}) OR
        LOWER(ma.app_name) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${search}%`);
    }

    if (transactionType) {
      paramCount++;
      query += ` AND at.transaction_type = $${paramCount}`;
      values.push(transactionType);
    }

    if (freeVersionOnly === 'true') {
      query += ` AND at.is_free_version_transaction = TRUE`;
    }

    if (startDate) {
      paramCount++;
      query += ` AND at.processed_at >= $${paramCount}`;
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND at.processed_at <= $${paramCount}`;
      values.push(endDate);
    }

    query += ` ORDER BY at.processed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const transactions = await sql(query, values);

    // Get analytics
    let analyticsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(at.transaction_amount) as totalAmount,
        SUM(at.our_revenue) as totalRevenue,
        COUNT(CASE WHEN at.is_free_version_transaction = TRUE THEN 1 END) as freeVersionTransactions,
        COUNT(CASE WHEN at.is_free_version_transaction = FALSE THEN 1 END) as premiumTransactions
      FROM app_transactions at
      JOIN mobile_applications ma ON at.app_id = ma.id
      WHERE 1=1
    `;
    
    const analyticsValues = [];
    let analyticsParamCount = 0;

    if (appId) {
      analyticsParamCount++;
      analyticsQuery += ` AND at.app_id = $${analyticsParamCount}`;
      analyticsValues.push(appId);
    }

    if (search) {
      analyticsParamCount++;
      analyticsQuery += ` AND (
        LOWER(at.reference_number) LIKE LOWER($${analyticsParamCount}) OR
        LOWER(at.user_email) LIKE LOWER($${analyticsParamCount}) OR
        LOWER(at.description) LIKE LOWER($${analyticsParamCount}) OR
        LOWER(ma.app_name) LIKE LOWER($${analyticsParamCount})
      )`;
      analyticsValues.push(`%${search}%`);
    }

    if (transactionType) {
      analyticsParamCount++;
      analyticsQuery += ` AND at.transaction_type = $${analyticsParamCount}`;
      analyticsValues.push(transactionType);
    }

    if (freeVersionOnly === 'true') {
      analyticsQuery += ` AND at.is_free_version_transaction = TRUE`;
    }

    if (startDate) {
      analyticsParamCount++;
      analyticsQuery += ` AND at.processed_at >= $${analyticsParamCount}`;
      analyticsValues.push(startDate);
    }

    if (endDate) {
      analyticsParamCount++;
      analyticsQuery += ` AND at.processed_at <= $${analyticsParamCount}`;
      analyticsValues.push(endDate);
    }

    const analyticsResult = await sql(analyticsQuery, analyticsValues);
    const analytics = analyticsResult[0];

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM app_transactions at
      JOIN mobile_applications ma ON at.app_id = ma.id
      WHERE 1=1
    `;
    
    const countValues = [];
    let countParamCount = 0;

    if (appId) {
      countParamCount++;
      countQuery += ` AND at.app_id = $${countParamCount}`;
      countValues.push(appId);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(at.reference_number) LIKE LOWER($${countParamCount}) OR
        LOWER(at.user_email) LIKE LOWER($${countParamCount}) OR
        LOWER(at.description) LIKE LOWER($${countParamCount}) OR
        LOWER(ma.app_name) LIKE LOWER($${countParamCount})
      )`;
      countValues.push(`%${search}%`);
    }

    if (transactionType) {
      countParamCount++;
      countQuery += ` AND at.transaction_type = $${countParamCount}`;
      countValues.push(transactionType);
    }

    if (freeVersionOnly === 'true') {
      countQuery += ` AND at.is_free_version_transaction = TRUE`;
    }

    if (startDate) {
      countParamCount++;
      countQuery += ` AND at.processed_at >= $${countParamCount}`;
      countValues.push(startDate);
    }

    if (endDate) {
      countParamCount++;
      countQuery += ` AND at.processed_at <= $${countParamCount}`;
      countValues.push(endDate);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      transactions,
      analytics: {
        total: parseInt(analytics.total),
        totalAmount: parseFloat(analytics.totalamount || 0),
        totalRevenue: parseFloat(analytics.totalrevenue || 0),
        freeVersionTransactions: parseInt(analytics.freeversiontransactions || 0),
        premiumTransactions: parseInt(analytics.premiumtransactions || 0)
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching app transactions:', error);
    return Response.json({ error: 'Failed to fetch app transactions' }, { status: 500 });
  }
}

// Create new app transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      app_id,
      transaction_amount,
      transaction_type = 'app_payment',
      transaction_status = 'completed',
      reference_number,
      user_email,
      description,
      device_info,
      app_version,
      is_free_version_transaction = false
    } = body;

    if (!app_id || !transaction_amount) {
      return Response.json({ error: 'App ID and transaction amount are required' }, { status: 400 });
    }

    // Get app to verify it exists and get revenue rate
    const app = await sql`
      SELECT revenue_rate FROM mobile_applications WHERE id = ${app_id}
    `;

    if (app.length === 0) {
      return Response.json({ error: 'Mobile application not found' }, { status: 404 });
    }

    const revenueRate = parseFloat(app[0].revenue_rate) || 0.0020;

    const result = await sql`
      INSERT INTO app_transactions (
        app_id, transaction_amount, transaction_type, transaction_status,
        reference_number, user_email, description, device_info, app_version,
        is_free_version_transaction, revenue_rate
      ) VALUES (
        ${app_id}, ${transaction_amount}, ${transaction_type}, ${transaction_status},
        ${reference_number}, ${user_email}, ${description}, ${JSON.stringify(device_info)}, 
        ${app_version}, ${is_free_version_transaction}, ${revenueRate}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating app transaction:', error);
    return Response.json({ error: 'Failed to create app transaction' }, { status: 500 });
  }
}