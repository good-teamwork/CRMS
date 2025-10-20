import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period")) || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get merchant statistics
    const merchantStats = await sql`
      SELECT 
        COUNT(*) as total_merchants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_merchants,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_merchants,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_merchants,
        COUNT(CASE WHEN is_loyal_merchant = TRUE THEN 1 END) as loyal_merchants,
        COUNT(CASE WHEN created_at >= ${startDate.toISOString()} THEN 1 END) as new_merchants
      FROM merchants
    `;

    // Get transaction statistics
    const transactionStats = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(transaction_amount) as total_volume,
        SUM(transaction_fee) as total_fees,
        SUM(our_revenue) as total_revenue,
        COUNT(CASE WHEN processed_at >= ${startDate.toISOString()} THEN 1 END) as recent_transactions,
        SUM(CASE WHEN processed_at >= ${startDate.toISOString()} THEN transaction_amount ELSE 0 END) as recent_volume,
        SUM(CASE WHEN processed_at >= ${startDate.toISOString()} THEN our_revenue ELSE 0 END) as recent_revenue,
        COUNT(CASE WHEN is_cash_transaction = FALSE THEN 1 END) as non_cash_transactions,
        COUNT(CASE WHEN is_cash_transaction = TRUE THEN 1 END) as cash_transactions
      FROM processing_transactions
    `;

    // Get support statistics
    const supportStats = await sql`
      SELECT 
        COUNT(CASE WHEN status IN ('open', 'in_progress') THEN 1 END) as open_tickets,
        COUNT(CASE WHEN priority = 'high' AND status IN ('open', 'in_progress') THEN 1 END) as high_priority_open,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets
      FROM support_tickets
    `;

    // Get mobile app statistics
    const mobileAppStats = await sql`
      SELECT 
        COUNT(*) as total_apps,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_apps,
        SUM(total_downloads) as total_downloads,
        SUM(active_users) as total_active_users,
        COUNT(CASE WHEN is_free_version = TRUE THEN 1 END) as apps_with_free_version
      FROM mobile_applications
    `;

    // Get app transaction statistics
    const appTransactionStats = await sql`
      SELECT 
        COUNT(*) as total_app_transactions,
        SUM(transaction_amount) as total_app_volume,
        SUM(our_revenue) as total_app_revenue,
        COUNT(CASE WHEN processed_at >= ${startDate.toISOString()} THEN 1 END) as recent_app_transactions,
        SUM(CASE WHEN processed_at >= ${startDate.toISOString()} THEN transaction_amount ELSE 0 END) as recent_app_volume,
        SUM(CASE WHEN processed_at >= ${startDate.toISOString()} THEN our_revenue ELSE 0 END) as recent_app_revenue,
        COUNT(CASE WHEN is_free_version_transaction = TRUE THEN 1 END) as free_version_transactions,
        COUNT(CASE WHEN is_free_version_transaction = FALSE THEN 1 END) as premium_transactions
      FROM app_transactions
    `;

    // Get daily volume for chart (last 30 days)
    const dailyVolumeQuery = `
      SELECT 
        DATE(processed_at) as date,
        SUM(transaction_amount) as daily_volume,
        SUM(our_revenue) as daily_revenue,
        COUNT(*) as daily_transactions
      FROM processing_transactions 
      WHERE processed_at >= $1
      GROUP BY DATE(processed_at)
      ORDER BY date ASC
    `;

    const chartStartDate = new Date();
    chartStartDate.setDate(chartStartDate.getDate() - 30);
    const dailyVolume = await sql(dailyVolumeQuery, [
      chartStartDate.toISOString(),
    ]);

    // Get top merchants by volume
    const topMerchantsQuery = `
      SELECT 
        m.business_name,
        m.is_loyal_merchant,
        SUM(pt.transaction_amount) as total_volume,
        SUM(pt.our_revenue) as total_revenue,
        COUNT(pt.id) as transaction_count
      FROM merchants m
      JOIN processing_transactions pt ON m.id = pt.merchant_id
      WHERE pt.processed_at >= $1
      GROUP BY m.id, m.business_name, m.is_loyal_merchant
      ORDER BY total_volume DESC
      LIMIT 10
    `;
    const topMerchants = await sql(topMerchantsQuery, [
      startDate.toISOString(),
    ]);

    // Get top performing apps
    const topAppsQuery = `
      SELECT 
        ma.app_name,
        ma.app_type,
        ma.is_free_version,
        SUM(at.transaction_amount) as total_volume,
        SUM(at.our_revenue) as total_revenue,
        COUNT(at.id) as transaction_count
      FROM mobile_applications ma
      LEFT JOIN app_transactions at ON ma.id = at.app_id 
      AND at.processed_at >= $1
      GROUP BY ma.id, ma.app_name, ma.app_type, ma.is_free_version
      ORDER BY total_volume DESC NULLS LAST
      LIMIT 5
    `;
    const topApps = await sql(topAppsQuery, [startDate.toISOString()]);

    // Get recent support tickets
    const recentTicketsQuery = `
      SELECT 
        st.id,
        st.subject,
        st.priority,
        st.status,
        st.created_at,
        m.business_name,
        m.contact_name,
        m.is_loyal_merchant
      FROM support_tickets st
      JOIN merchants m ON st.merchant_id = m.id
      ORDER BY st.created_at DESC
      LIMIT 5
    `;
    const recentTickets = await sql(recentTicketsQuery);

    // Get revenue breakdown
    const revenueBreakdown = await sql`
      SELECT 
        SUM(CASE WHEN is_cash_transaction = FALSE THEN our_revenue ELSE 0 END) as non_cash_revenue,
        SUM(CASE WHEN is_cash_transaction = TRUE THEN our_revenue ELSE 0 END) as cash_revenue,
        COUNT(CASE WHEN is_cash_transaction = FALSE THEN 1 END) as non_cash_count,
        COUNT(CASE WHEN is_cash_transaction = TRUE THEN 1 END) as cash_count
      FROM processing_transactions
      WHERE processed_at >= ${startDate.toISOString()}
    `;

    return Response.json({
      merchants: {
        total_merchants: parseInt(merchantStats[0].total_merchants),
        active_merchants: parseInt(merchantStats[0].active_merchants),
        pending_merchants: parseInt(merchantStats[0].pending_merchants),
        under_review_merchants: parseInt(
          merchantStats[0].under_review_merchants,
        ),
        loyal_merchants: parseInt(merchantStats[0].loyal_merchants),
        new_merchants: parseInt(merchantStats[0].new_merchants),
      },
      transactions: {
        total_transactions: parseInt(transactionStats[0].total_transactions),
        total_volume: parseFloat(transactionStats[0].total_volume || 0),
        total_fees: parseFloat(transactionStats[0].total_fees || 0),
        total_revenue: parseFloat(transactionStats[0].total_revenue || 0),
        recent_transactions: parseInt(transactionStats[0].recent_transactions),
        recent_volume: parseFloat(transactionStats[0].recent_volume || 0),
        recent_revenue: parseFloat(transactionStats[0].recent_revenue || 0),
        non_cash_transactions: parseInt(
          transactionStats[0].non_cash_transactions,
        ),
        cash_transactions: parseInt(transactionStats[0].cash_transactions),
      },
      support: {
        open_tickets: parseInt(supportStats[0].open_tickets),
        high_priority_open: parseInt(supportStats[0].high_priority_open),
        resolved_tickets: parseInt(supportStats[0].resolved_tickets),
      },
      mobileApps: {
        total_apps: parseInt(mobileAppStats[0].total_apps || 0),
        active_apps: parseInt(mobileAppStats[0].active_apps || 0),
        total_downloads: parseInt(mobileAppStats[0].total_downloads || 0),
        total_active_users: parseInt(mobileAppStats[0].total_active_users || 0),
        apps_with_free_version: parseInt(
          mobileAppStats[0].apps_with_free_version || 0,
        ),
      },
      appTransactions: {
        total_app_transactions: parseInt(
          appTransactionStats[0].total_app_transactions || 0,
        ),
        total_app_volume: parseFloat(
          appTransactionStats[0].total_app_volume || 0,
        ),
        total_app_revenue: parseFloat(
          appTransactionStats[0].total_app_revenue || 0,
        ),
        recent_app_transactions: parseInt(
          appTransactionStats[0].recent_app_transactions || 0,
        ),
        recent_app_volume: parseFloat(
          appTransactionStats[0].recent_app_volume || 0,
        ),
        recent_app_revenue: parseFloat(
          appTransactionStats[0].recent_app_revenue || 0,
        ),
        free_version_transactions: parseInt(
          appTransactionStats[0].free_version_transactions || 0,
        ),
        premium_transactions: parseInt(
          appTransactionStats[0].premium_transactions || 0,
        ),
      },
      revenue: {
        non_cash_revenue: parseFloat(revenueBreakdown[0].non_cash_revenue || 0),
        cash_revenue: parseFloat(revenueBreakdown[0].cash_revenue || 0),
        non_cash_count: parseInt(revenueBreakdown[0].non_cash_count),
        cash_count: parseInt(revenueBreakdown[0].cash_count),
      },
      dailyVolume: dailyVolume.map((row) => ({
        date: row.date,
        daily_volume: parseFloat(row.daily_volume || 0),
        daily_revenue: parseFloat(row.daily_revenue || 0),
        daily_transactions: parseInt(row.daily_transactions),
      })),
      topMerchants: topMerchants.map((row) => ({
        business_name: row.business_name,
        is_loyal_merchant: row.is_loyal_merchant,
        total_volume: parseFloat(row.total_volume || 0),
        total_revenue: parseFloat(row.total_revenue || 0),
        transaction_count: parseInt(row.transaction_count),
      })),
      topApps: topApps.map((row) => ({
        app_name: row.app_name,
        app_type: row.app_type,
        is_free_version: row.is_free_version,
        total_volume: parseFloat(row.total_volume || 0),
        total_revenue: parseFloat(row.total_revenue || 0),
        transaction_count: parseInt(row.transaction_count || 0),
      })),
      recentTickets: recentTickets.map((row) => ({
        id: row.id,
        subject: row.subject,
        priority: row.priority,
        status: row.status,
        created_at: row.created_at,
        business_name: row.business_name,
        contact_name: row.contact_name,
        is_loyal_merchant: row.is_loyal_merchant,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
