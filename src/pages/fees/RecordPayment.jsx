import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CreditCard, Receipt } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const numberToWords = (num) => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
    return str.trim();
};

const RecordPayment = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [feeRecord, setFeeRecord] = useState(null);
  const [payments, setPayments] = useState([]);
  
  const [totalFeeForm, setTotalFeeForm] = useState({ amount: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '' });
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const studentData = await api.students.getById(studentId);
      if (!studentData) {
        navigate('/fees');
        return;
      }
      setStudent(studentData);
      
      const record = await api.fees.getByStudentId(studentId);
      setFeeRecord(record);
      if (record) {
        setTotalFeeForm({ amount: record.total_amount ? record.total_amount.toString() : '' });
      }
      
      const history = await api.payments.getByStudentId(studentId);
      setPayments(history);
    } catch (error) {
      console.error(error);
    }
  }, [studentId, navigate]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadData();
  }, [loadData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSetTotalFee = async (e) => {
    e.preventDefault();
    if (!totalFeeForm.amount) return;
    try {
      setSaving(true);
      const updated = await api.fees.update(feeRecord.id, {
        total_amount: parseFloat(totalFeeForm.amount)
      });
      setFeeRecord(updated);
      setShowFeeModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) return;
    
    const pending = feeRecord.total_amount - feeRecord.paid_amount;
    if (amount > pending) {
      alert("Amount cannot exceed the pending balance");
      return;
    }
    
    try {
      setSaving(true);
      const newPayment = await api.payments.create({
        student_id: studentId,
        fee_id: feeRecord.id,
        amount_paid: amount,
        payment_mode: 'Online',
      });
      
      setPaymentForm({ amount: '' });
      setShowPaymentModal(false);
      loadData(); 
      generateReceipt(newPayment);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    
    // Set up basic fonts
    doc.setFont('helvetica');
    
    // Draw outer border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 180, 200); // Main outer border
    doc.rect(17, 17, 176, 196); // Inner double border
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("St. Mary's", 105, 35, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text("Arts, Commerce & Science S.R. College", 105, 45, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Khadi Machine, Fakirshah Baba Hill Road,", 105, 52, { align: 'center' });
    doc.text("Kausa, Mumbra, Dist. - Thane - 400 612.", 105, 58, { align: 'center' });
    
    doc.line(17, 65, 193, 65);
    
    // Receipt No & Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(payment.receipt_number || '', 20, 75);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No.:`, 20, 82);
    
    doc.text(`Date : ${new Date(payment.created_at).toLocaleDateString()}`, 130, 82);
    
    doc.line(17, 85, 193, 85);
    
    // Name & Std / Roll No
    doc.text(`Name:`, 20, 95);
    doc.setFont('helvetica', 'italic');
    doc.text(student.full_name || '', 35, 95);
    doc.setFont('helvetica', 'normal');
    doc.line(33, 97, 125, 97); // underline name
    
    doc.line(128, 85, 128, 105); // vertical line for Std box
    
    doc.text(`Std. :`, 130, 93);
    doc.text(student.semester || student.course || '', 142, 93);
    doc.line(140, 95, 190, 95);
    
    doc.text(`Roll No. :`, 130, 102);
    doc.text(student.roll_number || '', 150, 102);
    doc.line(148, 104, 190, 104);
    
    doc.line(17, 105, 193, 105);
    
    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('PARTICULARS', 60, 112);
    doc.text('Rs.', 145, 112);
    doc.text('P.', 175, 112);
    
    doc.line(17, 115, 193, 115);
    
    // Table content lines
    doc.line(135, 105, 135, 160); // Vertical line before Rs.
    doc.line(165, 105, 165, 160); // Vertical line before P.
    
    doc.setFont('helvetica', 'normal');
    const startY = 125;
    const lineGap = 15;
    
    // Rows
    doc.text('Amount Paid', 20, startY);
    doc.text(parseFloat(payment.amount_paid).toString(), 140, startY); 
    doc.text('-', 178, startY);
    doc.line(17, startY+5, 193, startY+5);
    
    const pendingBalance = feeRecord.total_amount - feeRecord.paid_amount;
    doc.text('Pending Amount', 20, startY + lineGap);
    doc.text(pendingBalance.toString(), 140, startY + lineGap);
    doc.text('-', 178, startY + lineGap);
    doc.line(17, startY+lineGap+5, 193, startY+lineGap+5);
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 100, 155);
    doc.text(parseFloat(payment.amount_paid).toString(), 140, 155);
    doc.text('-', 178, 155);
    
    doc.line(17, 160, 193, 160);
    
    // Amount in words
    const amountInWords = numberToWords(parseFloat(payment.amount_paid));
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. `, 20, 175);
    doc.setFont('helvetica', 'italic');
    doc.text(`${amountInWords}`, 30, 175);
    doc.line(28, 177, 130, 177); // underline words
    
    // Received by
    doc.setFont('helvetica', 'normal');
    doc.text(`Received by`, 150, 195);
    
    // Save robustly using Blob and anchor tag to force .pdf extension
    try {
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fee_Receipt_${payment.receipt_number || 'Official'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("PDF download failed using blob, falling back to doc.save", err);
      doc.save(`Fee_Receipt_${payment.receipt_number || 'Official'}.pdf`);
    }
  };

  if (!student || !feeRecord) return <div className="p-8 animate-pulse text-muted-foreground text-center">Loading payment portal...</div>;

  const pendingAmount = feeRecord.total_amount - feeRecord.paid_amount;
  const isFullyPaid = feeRecord.total_amount > 0 && pendingAmount <= 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto pb-10 px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Link to="/fees">
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Fees Management</h2>
          <p className="text-sm text-slate-500 font-medium">
            Student: <span className="text-slate-900">{student.full_name}</span> | Roll: {student.roll_number}
          </p>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fee</p>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(feeRecord.total_amount)}
              </div>
              <button 
                onClick={() => setShowFeeModal(true)}
                className="text-[10px] text-primary font-bold uppercase hover:underline mt-2 flex items-center gap-1"
              >
                <FileText className="h-3 w-3" /> Update
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid Amount</p>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {formatCurrency(feeRecord.paid_amount)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</p>
            <div className="text-xl font-bold text-rose-600 mt-1">
              {formatCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action & History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Receipt className="h-4 w-4 text-slate-400" />
            Transaction History
          </h3>
          <Button 
            onClick={() => setShowPaymentModal(true)}
            disabled={isFullyPaid || feeRecord.total_amount === 0}
            className="h-10 px-6 font-bold shadow-sm"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Receipt No</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.slice().reverse().map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {payment.receipt_number}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          {formatCurrency(payment.amount_paid)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5"
                            onClick={() => generateReceipt(payment)}
                          >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm font-medium text-slate-400">No transactions recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODALS SECTION */}
      
      {/* 1. Update Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
          <Card className="w-full max-w-sm border-none shadow-2xl bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Update Total Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetTotalFee} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount (INR)</label>
                  <Input 
                    type="number" 
                    className="h-11 font-bold border-slate-200 focus:ring-primary"
                    value={totalFeeForm.amount}
                    onChange={(e) => setTotalFeeForm({ amount: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowFeeModal(false)} className="flex-1 h-11 font-bold text-slate-500">Cancel</Button>
                  <Button type="submit" className="flex-1 h-11 font-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Update'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
          <Card className="w-full max-w-sm border-none shadow-2xl bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Record Payment</CardTitle>
              <CardDescription className="text-xs font-medium">Add a new fee installment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordPayment} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                    <span className="text-[10px] font-bold text-slate-400">Max: {formatCurrency(pendingAmount)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                    <Input 
                      type="number" 
                      className="h-12 pl-8 text-xl font-bold border-slate-200 focus:ring-primary"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ amount: e.target.value })}
                      max={pendingAmount}
                      min="1"
                      required
                      autoFocus
                    />
                  </div>
                  <button 
                    type="button" 
                    className="text-[10px] text-primary font-bold uppercase hover:underline"
                    onClick={() => setPaymentForm({ amount: pendingAmount.toString() })}
                  >
                    Set Full Balance
                  </button>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowPaymentModal(false)} className="flex-1 h-12 font-bold text-slate-500">Back</Button>
                  <Button type="submit" className="flex-1 h-12 font-bold shadow-lg shadow-primary/20" disabled={saving}>
                    {saving ? 'Recording...' : 'Record & Print'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RecordPayment;
