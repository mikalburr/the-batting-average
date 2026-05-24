"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  quality: number;
  cultural: number;
  commercial: number;
}

export function ScoreRadar({ quality, cultural, commercial }: Props) {
  const data = [
    { subject: "Quality", value: quality, fullMark: 100 },
    { subject: "Cultural", value: cultural, fullMark: 100 },
    { subject: "Commercial", value: commercial, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#1f1f1f" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#555", fontSize: 11, fontFamily: "DM Sans" }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#00E5B0"
          fill="#00E5B0"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
