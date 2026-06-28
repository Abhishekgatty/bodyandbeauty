import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Calendar, CheckCircle, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react';
import { PaymentTransaction, Appointment } from '../../types';
import { fetchPaymentTransactions, updatePaymentTransactionStatus, saveAppointment, fetchAppointments } from '../../supabaseClient';
import { verifyPaymentInNotes, parsePaymentFromNotes } from '../../utils/paymentUtils';

interface PaymentsTabProps {
  onRefreshData: () => Promise<void>;
  appointments: Appointment[];
  setAppointments: (apts: Appointment[]) => void;
}

export default function PaymentsTab({ onRefreshData, appointments, setAppointments }: PaymentsTabProps) {
  const [payments, setPaymentsList] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'failed'>('all');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentTransactions();
      setPaymentsList(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [appointments]); // Refresh when appointments change

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(text);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleVerifyPayment = async (payment: PaymentTransaction) => {
    try {
      // 1. Update Payment Transaction Status in DB
      await updatePaymentTransactionStatus(payment.id, 'verified', new Date().toISOString());

      // 2. Find and update the associated Appointment
      const targetApt = appointments.find(a => a.id === payment.appointmentId);
      if (targetApt) {
        const verifiedNotes = verifyPaymentInNotes(targetApt.notes);
        const updatedApt: Appointment = {
          ...targetApt,
          notes: verifiedNotes,
          // Promote pending appointment status to approved
          status: targetApt.status === 'pending' ? 'approved' : targetApt.status
        };
        await saveAppointment(updatedApt);
        
        // Update local state instantly for premium responsiveness
        const updatedAptsList = appointments.map(a => a.id === targetApt.id ? updatedApt : a);
        setAppointments(updatedAptsList);
      }

      setVerifyingId(null);
      await loadPayments();
      await onRefreshData();
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  // Filters payments based on search query & status filter
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerPhone.includes(searchQuery) ||
      p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.serviceName && p.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left" id="admin-payments-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h3 className="font-serif-luxury text-xl text-[#0F5232] font-bold tracking-wide uppercase">Payment Transaction Ledger</h3>
          <p className="text-xs text-gray-500 mt-0.5">Track direct UPI QR and secure card gateway settlements securely</p>
        </div>
        <button
          onClick={loadPayments}
          disabled={loading}
          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#0F5232]' : ''}`} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
        <div className="md:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, service, transaction UTR ID..."
            className="w-full bg-white border border-gray-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#0F5232] text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="md:col-span-6 flex gap-1">
          {(['all', 'pending', 'verified', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                statusFilter === status
                  ? 'bg-[#0F5232] text-white border-[#0F5232]'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' && 'All Transactions'}
              {status === 'pending' && '⌛ Pending'}
              {status === 'verified' && '✅ Verified'}
              {status === 'failed' && '❌ Failed'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List Table */}
      {loading && payments.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500 font-mono flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-[#0F5232]" />
          <span>Synchronizing payment entries...</span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-200 bg-white rounded">
          <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">No payment transactions found matching filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-600 tracking-wider font-mono">
                <th className="p-4">Txn ID / Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Service Name</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Gateway Reference</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPayments.map((p) => {
                const formattedDate = new Date(p.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
                const formattedTime = new Date(p.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: true
                });

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Txn ID / Date */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-gray-900 select-all">{p.id}</div>
                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3 inline text-gray-400" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{p.customerName}</div>
                      <div className="text-[10px] text-gray-500 font-mono space-y-0.5 mt-0.5">
                        <p>{p.customerPhone}</p>
                        {p.customerEmail && <p>{p.customerEmail}</p>}
                      </div>
                    </td>

                    {/* Service Name */}
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-[10px] font-medium max-w-[150px] truncate">
                        {p.serviceName}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Gateway Reference */}
                    <td className="p-4 font-mono text-[10px]">
                      <div className="flex items-center gap-1 text-gray-700">
                        <span className="uppercase font-bold text-[9px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {p.paymentMethod}
                        </span>
                        <span className="font-bold select-all underline text-gray-900">{p.txnId}</span>
                        <button
                          onClick={() => handleCopy(p.txnId)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy Transaction UTR/Ref"
                        >
                          {copiedTxId === p.txnId ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {p.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded">
                          <CheckCircle className="h-2.5 w-2.5" />
                          <span>Verified</span>
                        </span>
                      ) : p.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>Pending Verification</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2 py-0.5 border border-red-200 rounded">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      {p.status === 'pending' ? (
                        verifyingId === p.id ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-amber-600 font-bold">Sure?</span>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleVerifyPayment(p)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setVerifyingId(null)}
                                className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setVerifyingId(p.id)}
                            className="px-2.5 py-1 bg-[#DDB93B] hover:bg-black hover:text-white text-black font-bold uppercase text-[9px] tracking-wider rounded cursor-pointer border border-[#DDB93B] transition-all"
                          >
                            Verify Clearance
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono font-medium">No action needed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
