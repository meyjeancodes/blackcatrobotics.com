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

const STATUS_STEPS = [
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    const found = MOCK_ORDERS.find((o) => o.id.toLowerCase() === orderId.toLowerCase().trim());
    if (found) {
      setSearchedOrder(found);
      setError("");
    } else {
      setSearchedOrder(null);
      setError("Order not found. Check the order ID and try again.");
    }
  };

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const getStepIndex = (status: string) => STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <a href="/store" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80 transition">
          ← Back to Store
        </a>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          Track Order
        </h1>
        <p className="mt-2 text-sm text-theme-50">
          Enter your order ID to see real-time status and tracking info.
        </p>
      </header>

      {/* Search */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Order ID (e.g., ORD-2026-0847)"
          className="flex-1 rounded-xl border border-theme-10 bg-white px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-30 focus:border-theme-20 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="rounded-xl bg-ember px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-white transition hover:bg-ember/90"
        >
          Track
        </button>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-500">{error}</p>
      )}

      {/* Demo hint */}
      {!searchedOrder && !error && (
        <div className="mb-8 rounded-xl bg-theme-5 p-4">
          <p className="text-xs text-theme-400">
            <strong>Demo:</strong> Try these order IDs: <button onClick={() => setOrderId("ORD-2026-0847")} className="underline hover:text-theme-300">ORD-2026-0847</button> (delivered), <button onClick={() => setOrderId("ORD-2026-0851")} className="underline hover:text-theme-300">ORD-2026-0851</button> (shipped), <button onClick={() => setOrderId("ORD-2026-0855")} className="underline hover:text-theme-300">ORD-2026-0855</button> (processing)
          </p>
        </div>
      )}

      {/* Order Details */}
      {searchedOrder && (
        <div className="rounded-2xl border border-theme-10 bg-white p-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-theme-10 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-theme-primary">{searchedOrder.id}</h2>
              <p className="text-xs text-theme-400">Placed {searchedOrder.date}</p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              searchedOrder.status === "delivered" ? "bg-[#1db87a]/10 text-[#1db87a]" :
              searchedOrder.status === "shipped" ? "bg-amber-100 text-amber-700" :
              "bg-theme-5 text-theme-50"
            }`}>
              {searchedOrder.status === "delivered" && "✓ Delivered"}
              {searchedOrder.status === "shipped" && "In Transit"}
              {searchedOrder.status === "processing" && "Processing"}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, i) => {
                const currentStep = getStepIndex(searchedOrder.status);
                const isComplete = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        isComplete ? "bg-[#1db87a] text-white" : "bg-theme-10 text-theme-40"
                      } ${isCurrent ? "ring-2 ring-[#1db87a]/30" : ""}`}>
                        {isComplete && i < currentStep ? "✓" : i + 1}
                      </div>
                      <span className={`mt-1 text-[0.6rem] ${isComplete ? "text-[#1db87a] font-semibold" : "text-theme-40"}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 ${i < currentStep ? "bg-[#1db87a]" : "bg-theme-10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {searchedOrder.items.map((item) => (
              <div key={item.sku} className="flex items-center justify-between rounded-xl bg-theme-5 p-3">
                <div>
                  <p className="text-sm font-medium text-theme-primary">{item.name}</p>
                  <p className="text-xs text-theme-400">{item.sku} × {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-theme-primary">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-theme-10 pt-4">
            <span className="text-sm text-theme-50">Total</span>
            <span className="text-lg font-semibold text-theme-primary">{formatPrice(searchedOrder.total)}</span>
          </div>

          {/* Tracking Info */}
          <div className="mt-6 rounded-xl bg-theme-5 p-4">
            <h3 className="text-sm font-semibold text-theme-primary">Shipping Details</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-40">Carrier</span>
                <span className="text-theme-primary">{searchedOrder.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-40">Tracking</span>
                <a href="#" className="text-[#cc3d17] hover:underline">{searchedOrder.tracking}</a>
              </div>
              {searchedOrder.deliveredDate && (
                <div className="flex justify-between">
                  <span className="text-theme-40">Delivered</span>
                  <span className="text-theme-primary">{searchedOrder.deliveredDate}</span>
                </div>
              )}
              {searchedOrder.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-theme-40">Estimated Delivery</span>
                  <span className="text-theme-primary">{searchedOrder.estimatedDelivery}</span>
                </div>
              )}
              {searchedOrder.estimatedShip && (
                <div className="flex justify-between">
                  <span className="text-theme-40">Estimated Ship</span>
                  <span className="text-theme-primary">{searchedOrder.estimatedShip}</span>
                </div>
              )}
            </div>
          </div>

          {/* TechMedix */}
          <div className="mt-4 rounded-xl bg-[#1db87a]/5 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#1db87a]" />
              <span className="text-sm font-semibold text-[#1db87a]">TechMedix Monitoring Active</span>
            </div>
            <p className="mt-1 text-xs text-theme-50">
              Predictive failure alerts and wear tracking enabled for all parts in this order.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
