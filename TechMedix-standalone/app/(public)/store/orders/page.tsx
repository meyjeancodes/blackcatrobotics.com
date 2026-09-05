"use client";

import { useState } from "react";

const MOCK_ORDERS = [
  {
    id: "ORD-2026-0847",
    date: "2026-08-28",
    status: "delivered",
    items: [
      { sku: "H1-KNEE-ACT", name: "Unitree H1 Knee Actuator", qty: 1, price: 118000 },
      { sku: "H1-BATTERY", name: "Unitree H1 Battery Pack (864Wh)", qty: 2, price: 158000 },
    ],
    total: 434000,
    tracking: "1Z999AA10123456784",
    carrier: "UPS",
    deliveredDate: "2026-09-02",
  },
  {
    id: "ORD-2026-0851",
    date: "2026-09-01",
    status: "shipped",
    items: [
      { sku: "H1-LEG-KIT", name: "H1 Full Leg Kit", qty: 1, price: 216000 },
    ],
    total: 216000,
    tracking: "1Z999AA10123456791",
    carrier: "FedEx",
    estimatedDelivery: "2026-09-05",
  },
  {
    id: "ORD-2026-0855",
    date: "2026-09-03",
    status: "processing",
    items: [
      { sku: "SPOT-LEG-ACT", name: "Spot Leg Actuator", qty: 4, price: 320000 },
      { sku: "SPOT-BATTERY", name: "Spot Battery Pack", qty: 2, price: 180000 },
    ],
    total: 1640000,
    estimatedShip: "2026-09-06",
  },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-[#1db87a]/10 text-[#1db87a]";
      case "shipped": return "bg-amber-100 text-amber-700";
      default: return "bg-theme-5 text-theme-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered": return "Delivered";
      case "shipped": return "In Transit";
      default: return "Processing";
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <a href="/store" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80 transition">
          ← Back to Store
        </a>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          My Orders
        </h1>
        <p className="mt-2 text-sm text-theme-50">
          View and track all your parts orders. Need help? <a href="mailto:parts@blackcatrobotics.com" className="text-[#cc3d17] hover:underline">Contact support</a>.
        </p>
      </header>

      {/* Demo Notice */}
      <div className="mb-6 rounded-xl bg-theme-5 p-4">
        <p className="text-xs text-theme-400">
          <strong>Demo Mode:</strong> Showing sample orders. Connect Supabase auth to enable real order history.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            className="cursor-pointer rounded-2xl border border-theme-10 bg-white p-5 transition hover:border-theme-20 hover:shadow-md"
          >
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-theme-primary">{order.id}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-theme-400">Placed {order.date}</p>
              </div>
              <span className="text-base font-semibold text-theme-primary">{formatPrice(order.total)}</span>
            </div>

            {/* Items Preview */}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.items.map((item) => (
                <span key={item.sku} className="rounded-full bg-theme-5 px-2 py-0.5 text-[0.6rem] text-theme-50">
                  {item.name} × {item.qty}
                </span>
              ))}
            </div>

            {/* Expanded Details */}
            {selectedOrder === order.id && (
              <div className="mt-4 border-t border-theme-10 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Items Detail */}
                  <div>
                    <h4 className="text-xs font-semibold text-theme-40 uppercase tracking-wider">Items</h4>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.sku} className="flex items-center justify-between rounded-lg bg-theme-5 p-2">
                          <div>
                            <p className="text-sm font-medium text-theme-primary">{item.name}</p>
                            <p className="text-xs text-theme-400">{item.sku} × {item.qty}</p>
                          </div>
                          <span className="text-sm font-semibold text-theme-primary">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h4 className="text-xs font-semibold text-theme-40 uppercase tracking-wider">Shipping</h4>
                    <div className="mt-2 space-y-2 rounded-lg bg-theme-5 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-theme-40">Status</span>
                        <span className="font-medium text-theme-primary">{getStatusLabel(order.status)}</span>
                      </div>
                      {order.carrier && (
                        <div className="flex justify-between text-sm">
                          <span className="text-theme-40">Carrier</span>
                          <span className="font-medium text-theme-primary">{order.carrier}</span>
                        </div>
                      )}
                      {order.tracking && (
                        <div className="flex justify-between text-sm">
                          <span className="text-theme-40">Tracking</span>
                          <a href="#" className="text-[#cc3d17] hover:underline">{order.tracking}</a>
                        </div>
                      )}
                      {order.deliveredDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-theme-40">Delivered</span>
                          <span className="font-medium text-theme-primary">{order.deliveredDate}</span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex justify-between text-sm">
                          <span className="text-theme-40">Est. Delivery</span>
                          <span className="font-medium text-theme-primary">{order.estimatedDelivery}</span>
                        </div>
                      )}
                      {order.estimatedShip && (
                        <div className="flex justify-between text-sm">
                          <span className="text-theme-40">Est. Ship</span>
                          <span className="font-medium text-theme-primary">{order.estimatedShip}</span>
                        </div>
                      )}
                    </div>

                    {/* TechMedix Status */}
                    <div className="mt-3 rounded-lg bg-[#1db87a]/5 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#1db87a] animate-pulse" />
                        <span className="text-xs font-semibold text-[#1db87a]">TechMedix Monitoring Active</span>
                      </div>
                      <p className="mt-1 text-[0.65rem] text-theme-50">
                        Predictive failure alerts enabled for all parts in this order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State (for real usage) */}
      {MOCK_ORDERS.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-theme-40">No orders yet.</p>
          <a href="/store" className="mt-2 inline-block text-sm text-[#cc3d17] hover:underline">
            Start shopping →
          </a>
        </div>
      )}
    </main>
  );
}
