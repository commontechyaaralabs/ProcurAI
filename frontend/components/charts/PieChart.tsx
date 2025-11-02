'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  hideLabels?: boolean;
  hideLegend?: boolean;
}

const DEFAULT_COLORS = ['#005691', '#0066a3', '#0078b5', '#008ac7', '#009cd9'];

export function PieChart({ data, colors = DEFAULT_COLORS, hideLabels = false, hideLegend = false }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={!hideLabels}
          label={hideLabels ? false : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={hideLabels ? 110 : 100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value}`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #DFE2E4',
            borderRadius: '8px',
          }}
        />
        {!hideLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

