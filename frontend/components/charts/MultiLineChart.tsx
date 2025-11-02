'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface MultiLineChartProps {
  data: Array<{ [key: string]: string | number }>;
  lines: LineConfig[];
  xAxisKey?: string;
}

const formatNumber = (value: number): string => {
  return value.toLocaleString('en-IN');
};

export function MultiLineChart({ data, lines, xAxisKey = 'month' }: MultiLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
        <XAxis dataKey={xAxisKey} stroke="#9DA5A8" />
        <YAxis 
          stroke="#9DA5A8" 
          tickFormatter={formatNumber}
        />
        <Tooltip
          formatter={(value: any) => formatNumber(Number(value))}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #DFE2E4',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

