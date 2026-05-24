"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fmtAvg } from "@/lib/scoring/format";

interface DataPoint {
  year: number;
  title: string;
  avg: number;
}

interface Props {
  data: DataPoint[];
}

export function AlbumTimeline({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="year"
          tick={{ fill: "#555", fontSize: 11 }}
          axisLine={{ stroke: "#1f1f1f" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => fmtAvg(v)}
          tick={{ fill: "#555", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#161616",
            border: "1px solid #1f1f1f",
            borderRadius: 6,
            fontFamily: "DM Sans",
            fontSize: 12,
          }}
          labelStyle={{ color: "#e0e0e0" }}
          formatter={(v: number) => [fmtAvg(v), "avg"]}
        />
        <ReferenceLine y={0.8} stroke="#FFD700" strokeDasharray="4 2" strokeOpacity={0.3} />
        <ReferenceLine y={0.65} stroke="#00E5B0" strokeDasharray="4 2" strokeOpacity={0.3} />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#00E5B0"
          strokeWidth={2}
          dot={{ fill: "#00E5B0", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#00E5B0" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
