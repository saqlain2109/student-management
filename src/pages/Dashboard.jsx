import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Landmark, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    totalCollected: 0,
    totalPending: 0
  });
  
  const mockChartData = [
    { name: 'Jan', total: 4000 },
    { name: 'Feb', total: 3000 },
    { name: 'Mar', total: 2000 },
    { name: 'Apr', total: 2780 },
    { name: 'May', total: 1890 },
    { name: 'Jun', total: 2390 },
    { name: 'Jul', total: 3490 },
  ];

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const students = await api.students.getAll();
      const fees = await api.fees.getAll();
      const payments = await api.payments.getAll();
      
      let total = 0;
      let collected = 0;
      fees.forEach(f => {
        total += f.total_amount;
        collected += f.paid_amount;
      });

      setStats({
        totalStudents: students.length,
        totalFees: total,
        totalCollected: collected,
        totalPending: total - collected
      });

      // Combine and sort activities
      const combined = [
        ...students.slice(0, 10).map(s => ({
          id: `reg-${s.id}`,
          type: 'Registration',
          name: s.full_name,
          detail: `Enrolled in ${s.class || 'N/A'}`,
          date: new Date(s.created_at),
          amount: '-'
        })),
        ...payments.slice(0, 10).map(p => ({
          id: `pay-${p.id}`,
          type: 'Payment',
          name: p.students?.full_name || 'Unknown',
          detail: `Receipt: ${p.receipt_number}`,
          date: new Date(p.created_at),
          amount: `₹${p.amount_paid}`
        }))
      ].sort((a, b) => b.date - a.date).slice(0, 8);

      setActivities(combined);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Student Name', 'Detail', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...activities.map(a => [
        a.date.toLocaleDateString(),
        a.type,
        `"${a.name}"`,
        `"${a.detail}"`,
        a.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Activity_Report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Initialising Dashboard...</p></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic">Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Overview of your institution's key metrics.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Download className="h-5 w-5" />
          EXPORT LOGS
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl shadow-slate-100 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-blue-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</div>
            <p className="text-xs font-bold text-blue-500 mt-1">+12% growth</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-slate-100 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-indigo-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Course Fees</CardTitle>
            <Landmark className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalFees)}</div>
            <p className="text-xs font-bold text-slate-400 mt-1">Target for {new Date().getFullYear()}</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-emerald-100 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-emerald-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fees Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-xs font-bold text-emerald-500/60 mt-1">Real-time collection</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl shadow-rose-100 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-rose-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Pending Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">{formatCurrency(stats.totalPending)}</div>
            <p className="text-xs font-bold text-rose-500/60 mt-1">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Chart Card */}
        <Card className="col-span-1 lg:col-span-4 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Fee Collection Overview
            </CardTitle>
            <CardDescription className="font-medium">Monthly collection statistics for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ backgroundColor: 'white', borderColor: '#f1f5f9', borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Table Card */}
        <Card className="col-span-1 lg:col-span-3 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-lg font-black uppercase italic tracking-tight">Recent Activity</CardTitle>
            <CardDescription className="font-medium text-xs">Latest log of actions and payments.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit mb-1 ${
                              activity.type === 'Payment' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {activity.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{activity.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">{activity.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{activity.detail}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-xs font-black ${activity.type === 'Payment' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {activity.amount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">No Recent Activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
