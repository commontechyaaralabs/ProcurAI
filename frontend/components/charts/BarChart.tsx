'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  nameKey: string;
  name: string;
  color?: string;
}

export function BarChart({ data, dataKey, nameKey, name, color = '#005691' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DFE2E4" />
        <XAxis dataKey={nameKey} stroke="#9DA5A8" />
        <YAxis stroke="#9DA5A8" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #DFE2E4',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}



