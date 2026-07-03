const fs = require('fs');
let code = fs.readFileSync('src/server/routes.ts', 'utf-8');

const reportEndpoints = `
// Reports
apiRouter.get("/admin/reports/:type", requireAdmin, async (req: any, res) => {
  try {
    const { type } = req.params;
    const { start, end } = req.query;
    
    let baseOrders = await db.select().from(orders);
    
    if (start) {
      const s = new Date(start);
      baseOrders = baseOrders.filter(o => new Date(o.createdAt) >= s);
    }
    if (end) {
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      baseOrders = baseOrders.filter(o => new Date(o.createdAt) <= e);
    }

    if (type === 'sales') {
      const report = [];
      const grouped = {};
      baseOrders.forEach(o => {
        const date = o.createdAt.toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = { date, order_count: 0, total_value: 0 };
        grouped[date].order_count++;
        grouped[date].total_value += Number(o.totalAmount);
      });
      Object.values(grouped).forEach((v: any) => {
        v.average_order_value = (v.total_value / v.order_count).toFixed(2);
        report.push(v);
      });
      return res.json(report.sort((a,b) => a.date.localeCompare(b.date)));
    }
    
    if (type === 'revenue') {
      let gross = 0;
      let refunds = 0;
      baseOrders.forEach(o => {
        gross += Number(o.totalAmount);
        if (o.status === 'REFUNDED') refunds += Number(o.totalAmount); // Simplified
      });
      return res.json([{ 
        metric: 'Gross Revenue', value: gross.toFixed(2) 
      }, {
        metric: 'Total Refunds', value: refunds.toFixed(2)
      }, {
        metric: 'Net Revenue', value: (gross - refunds).toFixed(2)
      }]);
    }

    if (type === 'products') {
      const allOrderItems = await db.select().from(orderItems);
      const itemsMap = {};
      
      const orderIds = new Set(baseOrders.map(o => o.id));
      const filteredItems = allOrderItems.filter(oi => orderIds.has(oi.orderId));
      
      filteredItems.forEach(oi => {
        if (!itemsMap[oi.productId]) itemsMap[oi.productId] = 0;
        itemsMap[oi.productId] += oi.quantity;
      });
      
      const prods = await db.select().from(products);
      const report = prods.map(p => ({
        product_id: p.id,
        product_name: p.name,
        units_sold: itemsMap[p.id] || 0,
        current_stock: p.stock
      })).sort((a, b) => b.units_sold - a.units_sold);
      
      return res.json(report);
    }
    
    if (type === 'inventory') {
      const prods = await db.select().from(products);
      const report = prods.map(p => ({
        product_id: p.id,
        product_name: p.name,
        stock_status: p.stock <= 0 ? 'Out of Stock' : (p.stock < 10 ? 'Low Stock' : 'In Stock'),
        current_stock: p.stock
      }));
      return res.json(report);
    }
    
    if (type === 'customers') {
      const allUsers = await db.select().from(users);
      let customerIds = new Set(baseOrders.map(o => o.userId));
      const report = allUsers.filter(u => customerIds.has(u.id)).map(u => {
        const userOrders = baseOrders.filter(o => o.userId === u.id);
        const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        return {
          customer_id: u.id,
          name: u.name || 'Guest',
          email: u.email,
          order_count: userOrders.length,
          total_spend: totalSpend.toFixed(2)
        };
      }).sort((a,b) => Number(b.total_spend) - Number(a.total_spend));
      return res.json(report);
    }
    
    if (type === 'coupons') {
      const allCoupons = await db.select().from(coupons);
      const report = allCoupons.map(c => ({
        code: c.code,
        discount: c.type === 'PERCENTAGE' ? \`\${c.discount}%\` : \`₹\${c.discount}\`,
        usage_limit: c.usageLimit || 'Unlimited',
        times_used: c.usageCount
      }));
      return res.json(report);
    }

    if (type === 'taxes') {
      let totalTax = 0;
      baseOrders.forEach(o => {
        // Simplified tax calculation if not explicitly stored per order
        const tax = Number(o.totalAmount) * 0.18; // assuming 18% for demo if not saved
        totalTax += tax;
      });
      return res.json([{ period: start || 'All time', estimated_tax_collected: totalTax.toFixed(2) }]);
    }
    
    if (type === 'payments') {
      const grouped = {};
      baseOrders.forEach(o => {
        const status = o.paymentStatus || 'UNKNOWN';
        if (!grouped[status]) grouped[status] = 0;
        grouped[status]++;
      });
      const report = Object.keys(grouped).map(k => ({
        payment_status: k,
        transaction_count: grouped[k]
      }));
      return res.json(report);
    }

    res.status(400).json({ error: "Unknown report type" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(/export const apiRouter = Router\(\);/, 'export const apiRouter = Router();\n' + reportEndpoints);

fs.writeFileSync('src/server/routes.ts', code);
