/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Appointment } from '../types';

export interface BillingSummary {
  basePrice: number;
  cgst: number;
  sgst: number;
  total: number;
  depositAmount: number;
}

export function calculateBilling(basePrice: number): BillingSummary {
  const cgst = 0; // No CGST
  const sgst = 0; // No SGST
  const total = basePrice;
  const depositAmount = Math.round(total * 0.20); // 20% deposit to secure seat
  return {
    basePrice,
    cgst,
    sgst,
    total,
    depositAmount,
  };
}

export interface PaymentInfo {
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  paymentMethod: 'upi' | 'card' | 'counter' | '';
  paymentAmount: number;
  paymentTxnId: string;
  cleanNotes: string;
}

/**
 * Extracts payment metadata from the notes field if it's formatted as a payment receipt.
 */
export function parsePaymentFromNotes(notes: string | undefined | null): PaymentInfo {
  const str = notes || '';
  
  // Match verified paid receipt
  const matchPaid = str.match(/\[PAID ₹([\d,]+) via (UPI|CARD) - Txn: ([\w\-]+)\]/);
  if (matchPaid) {
    const amountStr = matchPaid[1].replace(/,/g, '');
    const amount = parseInt(amountStr) || 0;
    const method = matchPaid[2].toLowerCase() as 'upi' | 'card';
    const txnId = matchPaid[3];
    const cleanNotes = str.replace(/\[PAID ₹[\d,]+ via (?:UPI|CARD) - Txn: [\w\-]+\]\s*/, '').trim();
    return {
      paymentStatus: 'paid',
      paymentMethod: method,
      paymentAmount: amount,
      paymentTxnId: txnId,
      cleanNotes,
    };
  }

  // Match pending verification receipt
  const matchPending = str.match(/\[PENDING_VERIFICATION ₹([\d,]+) via (UPI|CARD) - Txn: ([\w\-]+)\]/);
  if (matchPending) {
    const amountStr = matchPending[1].replace(/,/g, '');
    const amount = parseInt(amountStr) || 0;
    const method = matchPending[2].toLowerCase() as 'upi' | 'card';
    const txnId = matchPending[3];
    const cleanNotes = str.replace(/\[PENDING_VERIFICATION ₹[\d,]+ via (?:UPI|CARD) - Txn: [\w\-]+\]\s*/, '').trim();
    return {
      paymentStatus: 'pending',
      paymentMethod: method,
      paymentAmount: amount,
      paymentTxnId: txnId,
      cleanNotes,
    };
  }

  return {
    paymentStatus: 'unpaid',
    paymentMethod: 'counter',
    paymentAmount: 0,
    paymentTxnId: '',
    cleanNotes: str,
  };
}

/**
 * Encodes payment metadata directly into the notes field so it stores cleanly in any database column.
 */
export function injectPaymentIntoNotes(notes: string, amount: number, method: 'UPI' | 'CARD', txnId: string): string {
  const cleanNotes = notes || '';
  const marker = `[PAID ₹${amount.toLocaleString('en-IN')} via ${method} - Txn: ${txnId}]`;
  return `${marker}\n${cleanNotes}`.trim();
}

/**
 * Encodes pending verification payment metadata into the notes field.
 */
export function injectPendingPaymentIntoNotes(notes: string, amount: number, method: 'UPI' | 'CARD', txnId: string): string {
  const cleanNotes = notes || '';
  const marker = `[PENDING_VERIFICATION ₹${amount.toLocaleString('en-IN')} via ${method} - Txn: ${txnId}]`;
  return `${marker}\n${cleanNotes}`.trim();
}

/**
 * Promotes a pending payment to paid status inside the notes field.
 */
export function verifyPaymentInNotes(notes: string | undefined | null): string {
  const str = notes || '';
  return str.replace(/\[PENDING_VERIFICATION/g, '[PAID');
}
