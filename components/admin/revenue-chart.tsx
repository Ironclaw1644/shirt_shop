"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoneyCents } from "@/lib/utils/money";

type Order = { id: string; total_cents: number; created_at: string };

export function AdminRevenueChart({ orders }: { orders: Order[] }) {
  // bucket last 30 days by day
  const now = new Date();
  const buckets: { day: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    buckets.push({ day: key, revenue: 0 });
  }
  for (const o of orders) {
    const key = o.created_at.slice(0, 10);
    const b = buckets.find((x) => x.day === key);
    if (b) b.revenue += o.total_cents;
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-press">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold">30-day revenue</h2>
        <span className="font-mono text-xs text-ink-mute">daily (USD)</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={buckets}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8142B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#B8142B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE9E1" />
            <XAxis
              dataKey="day"
              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              interval={4}
              stroke="#6B6A65"
              fontSize={11}
            />
            <YAxis
              tickFormatter={(v) => formatMoneyCents(v, { whole: true })}
              stroke="#6B6A65"
              fontSize={11}
            />
            <Tooltip
              formatter={(v: number) => formatMoneyCents(v)}
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
              contentStyle={{ borderRadius: 6, borderColor: "#E8E6E1" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#B8142B"
              strokeWidth={2}
              fill="url(#rev)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
