'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../config';
import { CreditCard, ShoppingBag, Truck, Check, Percent, CheckCircle2, ArrowRight, ShieldCheck, Mail, Copy, Smartphone, MapPin, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { BANGLADESH_DISTRICTS, DHAKA_AREAS, detectOutsideDhakaMatch } from '../../utils/bangladeshLocations';
import Link from 'next/link';

export default function CheckoutPage() {
  const { token, user, setAuthSession } = useAuth();
  const { cart, clearCart, fetchCart } = useCart();
  const router = useRouter();

  // Shipping Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('dhaka'); // Default to Dhaka
  const [dhakaArea, setDhakaArea] = useState('mirpur'); // Default to Dhaka City
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'ONLINE'>('COD');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Store payment numbers
  const [bkashNumber, setBkashNumber] = useState('01603742963');
  const [nagadNumber, setNagadNumber] = useState('01603742963');
  const [whatsappNumber, setWhatsappNumber] = useState('8801603742963');

  // Dynamic Shipping Rates States
  const [insideRate, setInsideRate] = useState(80);
  const [outsideRate, setOutsideRate] = useState(150);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState(2500);

  // Advance Courier Configuration States
  const [advanceCourierEnabled, setAdvanceCourierEnabled] = useState(true);
  const [advanceCourierScope, setAdvanceCourierScope] = useState('OUTSIDE_DHAKA_ONLY');
  const [advanceCourierAmountType, setAdvanceCourierAmountType] = useState('EXACT_SHIPPING');
  const [advanceCourierFixedAmount, setAdvanceCourierFixedAmount] = useState(150);
  const [advanceCourierNote, setAdvanceCourierNote] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState<'BKASH' | 'NAGAD'>('BKASH');
  const [onlinePayMode, setOnlinePayMode] = useState<'ADVANCE' | 'FULL'>('ADVANCE');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order Success Screen State
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    totalAmount: number;
    advanceAmount?: number;
    dueAmount?: number;
    autoAccountCreated: boolean;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    trxId?: string;
  } | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load shipping rates and store settings from backend on mount
  useEffect(() => {
    async function fetchStoreConfig() {
      try {
        const [ratesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/shipping/rates`),
          fetch(`${API_URL}/settings`)
        ]);
        const ratesData = await ratesRes.json();
        const settingsData = await settingsRes.json();
        if (ratesData.success) {
          setInsideRate(ratesData.data.insideDhaka);
          setOutsideRate(ratesData.data.outsideDhaka);
          if (ratesData.data.freeShippingMinAmount) {
            setFreeShippingMinAmount(ratesData.data.freeShippingMinAmount);
          }
        }
        if (settingsData.success && settingsData.data) {
          if (settingsData.data.bkashNumber) setBkashNumber(settingsData.data.bkashNumber);
          if (settingsData.data.nagadNumber) setNagadNumber(settingsData.data.nagadNumber);
          if (settingsData.data.whatsappNumber) setWhatsappNumber(settingsData.data.whatsappNumber.replace(/[^0-9]/g, ''));
          if (settingsData.data.freeShippingMinAmount) setFreeShippingMinAmount(settingsData.data.freeShippingMinAmount);
          if (settingsData.data.advanceCourierEnabled !== undefined) setAdvanceCourierEnabled(settingsData.data.advanceCourierEnabled);
          if (settingsData.data.advanceCourierScope) setAdvanceCourierScope(settingsData.data.advanceCourierScope);
          if (settingsData.data.advanceCourierAmountType) setAdvanceCourierAmountType(settingsData.data.advanceCourierAmountType);
          if (settingsData.data.advanceCourierFixedAmount !== undefined) setAdvanceCourierFixedAmount(settingsData.data.advanceCourierFixedAmount);
          if (settingsData.data.advanceCourierNote) setAdvanceCourierNote(settingsData.data.advanceCourierNote);
        }
      } catch (err) {
        console.error('Error fetching checkout configs:', err);
      }
    }
    fetchStoreConfig();
  }, []);

  const handleCopyNumber = (num: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(num);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    }
  };

  const items = cart?.items || [];

  const cartSubtotal = items.reduce((acc, item: any) => {
    const prod = (item.product || {}) as any;
    const price = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : (prod.price || 0);
    return acc + price * item.quantity;
  }, 0);

  // Derived Zone, Sub-urban, and Delivery Rates
  const currentAreaObj = district === 'dhaka' ? DHAKA_AREAS.find((a) => a.id === dhakaArea) : null;
  const isDhakaSubUrban = Boolean(currentAreaObj?.isSubUrban);
  const detectedOutsideKeyword = (district === 'dhaka' && !isDhakaSubUrban) ? detectOutsideDhakaMatch(address) : null;
  const isOutsideDelivery = district !== 'dhaka' || isDhakaSubUrban || Boolean(detectedOutsideKeyword);
  const computedShippingRate = isOutsideDelivery ? outsideRate : insideRate;

  const isFreeShipping = freeShippingMinAmount > 0 && cartSubtotal >= freeShippingMinAmount;
  const effectiveShippingCost = isFreeShipping ? 0 : computedShippingRate;
  const grandTotal = Math.max(0, cartSubtotal - discountApplied + effectiveShippingCost);

  // Advance Courier Calculation
  const isAdvanceRequired =
    advanceCourierEnabled &&
    (advanceCourierScope === 'ALL' || (advanceCourierScope === 'OUTSIDE_DHAKA_ONLY' && isOutsideDelivery)) &&
    effectiveShippingCost > 0;

  const advancePayableAmount = isAdvanceRequired
    ? (advanceCourierAmountType === 'FIXED_AMOUNT' && advanceCourierFixedAmount > 0
        ? advanceCourierFixedAmount
        : effectiveShippingCost)
    : 0;

  const dueOnDeliveryAmount = Math.max(0, grandTotal - advancePayableAmount);

  // If order was just placed, render celebratory success card
  if (orderSuccessData) {
    const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(
      `Hello ONWEAR! I just placed order #${orderSuccessData.orderId.substring(0, 8)} for ${formatPrice(orderSuccessData.totalAmount)}. Name: ${orderSuccessData.customerName || name}, Phone: ${orderSuccessData.customerPhone || phone}. Please confirm my order.`
    );
    const whatsappUrl = `https://wa.me/${cleanWaNumber}?text=${waText}`;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
          <div className="rounded-full bg-emerald-50 border border-emerald-100 p-5 text-emerald-600">
            <CheckCircle2 className="h-14 w-14" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase text-teal-650 tracking-widest font-mono">
              ORDER CONFIRMED
            </span>
            <h1 className="text-3xl font-black text-zinc-950 uppercase tracking-tight mt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">Order ID: #{orderSuccessData.orderId}</p>
          </div>

          {/* Advance Courier Payment Confirmation Notice */}
          {orderSuccessData.advanceAmount && orderSuccessData.advanceAmount > 0 && (
            <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-left flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>অগ্রিম কুরিয়ার ফি সাবমিট সফল হয়েছে</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                <span>গৃহীত অগ্রিম কুরিয়ার ফি:</span>
                <span className="font-mono font-bold text-emerald-700">{formatPrice(orderSuccessData.advanceAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-900 bg-white p-2.5 rounded-xl border border-emerald-200">
                <span>পণ্য ডেলিভারির সময় বাকি প্রদেয় (COD Due):</span>
                <span className="font-mono text-emerald-800 text-sm font-black">{formatPrice(orderSuccessData.dueAmount || 0)}</span>
              </div>
              {orderSuccessData.trxId && (
                <p className="text-[11px] text-emerald-900 font-medium pt-0.5">
                  TrxID: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">{orderSuccessData.trxId}</strong> (আমাদের টিম দ্রুত ভেরিফাই করে পার্সেল পাঠিয়ে দেবে)
                </p>
              )}
            </div>
          )}

          {/* Direct Mobile Banking (bKash/Nagad) confirmation notice */}
          {(!orderSuccessData.advanceAmount || orderSuccessData.advanceAmount === 0) && (orderSuccessData.paymentMethod === 'BKASH' || orderSuccessData.paymentMethod === 'NAGAD') && (
            <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <Smartphone className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Payment Submitted via {orderSuccessData.paymentMethod}</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                TrxID: <strong className="font-mono text-zinc-950 bg-white/80 px-2 py-0.5 rounded border border-amber-200">{orderSuccessData.trxId}</strong>
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                Our verification team will verify this transaction ID and update your order status shortly.
              </p>
            </div>
          )}

          {/* WhatsApp Direct Confirmation Banner */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#25D366] text-white rounded-xl shadow-xs shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-black text-zinc-950 block">Instant WhatsApp Order Confirmation</span>
                <span className="text-[11px] text-zinc-500 font-medium">Click to notify our team on WhatsApp for fastest delivery</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              Chat Now ➔
            </span>
          </a>

          {orderSuccessData.autoAccountCreated ? (
            <div className="w-full bg-gradient-to-br from-teal-50/80 via-white to-zinc-50 border border-teal-200/80 rounded-2xl p-6 text-left flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
                <span>Account Created & Logged In Automatically!</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                We've activated an account for <strong className="text-zinc-900">{orderSuccessData.customerEmail}</strong> so you can track this shipment and manage orders anytime.
              </p>
              <div className="rounded-xl bg-white border border-teal-100 p-3.5 flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal-600 shrink-0" />
                <span className="text-xs font-medium text-zinc-700">
                  You are now automatically signed in. You can track this order or set a password in your profile anytime.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 max-w-md">
              Your order has been linked to your account. You can track status and view receipts anytime in your dashboard.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-zinc-100">
            <Link
              href={`/orders/${orderSuccessData.orderId}`}
              className="flex-1 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>View Order Receipt</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="flex-1 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold py-3.5 text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="rounded-full bg-zinc-50 p-6 text-zinc-400">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-800">Your bag is empty</h2>
        <p className="text-zinc-400 text-xs">Add some products before checking out.</p>
        <button onClick={() => router.push('/products')} className="mt-2 rounded-full bg-zinc-950 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition-colors">
          Shop Catalog
        </button>
      </div>
    );
  }

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
  };

  const handleDhakaAreaChange = (newArea: string) => {
    setDhakaArea(newArea);
  };

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: couponCode,
          subtotal: cartSubtotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountApplied(data.data.discountApplied);
        setAppliedCoupon(data.data.code);
        setCouponSuccess(`Coupon "${data.data.code}" applied! Discount: ${formatPrice(data.data.discountApplied)}`);
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon. Try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setDiscountApplied(0);
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address to receive order updates and account details.');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your mobile phone number.');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Please provide your complete shipping address.');
      setLoading(false);
      return;
    }

    // Direct Mobile Banking (bKash/Nagad) Validation & Advance Courier Validation
    if (isAdvanceRequired && paymentMethod === 'COD') {
      if (!paymentPhone.trim() || paymentPhone.trim().length < 10) {
        setError(`কুরিয়ার চার্জ ${formatPrice(advancePayableAmount)} অগ্রিম প্রদানের জন্য আপনার ${advanceMethod === 'BKASH' ? 'বিকাশ' : 'নগদ'} প্রেরক মোবাইল নম্বর প্রদান করুন।`);
        setLoading(false);
        return;
      }
      if (!trxId.trim() || trxId.trim().length < 4) {
        setError(`কুরিয়ার চার্জ ${formatPrice(advancePayableAmount)} অগ্রিম পরিশোধের TrxID (Transaction ID) প্রদান করুন।`);
        setLoading(false);
        return;
      }
    } else if (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') {
      if (!paymentPhone.trim() || paymentPhone.trim().length < 10) {
        setError(`Please enter the ${paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} sender mobile number you used to make the payment.`);
        setLoading(false);
        return;
      }
      if (!trxId.trim() || trxId.trim().length < 4) {
        setError(`Please enter the ${paymentMethod === 'BKASH' ? 'bKash' : 'Nagad'} Transaction ID (TrxID).`);
        setLoading(false);
        return;
      }
    }

    const currentDistObj = BANGLADESH_DISTRICTS.find((d) => d.id === district);
    const districtDisplay = currentDistObj ? `${currentDistObj.nameEn} (${currentDistObj.nameBn})` : (city || 'Dhaka');
    const areaDisplay = district === 'dhaka' && currentAreaObj ? `, Area: ${currentAreaObj.nameEn}` : (city ? `, Area/Thana: ${city}` : '');
    const shippingAddress = `${address.trim()}, District: ${districtDisplay}${areaDisplay}${postalCode ? ` - Postcode: ${postalCode}` : ''} (${isOutsideDelivery ? 'Outside Dhaka' : 'Inside Dhaka'})`;

    // Map checkout items array
    const checkoutItemsPayload = items.map((item: any) => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null
    }));

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const finalMethodToSend = isAdvanceRequired && paymentMethod === 'COD' ? 'COD_WITH_ADVANCE' : paymentMethod;
      const finalAdvanceMethod = isAdvanceRequired ? (paymentMethod === 'COD' ? advanceMethod : paymentMethod) : (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' ? paymentMethod : undefined);

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shippingAddress,
          zone: isOutsideDelivery ? 'outside' : 'inside',
          items: checkoutItemsPayload,
          note: note || undefined,
          couponCode: appliedCoupon || undefined,
          paymentMethod: finalMethodToSend,
          paymentPhone: paymentPhone.trim() || undefined,
          trxId: trxId.trim().toUpperCase() || undefined,
          advanceAmount: isAdvanceRequired ? advancePayableAmount : undefined,
          advancePaymentMethod: finalAdvanceMethod,
          advanceTrxId: trxId.trim().toUpperCase() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        // Clear cart in context (both local guest and server cart)
        await clearCart();
        await fetchCart();

        // If guest checkout auto-generated a user & JWT token, automatically authenticate them
        if (data.data?.token && data.data?.user) {
          setAuthSession(data.data.user, data.data.token);
        }

        if (paymentMethod === 'ONLINE') {
          // Initiate online payment via SSLCommerz
          try {
            const payHeaders: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            const currentToken = data.data?.token || token;
            if (currentToken) payHeaders['Authorization'] = `Bearer ${currentToken}`;

            const payAdvanceOnly = isAdvanceRequired && onlinePayMode === 'ADVANCE';

            const payRes = await fetch(`${API_URL}/payments/sslcommerz/initiate/${data.data.id}`, {
              method: 'POST',
              headers: payHeaders,
              body: JSON.stringify({ payAdvanceOnly })
            });
            const payData = await payRes.json();
            if (payData.success && payData.data.gatewayUrl) {
              window.location.href = payData.data.gatewayUrl;
              return;
            } else {
              setOrderSuccessData({
                orderId: data.data.id,
                totalAmount: data.data.totalAmount,
                advanceAmount: data.data.advanceAmount,
                dueAmount: data.data.dueAmount,
                autoAccountCreated: data.data.autoAccountCreated,
                customerEmail: data.data.customerEmail || email,
                customerName: name.trim(),
                customerPhone: phone.trim(),
                paymentMethod: finalMethodToSend,
                trxId: trxId.trim().toUpperCase()
              });
            }
          } catch (payErr) {
            console.error('Failed to initiate online payment:', payErr);
            setOrderSuccessData({
              orderId: data.data.id,
              totalAmount: data.data.totalAmount,
              advanceAmount: data.data.advanceAmount,
              dueAmount: data.data.dueAmount,
              autoAccountCreated: data.data.autoAccountCreated,
              customerEmail: data.data.customerEmail || email,
              customerName: name.trim(),
              customerPhone: phone.trim(),
              paymentMethod: finalMethodToSend,
              trxId: trxId.trim().toUpperCase()
            });
          }
        } else {
          // COD or Direct bKash / Nagad Order Placed Success
          setOrderSuccessData({
            orderId: data.data.id,
            totalAmount: data.data.totalAmount,
            advanceAmount: data.data.advanceAmount,
            dueAmount: data.data.dueAmount,
            autoAccountCreated: data.data.autoAccountCreated,
            customerEmail: data.data.customerEmail || email,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            paymentMethod: finalMethodToSend,
            trxId: trxId.trim().toUpperCase()
          });
        }
      } else {
        setError(data.message || 'Failed to place the order. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while placing the order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-8 text-zinc-850">
      <div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-[0.06em] text-[#232323] uppercase">Checkout</h1>
        <p className="text-[11px] font-medium text-[#969696] tracking-[0.04em] uppercase mt-1">Provide shipping details and place your order</p>
      </div>

      {/* Guest Notice Banner */}
      {!user && (
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 text-xs font-medium text-teal-900 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
          <span>
            <strong>Guest Checkout:</strong> No prior registration needed. We will automatically create an account for you and email a link to set your password so you can track this order.
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-zinc-900 border-b border-zinc-100 pb-4 text-base uppercase tracking-wider">
            Shipping Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Email Address (for order tracking & account) *</label>
              <input
                type="email"
                required
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            {/* 1. District Selector (All 64 Districts of Bangladesh) */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-teal-600" />
                  <span>District / জেলা *</span>
                </label>
                <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  !isOutsideDelivery 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {!isOutsideDelivery ? `Inside Dhaka (${formatPrice(insideRate)})` : `Outside Dhaka (${formatPrice(outsideRate)})`}
                </span>
              </div>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-semibold cursor-pointer"
              >
                <optgroup label="Dhaka Division (ঢাকা বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Dhaka').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Chattogram Division (চট্টগ্রাম বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Chattogram').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Sylhet Division (সিলেট বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Sylhet').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Rajshahi Division (রাজশাহী বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Rajshahi').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Khulna Division (খুলনা বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Khulna').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Barishal Division (বরিশাল বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Barishal').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Rangpur Division (রংপুর বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Rangpur').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
                <optgroup label="Mymensingh Division (ময়মনসিংহ বিভাগ)">
                  {BANGLADESH_DISTRICTS.filter((d) => d.division === 'Mymensingh').map((d) => (
                    <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* 2. Dhaka Area Selector (if Dhaka) OR Thana/Upazila text input (if Outside Dhaka) */}
            {district === 'dhaka' ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Dhaka Area / থানা *</label>
                  {isDhakaSubUrban && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      সাব-ঢাকা ডেলিভারি ({formatPrice(outsideRate)})
                    </span>
                  )}
                </div>
                <select
                  value={dhakaArea}
                  onChange={(e) => handleDhakaAreaChange(e.target.value)}
                  className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-semibold cursor-pointer"
                >
                  <optgroup label="Dhaka City (ঢাকা সিটি - ৳80 ডেলিভারি)">
                    {DHAKA_AREAS.filter((a) => !a.isSubUrban).map((a) => (
                      <option key={a.id} value={a.id}>{a.nameBn} ({a.nameEn})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sub-urban Dhaka (ঢাকার বাইরে/সাব-ঢাকা - ৳150 ডেলিভারি)">
                    {DHAKA_AREAS.filter((a) => a.isSubUrban).map((a) => (
                      <option key={a.id} value={a.id}>{a.nameBn} ({a.nameEn})</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 sm:col-span-2 animate-in fade-in duration-150">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Thana / Upazila / Area (থানা / উপজেলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panchlaish, Agrabad, Kotwali, etc."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
                />
              </div>
            )}

            {/* 3. Delivery Charge Live Visual Badge */}
            <div className={`sm:col-span-2 p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
              !isOutsideDelivery 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2.5">
                <Truck className={`h-4 w-4 shrink-0 ${!isOutsideDelivery ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <span className="font-bold block">
                    {!isOutsideDelivery ? 'ঢাকা সিটির ভেতরে হোম ডেলিভারি' : 'ঢাকার বাইরে সারা বাংলাদেশে হোম ডেলিভারি'}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {!isOutsideDelivery ? 'সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি' : 'সাধারণত ২-৪ কার্যদিবসের মধ্যে ডেলিভারি'}
                  </span>
                </div>
              </div>
              <span className="font-black font-mono text-sm">
                {isFreeShipping ? 'FREE' : formatPrice(computedShippingRate)}
              </span>
            </div>

            {/* 4. Street Address & Realtime Keyword Detection */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Delivery Address (সম্পূর্ণ ঠিকানা) *</label>
              <textarea
                required
                rows={3}
                placeholder="House #, Road #, Area, Landmark / সম্পূর্ণ ঠিকানা..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
              {detectedOutsideKeyword && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 shadow-xs animate-in fade-in duration-200 mt-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-bold text-amber-950">
                      ঠিকানায় &ldquo;{detectedOutsideKeyword}&rdquo; পাওয়া গেছে (ঢাকার বাইরে)।
                    </p>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      যেহেতু আপনার ঠিকানাটি ঢাকার বাইরে, তাই ডেলিভারি চার্জ অটোমেটিক ঢাকার বাইরে ({formatPrice(outsideRate)}) নির্ধারিত হয়েছে।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Postal Code */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Postal Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 1229"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Order Note (Optional)</label>
              <input
                type="text"
                placeholder="Special instructions for delivery"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-2xl border border-zinc-200 p-3.5 text-base sm:text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="border-t border-zinc-100 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-zinc-900 text-xs uppercase tracking-wider">Payment Method / পেমেন্ট মাধ্যম</h4>
              {isAdvanceRequired && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  অগ্রিম কুরিয়ার ফি প্রযোজ্য
                </span>
              )}
            </div>

            {/* Advance Courier Policy Alert Notice */}
            {isAdvanceRequired && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 text-amber-950 flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase font-mono tracking-wider">জরুরি তথ্য</span>
                  <span className="text-xs font-bold text-amber-900">ডেলিভারি চার্জ অগ্রিম প্রযোজ্য</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  {advanceCourierNote || 'ঢাকার বাইরে ক্যাশ অন ডেলিভারি অর্ডারে ফেক অর্ডার রোধে ডেলিভারি চার্জ অগ্রিম প্রযোজ্য।'}
                </p>
                <div className="flex items-center gap-3 pt-1 border-t border-amber-200/60 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>অগ্রিম প্রদেয়: <strong className="font-mono font-bold">{formatPrice(advancePayableAmount)}</strong></span>
                  </div>
                  <span className="text-amber-300">|</span>
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>ডেলিভারির সময় বাকি প্রদেয়: <strong className="font-mono font-bold">{formatPrice(dueOnDeliveryAmount)}</strong></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* If Advance Courier is Required */}
            {isAdvanceRequired ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: COD with Advance Mobile Banking */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950/10'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="h-4 w-4 text-zinc-950 focus:ring-zinc-950"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">Cash on Delivery (কুরিয়ার চার্জ অগ্রিম)</span>
                      <span className="text-[10px] text-zinc-500">বিকাশ/নগদে {formatPrice(advancePayableAmount)} দিয়ে অর্ডার করুন</span>
                    </div>
                  </label>

                  {/* Option 2: Online Payment via Card / SSLCommerz */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">Online Payment Gateway</span>
                      <span className="text-[10px] text-zinc-400">Card, bKash, Nagad via SSLCommerz</span>
                    </div>
                  </label>
                </div>

                {/* Sub-form when COD with Advance is selected */}
                {paymentMethod === 'COD' && (
                  <div className="border border-zinc-200 bg-zinc-50/50 p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in duration-200 mt-1">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                      <span className="text-xs font-black uppercase text-zinc-700 tracking-wider">
                        Select Gateway for Courier Charge ({formatPrice(advancePayableAmount)})
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAdvanceMethod('BKASH')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            advanceMethod === 'BKASH'
                              ? 'bg-[#E2136E] text-white shadow-xs'
                              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          bKash
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvanceMethod('NAGAD')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            advanceMethod === 'NAGAD'
                              ? 'bg-[#F7921E] text-white shadow-xs'
                              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          Nagad
                        </button>
                      </div>
                    </div>

                    {/* bKash Guide for Advance */}
                    {advanceMethod === 'BKASH' ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-white border border-pink-200 p-3 rounded-xl shadow-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR bKash Merchant Number</span>
                            <span className="text-sm font-black text-zinc-950 font-mono">{bkashNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(bkashNumber)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E2136E] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#c90f61] transition-colors shadow-xs"
                          >
                            {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                          <p><strong className="text-zinc-900">ধাপ ১:</strong> বিকাশ অ্যাপে গিয়ে <strong>Make Payment</strong> অপশনে যান।</p>
                          <p><strong className="text-zinc-900">ধাপ ২:</strong> মার্চেন্ট নম্বর <strong className="font-mono text-zinc-950">{bkashNumber}</strong> দিন।</p>
                          <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950 font-bold">{formatPrice(advancePayableAmount)}</strong> প্রদান করুন।</p>
                          <p><strong className="text-zinc-900">ধাপ ৪:</strong> পেমেন্ট শেষে ফিরতি SMS থেকে <strong>Transaction ID (TrxID)</strong> ও আপনার প্রেরক নম্বর নিচে লিখুন।</p>
                        </div>
                      </div>
                    ) : (
                      /* Nagad Guide for Advance */
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-white border border-amber-200 p-3 rounded-xl shadow-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR Nagad Personal Number</span>
                            <span className="text-sm font-black text-zinc-950 font-mono">{nagadNumber}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyNumber(nagadNumber)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7921E] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#d87c14] transition-colors shadow-xs"
                          >
                            {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                          <p><strong className="text-zinc-900">ধাপ ১:</strong> নগদ অ্যাপে গিয়ে <strong>Send Money</strong> অপশনে যান।</p>
                          <p><strong className="text-zinc-900">ধাপ ২:</strong> প্রাপক নম্বর <strong className="font-mono text-zinc-950">{nagadNumber}</strong> দিন।</p>
                          <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950 font-bold">{formatPrice(advancePayableAmount)}</strong> প্রদান করুন।</p>
                          <p><strong className="text-zinc-900">ধাপ ৪:</strong> সেন্ড মানি শেষে ফিরতি SMS থেকে <strong>Transaction ID (TrxID)</strong> ও আপনার প্রেরক নম্বর নিচে লিখুন।</p>
                        </div>
                      </div>
                    )}

                    {/* Inputs for Advance Sender & TrxID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">
                          আপনার {advanceMethod === 'BKASH' ? 'বিকাশ' : 'নগদ'} নম্বর *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="border border-zinc-300 p-3 text-xs bg-white rounded-xl focus:outline-none focus:border-zinc-950 font-mono font-medium shadow-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9J8K7L6M"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          className="border border-zinc-300 p-3 text-xs bg-white rounded-xl focus:outline-none focus:border-zinc-950 font-mono font-bold uppercase shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Online Payment chosen with Advance */}
                {paymentMethod === 'ONLINE' && (
                  <div className="border border-indigo-200 bg-indigo-50/40 p-4 rounded-2xl flex flex-col gap-3 animate-in fade-in">
                    <span className="text-xs font-bold text-indigo-950">অনলাইনে কি পরিমাণ পরিশোধ করতে চান?</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer">
                        <input
                          type="radio"
                          name="onlinePayMode"
                          value="ADVANCE"
                          checked={onlinePayMode === 'ADVANCE'}
                          onChange={() => setOnlinePayMode('ADVANCE')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>শুধুমাত্র কুরিয়ার চার্জ <strong className="font-mono text-zinc-950">{formatPrice(advancePayableAmount)}</strong> দিন (বাকি {formatPrice(dueOnDeliveryAmount)} ক্যাশ অন ডেলিভারি)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer">
                        <input
                          type="radio"
                          name="onlinePayMode"
                          value="FULL"
                          checked={onlinePayMode === 'FULL'}
                          onChange={() => setOnlinePayMode('FULL')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>সম্পূর্ণ অর্ডার মূল্য <strong className="font-mono text-zinc-950">{formatPrice(grandTotal)}</strong> অনলাইনে পরিশোধ করুন</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Payment Methods when advance is not required (e.g. Inside Dhaka) */
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD Option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-zinc-950 bg-zinc-50 shadow-sm ring-1 ring-zinc-950/10'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="h-4 w-4 text-zinc-950 focus:ring-zinc-950"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">Cash on Delivery</span>
                      <span className="text-[10px] text-zinc-400">Pay cash upon delivery (পণ্য হাতে পেয়ে টাকা দিন)</span>
                    </div>
                  </label>

                  {/* bKash Option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'BKASH'
                        ? 'border-[#E2136E] bg-pink-50/60 shadow-sm ring-1 ring-[#E2136E]/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BKASH"
                      checked={paymentMethod === 'BKASH'}
                      onChange={() => setPaymentMethod('BKASH')}
                      className="h-4 w-4 text-[#E2136E] focus:ring-[#E2136E]"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#E2136E]">bKash</span>
                        <span className="text-[9px] bg-[#E2136E]/10 text-[#E2136E] font-black px-1.5 py-0.2 rounded font-mono uppercase">Merchant</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Make Payment / TrxID Verification</span>
                    </div>
                  </label>

                  {/* Nagad Option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'NAGAD'
                        ? 'border-[#F7921E] bg-amber-50/60 shadow-sm ring-1 ring-[#F7921E]/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NAGAD"
                      checked={paymentMethod === 'NAGAD'}
                      onChange={() => setPaymentMethod('NAGAD')}
                      className="h-4 w-4 text-[#F7921E] focus:ring-[#F7921E]"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F7921E]">Nagad</span>
                        <span className="text-[9px] bg-[#F7921E]/10 text-[#F7921E] font-black px-1.5 py-0.2 rounded font-mono uppercase">Personal</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">Send Money / TrxID Verification</span>
                    </div>
                  </label>

                  {/* Online Payment Option */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-600/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900">Card & Mobile Banking</span>
                      <span className="text-[10px] text-zinc-400">Visa, Mastercard, Amex, SSLCommerz</span>
                    </div>
                  </label>
                </div>

                {/* Direct bKash Detailed Instructions & Form */}
                {paymentMethod === 'BKASH' && (
                  <div className="border border-[#E2136E]/30 bg-pink-50/40 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#E2136E]/20 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                        <span className="text-xs font-black uppercase text-[#E2136E] font-mono tracking-wider">bKash Merchant Payment Guide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-600">Total:</span>
                        <span className="text-sm font-black text-zinc-950 font-mono">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-pink-200/80 p-3.5 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR bKash Number (Merchant Account)</span>
                        <span className="text-sm font-black text-zinc-950 font-mono tracking-wider">{bkashNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(bkashNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E2136E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c90f61] transition-colors shadow-sm cursor-pointer"
                      >
                        {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                      <p><strong className="text-zinc-900">ধাপ ১:</strong> বিকাশ অ্যাপ ওপেন করুন অথবা <strong>*247#</strong> ডায়াল করে <strong>Make Payment</strong> সিলেক্ট করুন।</p>
                      <p><strong className="text-zinc-900">ধাপ ২:</strong> মার্চেন্ট নম্বর হিসেবে <strong className="font-mono text-zinc-950">{bkashNumber}</strong> দিন।</p>
                      <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950">{formatPrice(grandTotal)}</strong> দিয়ে রেফারেন্স নম্বর দিন।</p>
                      <p><strong className="text-zinc-900">ধাপ ৪:</strong> পেমেন্ট সম্পন্ন করার পর ফিরতি মেসেজ থেকে <strong>Transaction ID (TrxID)</strong> এবং আপনার <strong>প্রেরক বিকাশ নম্বর</strong> নিচে দিন।</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200/40">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Your bKash Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="border border-pink-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#E2136E] font-mono font-medium shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">bKash Transaction ID (TrxID) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9J8K7L6M"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          className="border border-pink-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#E2136E] font-mono font-bold uppercase shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Nagad Detailed Instructions & Form */}
                {paymentMethod === 'NAGAD' && (
                  <div className="border border-[#F7921E]/30 bg-amber-50/40 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#F7921E]/20 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F7921E]" />
                        <span className="text-xs font-black uppercase text-[#F7921E] font-mono tracking-wider">Nagad Personal Send Money Guide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-600">Total:</span>
                        <span className="text-sm font-black text-zinc-950 font-mono">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-amber-200/80 p-3.5 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">ONWEAR Nagad Number (Personal Account)</span>
                        <span className="text-sm font-black text-zinc-950 font-mono tracking-wider">{nagadNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(nagadNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7921E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d87c14] transition-colors shadow-sm cursor-pointer"
                      >
                        {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedNumber ? 'Copied!' : 'Copy Number'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-zinc-600 leading-relaxed flex flex-col gap-1 pl-1">
                      <p><strong className="text-zinc-900">ধাপ ১:</strong> নগদ অ্যাপ ওপেন করুন অথবা <strong>*167#</strong> ডায়াল করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                      <p><strong className="text-zinc-900">ধাপ ২:</strong> প্রাপক নম্বর হিসেবে <strong className="font-mono text-zinc-950">{nagadNumber}</strong> দিন।</p>
                      <p><strong className="text-zinc-900">ধাপ ৩:</strong> টাকার পরিমাণ <strong className="font-mono text-zinc-950">{formatPrice(grandTotal)}</strong> দিয়ে সেন্ড মানি সম্পন্ন করুন।</p>
                      <p><strong className="text-zinc-900">ধাপ ৪:</strong> সেন্ড মানি সম্পন্ন করার পর SMS থেকে <strong>Transaction ID (TrxID)</strong> এবং আপনার <strong>প্রেরক নগদ নম্বর</strong> নিচে দিন।</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/40">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Your Nagad Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="01XXXXXXXXX"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="border border-amber-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#F7921E] font-mono font-medium shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">Nagad Transaction ID (TrxID) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 7X8Y9Z01"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          className="border border-amber-300/80 p-3 text-xs bg-white focus:outline-none focus:border-[#F7921E] font-mono font-bold uppercase shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Order Summary & Placement */}
        <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-black text-zinc-900 border-b border-zinc-100 pb-4 text-base uppercase tracking-wider">
            Order Summary
          </h3>

          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item: any) => {
              const prod = item.product || {};
              const price = prod.discountPrice !== null && prod.discountPrice !== undefined ? prod.discountPrice : (prod.price || 0);

              return (
                <div key={item.id} className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2">
                  <div className="flex items-center gap-3 flex-1 pr-2">
                    <img
                      src={prod.image || '/placeholder.svg'}
                      alt={prod.name}
                      className="h-10 w-10 object-cover rounded-lg border border-zinc-100 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 line-clamp-1">{prod.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400">
                        <span>Qty: {item.quantity}</span>
                        {item.size && (
                          <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 rounded text-[10px] font-mono capitalize">
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 font-mono">{formatPrice(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Promo Code</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon || isValidatingCoupon}
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs bg-zinc-50 uppercase font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:bg-zinc-300 shadow-sm"
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {couponSuccess && <p className="text-[11px] font-bold text-emerald-600">{couponSuccess}</p>}
            {couponError && <p className="text-[11px] font-bold text-red-600">{couponError}</p>}
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-xs font-medium">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-zinc-900">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 items-center">
              <span>Shipping ({!isOutsideDelivery ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
              {isFreeShipping ? (
                <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                  FREE DELIVERY
                </span>
              ) : (
                <span className="font-mono font-bold text-zinc-900">{formatPrice(computedShippingRate)}</span>
              )}
            </div>
            {discountApplied > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied</span>
                <span className="font-mono">- {formatPrice(discountApplied)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline border-t border-zinc-200 pt-3 text-zinc-950">
              <span className="text-sm font-black uppercase tracking-wider">Total Value</span>
              <span className="text-2xl font-black text-teal-650 font-mono">{formatPrice(grandTotal)}</span>
            </div>

            {/* Advance vs Due breakdown */}
            {isAdvanceRequired && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>অগ্রিম প্রদেয় (কুরিয়ার বিল):</span>
                  </span>
                  <span className="font-black text-rose-600 font-mono text-sm">{formatPrice(advancePayableAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-amber-200/60 pt-2">
                  <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>পণ্য পেয়ে পরিশোধ করবেন (COD):</span>
                  </span>
                  <span className="font-black text-emerald-700 font-mono text-sm">{formatPrice(dueOnDeliveryAmount)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-950 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Confirm & Place Order</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
