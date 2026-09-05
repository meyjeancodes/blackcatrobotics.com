"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

interface Order {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered";
  items: { sku: string; name: string; qty: number; price: number }[];
  total: number;
  tracking?: string;
  carrier?: string;
  deliveredDate?: string;
  estimatedDelivery?: string;
  estimatedShip?: string;
}

// Demo orders for users without real orders yet
const DEMO_ORDERS: Order[] = [
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
    items: [{ sku: "H1-LEG-KIT", name: "H1 Full Leg Kit", qty: 1, price: 216000 }],
    total: 216000,
    tracking: "1Z999AA10123456791",
    carrier: "FedEx",
    estimatedDelivery: "2026-09-05",
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email || "" });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
  }, [router]);

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

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-theme-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <Link href="/store" className="text-sm text-[#cc3d17] hover:text-[#cc3d17]/80">
          ← Back to Store
        </Link>
        <h1 className="mt-2 font-header text-4xl tracking-[-0.04em] text-theme-primary">
          My Account
        </h1>
        <p className="mt-2 text-sm text-theme-50">
          {user?.email}
        </p>
      </header>

      {/* Account Info */}
      <div className="mb-8 rounded-2xl border border-theme-10 bg-white p-6">
        <h2 className="font-header text-lg text-theme-primary">Account Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-theme-40">Email</p>
            <p className="text-sm text-theme-primary">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-theme-40">Member Since</p>
            <p className="text-sm text-theme-primary">September 2026</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="font-header text-lg text-theme-primary">Order History</h2>
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
              className="cursor-pointer rounded-2xl border border-theme-10 bg-white p-5 transition hover:border-theme-20 hover:shadow-md"
            >
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

              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span key={item.sku} className="rounded-full bg-theme-5 px-2 py-0.5 text-[0.6rem] text-theme-50">
                    {item.name} × {item.qty}
                  </span>
                ))}
              </div>

              {selectedOrder === order.id && (
                <div className="mt-4 border-t border-theme-10 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <div>
                      <h4 className="text-xs font-semibold text-theme-40 uppercase tracking-wider">Shipping</h4>
                      <div className="mt-2 space-y-2 rounded-lg bg-theme-5 p-3">
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
                      </div>
                      <div className="mt-3 rounded-lg bg-[#1db87a]/5 p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#1db87a] animate-pulse" />
                          <span className="text-xs font-semibold text-[#1db87a]">TechMedix Monitoring Active</span>
                        </div>
                        <p className="mt-1 text-[0.65rem] text-theme-50">Predictive failure alerts enabled for all parts.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Link */}
      <div className="mt-8">
        <Link
          href="/account/settings"
          className="inline-flex rounded-xl border border-theme-20 px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-theme-700 transition hover:bg-theme-5"
        >
          Account Settings
        </Link>
      </div>
    </main>
  );
}
