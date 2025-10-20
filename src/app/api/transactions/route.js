import sql from "@/app/api/utils/sql";

// Get all transactions with filtering and analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const merchantId = searchParams.get('merchant_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT 
        pt.*,
        m.business_name,
        m.contact_name,
        m.is_loyal_merchant
      FROM processing_transactions pt
      JOIN merchants m ON pt.merchant_id = m.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(pt.reference_number) LIKE LOWER($${paramCount}) OR
        LOWER(pt.customer_email) LIKE LOWER($${paramCount}) OR
        LOWER(m.business_name) LIKE LOWER($${paramCount})
      )`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND pt.status = $${paramCount}`;
      values.push(status);
    }

    if (merchantId) {
      paramCount++;
      query += ` AND pt.merchant_id = $${paramCount}`;
      values.push(merchantId);
    }

    if (startDate) {
      paramCount++;
      query += ` AND pt.processed_at >= $${paramCount}`;
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND pt.processed_at <= $${paramCount}`;
      values.push(endDate);
    }

    query += ` ORDER BY pt.processed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const transactions = await sql(query, values);

    // Get analytics
    let analyticsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(pt.transaction_amount) as totalAmount,
        SUM(pt.transaction_fee) as totalFees,
        SUM(pt.our_revenue) as totalRevenue,
        COUNT(CASE WHEN pt.is_cash_transaction = FALSE THEN 1 END) as nonCashTransactions,
        COUNT(CASE WHEN pt.is_cash_transaction = TRUE THEN 1 END) as cashTransactions
      FROM processing_transactions pt
      JOIN merchants m ON pt.merchant_id = m.id
      WHERE 1=1
    `;
    
    const analyticsValues = [];
    let analyticsParamCount = 0;

    if (search) {
      analyticsParamCount++;
      analyticsQuery += ` AND (
        LOWER(pt.reference_number) LIKE LOWER($${analyticsParamCount}) OR
        LOWER(pt.customer_email) LIKE LOWER($${analyticsParamCount}) OR
        LOWER(m.business_name) LIKE LOWER($${analyticsParamCount})
      )`;
      analyticsValues.push(`%${search}%`);
    }

    if (status) {
      analyticsParamCount++;
      analyticsQuery += ` AND pt.transaction_status = $${analyticsParamCount}`;
      analyticsValues.push(status);
    }

    if (merchantId) {
      analyticsParamCount++;
      analyticsQuery += ` AND pt.merchant_id = $${analyticsParamCount}`;
      analyticsValues.push(merchantId);
    }

    if (startDate) {
      analyticsParamCount++;
      analyticsQuery += ` AND pt.processed_at >= $${analyticsParamCount}`;
      analyticsValues.push(startDate);
    }

    if (endDate) {
      analyticsParamCount++;
      analyticsQuery += ` AND pt.processed_at <= $${analyticsParamCount}`;
      analyticsValues.push(endDate);
    }

    const analyticsResult = await sql(analyticsQuery, analyticsValues);
    const analytics = analyticsResult[0];

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM processing_transactions pt
      JOIN merchants m ON pt.merchant_id = m.id
      WHERE 1=1
    `;
    
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(pt.reference_number) LIKE LOWER($${countParamCount}) OR
        LOWER(pt.customer_email) LIKE LOWER($${countParamCount}) OR
        LOWER(m.business_name) LIKE LOWER($${countParamCount})
      )`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND pt.status = $${countParamCount}`;
      countValues.push(status);
    }

    if (merchantId) {
      countParamCount++;
      countQuery += ` AND pt.merchant_id = $${countParamCount}`;
      countValues.push(merchantId);
    }

    if (startDate) {
      countParamCount++;
      countQuery += ` AND pt.processed_at >= $${countParamCount}`;
      countValues.push(startDate);
    }

    if (endDate) {
      countParamCount++;
      countQuery += ` AND pt.processed_at <= $${countParamCount}`;
      countValues.push(endDate);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      transactions,
      analytics: {
        total: parseInt(analytics.total),
        totalAmount: parseFloat(analytics.totalamount || 0),
        totalFees: parseFloat(analytics.totalfees || 0),
        totalRevenue: parseFloat(analytics.totalrevenue || 0),
        nonCashTransactions: parseInt(analytics.noncashtransactions || 0),
        cashTransactions: parseInt(analytics.cashtransactions || 0)
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// Create new transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      merchant_id,
      transaction_amount,
      transaction_type = 'payment',
      transaction_status = 'completed',
      reference_number,
      customer_email,
      description,
      is_cash_transaction = false
    } = body;

    // Validate required fields
    if (!merchant_id || !transaction_amount) {
      return Response.json({ error: 'Merchant ID and transaction amount are required' }, { status: 400 });
    }

    // Get merchant to calculate fee
    const merchant = await sql`
      SELECT processing_fee_rate FROM merchants WHERE id = ${merchant_id}
    `;

    if (merchant.length === 0) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const feeRate = parseFloat(merchant[0].processing_fee_rate) || 0.029;
    const transactionFee = parseFloat(transaction_amount) * feeRate;

    const result = await sql`
      INSERT INTO processing_transactions (
        merchant_id, transaction_amount, transaction_fee, transaction_type,
        transaction_status, reference_number, customer_email, description,
        is_cash_transaction
      ) VALUES (
        ${merchant_id}, ${transaction_amount}, ${transactionFee}, ${transaction_type},
        ${transaction_status}, ${reference_number}, ${customer_email}, ${description},
        ${is_cash_transaction}
      ) RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return Response.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}