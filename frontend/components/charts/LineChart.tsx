'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  name: string;
  color?: string;
}

const formatNumber = (value: number): string => {
  return value.toLocaleString('en-IN');
};

export function LineChart({ data, dataKey, name, color = '#005691' }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
        <XAxis dataKey="month" stroke="#9DA5A8" />
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
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}



