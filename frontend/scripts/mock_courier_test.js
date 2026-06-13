// mock_courier_test.js
// Quick manual test (mock API) for courier flows: GET tasks, pickup, deliver, return

const TASKS = [
  { assignment_id: 1, order_item_id: 101, product_name: "Produk A", status: "menunggu kurir" },
  { assignment_id: 2, order_item_id: 102, product_name: "Produk B", status: "sedang dikirim" },
];

function log(title, v) {
  console.log('\n=== ' + title + ' ===');
  console.log(JSON.stringify(v, null, 2));
}

async function mockFetch(url, opts = {}) {
  // simple router
  const method = (opts.method || 'GET').toUpperCase();
  // return list
  if (url.endsWith('/courier/task') && method === 'GET') {
    return { ok: true, json: async () => ({ data: TASKS }) };
  }
  // pickup
  if (url.match(/order-items\/101\/pickup/) && method === 'PUT') {
    // simulate changing status
    TASKS[0].status = 'sedang dikirim';
    return { ok: true, json: async () => ({ data: { success: true } }) };
  }
  // deliver
  if (url.match(/order-items\/101\/deliver/) && method === 'PUT') {
    TASKS[0].status = 'sampai di tujuan';
    return { ok: true, json: async () => ({ data: { success: true } }) };
  }
  // return
  if (url.match(/order-items\/101\/return/) && method === 'PUT') {
    TASKS[0].status = 'dikirim balik';
    return { ok: true, json: async () => ({ data: { success: true } }) };
  }
  return { ok: false, status: 404, json: async () => ({ message: 'Not found' }) };
}

function apiUrl(path) {
  return path; // keep simple
}

function buildAuthHeaders() { return {}; }

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.message || `Request failed ${res.status}`);
  return data;
}

function unwrapData(payload) { return payload?.data ?? payload; }

// Minimal courierService replica using mockFetch
const courierService = {
  async getTasks() {
    const res = await mockFetch(apiUrl('/courier/task'));
    const data = await handleResponse(res);
    return Array.isArray(unwrapData(data)) ? unwrapData(data) : [];
  },
  async pickupOrderItem(orderItemId) {
    const res = await mockFetch(apiUrl(`/courier/order-items/${orderItemId}/pickup`), { method: 'PUT' });
    return unwrapData(await handleResponse(res));
  },
  async deliverOrderItem(orderItemId) {
    const res = await mockFetch(apiUrl(`/courier/order-items/${orderItemId}/deliver`), { method: 'PUT' });
    return unwrapData(await handleResponse(res));
  },
  async returnOrderItem(orderItemId) {
    const res = await mockFetch(apiUrl(`/courier/order-items/${orderItemId}/return`), { method: 'PUT' });
    return unwrapData(await handleResponse(res));
  }
};

(async () => {
  try {
    console.log('Starting mock courier flow test...');

    const tasks = await courierService.getTasks();
    log('Initial tasks', tasks);

    const first = tasks[0];
    if (!first) throw new Error('No tasks to test');

    console.log(`\nSimulate pickup for order_item_id=${first.order_item_id}`);
    await courierService.pickupOrderItem(first.order_item_id);
    log('After pickup', TASKS);

    console.log(`\nSimulate deliver for order_item_id=${first.order_item_id}`);
    await courierService.deliverOrderItem(first.order_item_id);
    log('After deliver', TASKS);

    console.log(`\nSimulate return for order_item_id=${first.order_item_id}`);
    await courierService.returnOrderItem(first.order_item_id);
    log('After return', TASKS);

    console.log('\nMock courier flow test completed successfully.');
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
})();
