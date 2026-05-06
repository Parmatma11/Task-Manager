'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_CHART_DATA = [
  { name: 'Week 1', todo: 5, in_progress: 3, completed: 7 },
  { name: 'Week 2', todo: 4, in_progress: 6, completed: 5 },
  { name: 'Week 3', todo: 7, in_progress: 4, completed: 8 },
  { name: 'Week 4', todo: 3, in_progress: 5, completed: 10 },
];

const PRIORITY_CHART_DATA = [
  { name: 'Low', value: 4, color: '#10b981' },
  { name: 'Medium', value: 7, color: '#f59e0b' },
  { name: 'High', value: 5, color: '#f97316' },
  { name: 'Urgent', value: 3, color: '#ef4444' },
];

const BAR_COLORS = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#10b981',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export function TaskBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tasks by Status (Weekly)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={STATUS_CHART_DATA} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="todo" name="To Do" fill={BAR_COLORS.todo} radius={[4, 4, 0, 0]} />
            <Bar dataKey="in_progress" name="In Progress" fill={BAR_COLORS.in_progress} radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill={BAR_COLORS.completed} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TaskPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tasks by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={PRIORITY_CHART_DATA}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {PRIORITY_CHART_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
