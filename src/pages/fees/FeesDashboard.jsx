import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { api } from '../../services/api';

const FeesDashboard = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const students = await api.students.getAll();
      const fees = await api.fees.getAll();
      
      const combined = students.map(student => {
        const feeRecord = fees.find(f => f.student_id === student.id) || { total_amount: 0, paid_amount: 0, status: 'pending' };
        return { ...student, feeRecord };
      });
      
      setData(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(student => 
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fees Management</h2>
          <p className="text-muted-foreground mt-1">Monitor fee statuses and pending dues.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fee Status by Student</CardTitle>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground animate-pulse">Loading...</TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((student) => {
                    const pending = student.feeRecord.total_amount - student.feeRecord.paid_amount;
                    let statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
                    let statusText = "Pending";
                    
                    if (student.feeRecord.total_amount === 0) {
                      statusColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
                      statusText = "Not Set";
                    } else if (pending <= 0) {
                      statusColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500";
                      statusText = "Fully Paid";
                    } else if (student.feeRecord.paid_amount > 0) {
                      statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
                      statusText = "Partial";
                    }

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-primary">{student.roll_number}</TableCell>
                        <TableCell className="font-semibold">{student.full_name}</TableCell>
                        <TableCell>{formatCurrency(student.feeRecord.total_amount)}</TableCell>
                        <TableCell className="text-emerald-600 dark:text-emerald-400">{formatCurrency(student.feeRecord.paid_amount)}</TableCell>
                        <TableCell className={pending > 0 ? "text-destructive font-medium" : ""}>{formatCurrency(pending)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                            {statusText}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/fees/record/${student.id}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <CreditCard className="h-4 w-4" />
                              Manage
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesDashboard;
