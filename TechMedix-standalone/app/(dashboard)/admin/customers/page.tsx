import { SurfaceCard } from "../../../../components/surface-card";
import { formatCurrency, formatDateTime } from "../../../../lib/format";
import { getAdminCustomers } from "../../../../lib/data";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <SurfaceCard title="Customer accounts" eyebrow="BlackCat admin">
      <div className="overflow-hidden rounded-[24px] border border-theme-5">
        <table className="min-w-full divide-y divide-black/5 text-left text-sm">
          <thead className="bg-theme-3 text-[11px] uppercase tracking-[0.2em] text-theme-45">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Spend</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-theme-2">
                <td className="px-4 py-4 font-semibold text-theme-primary">{customer.company}</td>
                <td className="px-4 py-4 text-theme-60">{customer.name}</td>
                <td className="px-4 py-4 capitalize text-theme-60">{customer.plan}</td>
                <td className="px-4 py-4 text-theme-60">{formatCurrency(customer.monthlySpend)}</td>
                <td className="px-4 py-4 text-theme-60">{formatDateTime(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
