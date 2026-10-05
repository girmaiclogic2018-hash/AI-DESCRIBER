'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Zap, CreditCard, CheckCircle2, RefreshCw, Store, 
  Bot, FileText, ShieldCheck, Activity, ArrowRight, Settings, AlertCircle,
  Copy, Check, FileDown, Layers, Search, Filter, CheckSquare, Square, Eye, X, ArrowUpRight,
  FileSpreadsheet, MoreVertical, Trash2
} from 'lucide-react';
import { exportProductDescriptionPdf, exportLicenseCertificatePdf } from '@/lib/pdf-export';
import { exportCatalogToCsv } from '@/lib/csv-export';
import { ThemeToggle } from '@/components/theme-toggle';

interface CatalogProduct {
  id: string;
  title: string;
  vendor: string;
  tags: string;
  hasDescription: boolean;
  descriptionHtml?: string;
  status: 'idle' | 'processing' | 'updated' | 'error';
  updatedAt?: string;
}

export default function AppDashboard() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'automation' | 'billing' | 'bank-store'>('sandbox');
  
  // Bank & Store Checkout state
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Chase Bank Business Checking',
    accountHolder: 'Merchant Owner',
    maskedAccount: '•••• 4829',
    routingNumber: '••••••••102',
    status: 'Active & Verified for Payouts',
    connected: true
  });
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolder: '',
    routingNumber: '',
    accountNumber: '',
    country: 'United States'
  });
  const [bankConnectSuccess, setBankConnectSuccess] = useState<string | null>(null);

  // Store Checkout state
  const [selectedStoreProduct, setSelectedStoreProduct] = useState({
    id: 'prod_ai_pass_9',
    name: 'Shopify AI Monthly Automation Pass',
    price: 9.00,
    description: '24/7 automated product description generation & Shopify GraphQL sync for unlimited store products.'
  });
  const [customerEmail, setCustomerEmail] = useState('merchant@yourstore.com');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card / Apple Pay');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'txn_983412', date: 'October 2, 2026', amount: 8.74, status: 'Deposited', product: 'Shopify AI Monthly Pass' },
    { id: 'txn_982901', date: 'September 28, 2026', amount: 28.16, status: 'Deposited', product: 'Bulk Accelerator Pack' },
    { id: 'txn_981442', date: 'September 22, 2026', amount: 96.03, status: 'Deposited', product: 'Enterprise Agency Suite' },
    { id: 'txn_980129', date: 'October 4, 2026', amount: 8.74, status: 'Pending', product: 'Shopify AI Monthly Pass' },
  ]);

  const [purchasedProducts, setPurchasedProducts] = useState([
    {
      id: 'prod_ai_pass_9',
      name: 'Shopify AI Monthly Automation Pass',
      orderId: 'ORD-892104',
      date: 'October 2, 2026',
      accessCode: 'LIC-7F9B2X9A',
      downloadUrl: '#download-pass',
      status: 'Active'
    },
    {
      id: 'prod_bulk_29',
      name: 'Shopify AI Bulk Accelerator (500 Credits)',
      orderId: 'ORD-771923',
      date: 'September 28, 2026',
      accessCode: 'LIC-4K2M9P1Q',
      downloadUrl: '#download-accelerator',
      status: 'Active'
    },
    {
      id: 'prod_enterprise_99',
      name: 'Enterprise Unlimited Agency Suite',
      orderId: 'ORD-981442',
      date: 'Today, Just Now',
      accessCode: 'LIC-9Z1X8W3V',
      downloadUrl: '#download-enterprise',
      status: 'Pending'
    }
  ]);

  const [productSearchQuery, setProductSearchQuery] = useState('');

  const filteredPurchasedProducts = purchasedProducts.filter(prod => 
    prod.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    prod.orderId.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    prod.accessCode.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleDownloadProduct = (product: any) => {
    const content = JSON.stringify({
      productName: product.name,
      orderId: product.orderId,
      licenseKey: product.accessCode,
      purchasedDate: product.date,
      status: 'Verified & Active',
      instructions: 'Thank you for your purchase! Use this license key in your AI Describer Shopify Applet settings to activate 24/7 automated background generation.'
    }, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.orderId}-license-certificate.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConnectBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingBank(true);
    setBankConnectSuccess(null);
    try {
      const res = await fetch('/api/bank/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm),
      });
      const data = await res.json();
      if (data.success) {
        setBankInfo({
          bankName: data.bankDetails.bankName,
          accountHolder: data.bankDetails.accountHolder,
          maskedAccount: data.bankDetails.maskedAccount,
          routingNumber: `••••••${bankForm.routingNumber.slice(-3)}`,
          status: data.bankDetails.status,
          connected: true
        });
        setBankConnectSuccess("Bank account successfully linked and verified! All future customer payments will deposit directly into this account.");
        setBankForm({ bankName: '', accountHolder: '', routingNumber: '', accountNumber: '', country: 'United States' });
      } else {
        alert(data.error || 'Failed to connect bank');
      }
    } catch (err: any) {
      alert('Error connecting bank: ' + err.message);
    } finally {
      setIsConnectingBank(false);
    }
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingCheckout(true);
    setCheckoutResult(null);
    try {
      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedStoreProduct.id,
          productName: selectedStoreProduct.name,
          amount: selectedStoreProduct.price,
          customerEmail,
          paymentMethod,
          bankInfo
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutResult(data.transaction);
        setPayoutHistory(prev => [
          {
            id: data.transaction.transactionId,
            date: 'Today, Just Now',
            amount: data.transaction.payoutDetails.merchantNetDeposit,
            status: 'Pending',
            product: data.transaction.productName
          },
          ...prev
        ]);
        setPurchasedProducts(prev => [
          {
            id: selectedStoreProduct.id,
            name: data.transaction.productName,
            orderId: data.transaction.orderId,
            date: 'Today, Just Now',
            accessCode: data.transaction.fulfillment.accessCode,
            downloadUrl: data.transaction.fulfillment.downloadUrl,
            status: 'Pending'
          },
          ...prev
        ]);
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (err: any) {
      alert('Checkout error: ' + err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };
  
  // Playground sub-mode: single generator or bulk actions
  const [playgroundMode, setPlaygroundMode] = useState<'single' | 'bulk'>('single');

  // Single Sandbox state
  const [title, setTitle] = useState('Elegance Handcrafted Leather Backpack');
  const [vendor, setVendor] = useState('Artisan Goods Co.');
  const [tags, setTags] = useState('leather, backpack, travel, handmade');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [activeDropdownProductId, setActiveDropdownProductId] = useState<string | null>(null);

  // Bulk Actions state
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([
    {
      id: 'gid://shopify/Product/8492019',
      title: 'Matte Black Stainless Tumbler (20oz)',
      vendor: 'HydroVibe',
      tags: 'drinkware, stainless, travel, insulated',
      hasDescription: false,
      status: 'idle'
    },
    {
      id: 'gid://shopify/Product/8492020',
      title: 'Merino Wool Trail Running Socks (3-Pack)',
      vendor: 'AlpineCraft',
      tags: 'apparel, merino wool, running, socks',
      hasDescription: false,
      status: 'idle'
    },
    {
      id: 'gid://shopify/Product/8492021',
      title: 'Ergonomic Walnut Solid Wood Monitor Riser',
      vendor: 'GroveStudio',
      tags: 'office, walnut, desk, ergonomic',
      hasDescription: false,
      status: 'idle'
    },
    {
      id: 'gid://shopify/Product/8492022',
      title: 'Organic French Linen Duvet Cover Set',
      vendor: 'Maison Linen',
      tags: 'home, bedding, linen, breathable',
      hasDescription: false,
      status: 'idle'
    },
    {
      id: 'gid://shopify/Product/8492023',
      title: 'Ultrasonic Essential Oil Diffuser with Ambient LED',
      vendor: 'AuraMist',
      tags: 'wellness, aroma, diffuser, home',
      hasDescription: false,
      status: 'idle'
    },
    {
      id: 'gid://shopify/Product/8492024',
      title: 'Japanese Damascus Steel 8-inch Chef Knife',
      vendor: 'Kage Knives',
      tags: 'kitchen, cutlery, chef knife, damascus',
      hasDescription: true,
      descriptionHtml: '<p>Handcrafted 67-layer Japanese Damascus steel chef knife designed for precision culinary cutting.</p><ul><li>67-Layer VG-10 Core Damascus Steel</li><li>Ergonomic Pakkawood Balance Handle</li><li>Razor-sharp 15-degree hand-honed blade</li></ul>',
      status: 'idle'
    }
  ]);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    'gid://shopify/Product/8492019',
    'gid://shopify/Product/8492020',
    'gid://shopify/Product/8492021'
  ]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'missing' | 'has'>('all');
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [previewProduct, setPreviewProduct] = useState<CatalogProduct | null>(null);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);
  const [previewCopied, setPreviewCopied] = useState(false);
  const [csvExported, setCsvExported] = useState(false);

  const handleExportCsv = () => {
    const toExport = selectedProductIds.length > 0
      ? catalogProducts.filter(p => selectedProductIds.includes(p.id))
      : filteredCatalog;
    exportCatalogToCsv(toExport);
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2500);
  };

  const [copyRipples, setCopyRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!generatedText) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now() + Math.random();
    setCopyRipples(prev => [...prev, { x, y, id: rippleId }]);
    setTimeout(() => {
      setCopyRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 350);

    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    if (!generatedText) return;
    setIsExportingPdf(true);
    try {
      exportProductDescriptionPdf({
        title,
        vendor,
        tags,
        htmlContent: generatedText,
      });
      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 2500);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Automation / Logs state
  const [logs, setLogs] = useState([
    { id: 1, time: '2 mins ago', product: 'Minimalist Ceramic Coffee Mug', status: 'Enriched', idNum: 'gid://shopify/Product/8492019' },
    { id: 2, time: '14 mins ago', product: 'Organic Cotton Crewneck', status: 'Enriched', idNum: 'gid://shopify/Product/8491823' },
    { id: 3, time: '1 hour ago', product: 'Brass Desk Lamp', status: 'Skipped (Has Description)', idNum: 'gid://shopify/Product/8489912' },
  ]);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // Billing state
  const [billingStatus, setBillingStatus] = useState({
    active: true,
    amount: 9.00,
    currencyCode: 'USD',
    interval: 'EVERY_30_DAYS',
    nextBillingDate: 'November 1, 2026'
  });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setBillingStatus(prev => ({
          ...prev,
          active: false
        }));
      } else {
        alert(data.error || 'Failed to cancel subscription.');
      }
    } catch (err: any) {
      alert('Error cancelling subscription: ' + err.message);
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, vendor, tags }),
      });
      const result = await res.json();
      if (result.success) {
        setGeneratedText(result.data);
      } else {
        setGeneratedText(`<p>Error: ${result.error || 'Generation failed'}</p>`);
      }
    } catch (err: any) {
      setGeneratedText(`<p>Network error: ${err.message}</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk Actions Handlers
  const filteredCatalog = catalogProducts.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.vendor.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.tags.toLowerCase().includes(catalogSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (catalogFilter === 'missing') return !item.hasDescription;
    if (catalogFilter === 'has') return item.hasDescription;
    return true;
  });

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredCatalog.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const selectOnlyMissing = () => {
    const missingIds = catalogProducts.filter(p => !p.hasDescription).map(p => p.id);
    setSelectedProductIds(missingIds);
  };

  const handleTriggerBatchUpdate = async () => {
    const toUpdate = catalogProducts.filter(p => selectedProductIds.includes(p.id));
    if (toUpdate.length === 0) return;

    setIsBatchUpdating(true);
    setBatchSuccessMessage(null);
    setBatchProgress({ current: 0, total: toUpdate.length });

    setCatalogProducts(prev => 
      prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: 'processing' } : p)
    );

    try {
      const res = await fetch('/api/products/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: toUpdate.map(p => ({
            id: p.id,
            title: p.title,
            vendor: p.vendor,
            tags: p.tags,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        setCatalogProducts(prev =>
          prev.map(p => {
            const match = data.results.find((r: any) => r.id === p.id);
            if (match && match.success) {
              return {
                ...p,
                hasDescription: true,
                descriptionHtml: match.description,
                status: 'updated',
                updatedAt: 'Just now'
              };
            } else if (match && !match.success) {
              return { ...p, status: 'error' };
            }
            return p;
          })
        );

        setBatchProgress({ current: toUpdate.length, total: toUpdate.length });
        setBatchSuccessMessage(`Batch processing completed: ${data.processedCount} product descriptions generated and synced to Shopify store via GraphQL.`);

        // Append to automation logs
        const newLogs = data.results.map((r: any) => ({
          id: Date.now() + Math.random(),
          time: 'Just now',
          product: r.title,
          status: 'Batch Enriched via AI',
          idNum: r.id
        }));
        setLogs(prev => [...newLogs, ...prev]);
      }
    } catch (err) {
      console.error('Batch generation failed:', err);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const simulateIncomingWebhook = async () => {
    setIsSimulatingWebhook(true);
    try {
      const mockProduct = {
        id: Math.floor(Math.random() * 9000000 + 1000000),
        title: 'Nomad Waterproof Travel Duffle',
        vendor: 'Nomad Gear',
        tags: 'travel, bag, waterproof, duffle',
        body_html: ''
      };

      await fetch('/api/webhooks/products-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: 'store.myshopify.com', body: JSON.stringify(mockProduct) }),
      });

      setTimeout(() => {
        setLogs(prev => [
          { 
            id: Date.now(), 
            time: 'Just now', 
            product: mockProduct.title, 
            status: 'Enriched Successfully via OpenAI GPT-4o', 
            idNum: `gid://shopify/Product/${mockProduct.id}` 
          },
          ...prev
        ]);
        setIsSimulatingWebhook(false);
      }, 800);
    } catch (e) {
      setIsSimulatingWebhook(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Shopify Polaris Style Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 dark:bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Describer</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous Shopify Product Content Engine</p>
          </div>
        </div>

        {/* 3-Zone Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-transparent dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'sandbox' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Live Playground
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'automation' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            24/7 Webhooks & Automation
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'billing' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Billing & Subscription ($9/mo)
          </button>
          <button
            onClick={() => setActiveTab('bank-store')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'bank-store' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Bank Payouts & Checkout
          </button>
        </nav>

        {/* Theme Toggle & Status Badge */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Webhook Engine Active
          </span>
        </div>
      </header>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'sandbox' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Playground
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'automation' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Webhooks
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'billing' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Billing ($9/mo)
        </button>
        <button
          onClick={() => setActiveTab('bank-store')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'bank-store' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Bank & Checkout
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            {/* Playground Mode Segmented Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Product Description Studio</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Generate high-converting semantic HTML product copy one-by-one or perform bulk catalog updates.</p>
              </div>

              {/* Sub-Tabs: Single Drafter vs Bulk Actions */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                <button
                  onClick={() => setPlaygroundMode('single')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    playgroundMode === 'single'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Single Drafter
                </button>
                <button
                  onClick={() => setPlaygroundMode('bulk')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    playgroundMode === 'bulk'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Bulk Actions & Batch Update
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                    {catalogProducts.filter(p => !p.hasDescription).length} Blank
                  </span>
                </button>
              </div>
            </div>

            {/* View 1: Single Product Drafter */}
            {playgroundMode === 'single' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Input Form */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Draft Product Attributes</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('Artisan Japanese Cast Iron Teapot');
                        setVendor('Kyoto Kobo');
                        setTags('tea, iron, japanese, kettle, handcrafted');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Load Sample
                    </button>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Product Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Handmade Ceramic Dinnerware Set"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Brand / Vendor</label>
                      <input
                        type="text"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        placeholder="e.g. Artisan Home Co."
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Tags & Keywords</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. kitchen, ceramic, dinner, glazed"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating Semantic HTML...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Description
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Generated Output Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col h-full min-h-[420px]">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Generated Output Preview
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {generatedText && (
                        <>
                          <button
                            id="preview-copy-button"
                            type="button"
                            onClick={handleCopy}
                            className="relative overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                            title="Copy generated HTML to clipboard"
                          >
                            {copyRipples.map((ripple) => (
                              <span
                                key={ripple.id}
                                className="ripple-animation bg-indigo-500/35 dark:bg-indigo-400/40"
                                style={{
                                  left: ripple.x,
                                  top: ripple.y,
                                  width: 24,
                                  height: 24,
                                }}
                              />
                            ))}
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 relative z-10" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold relative z-10">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 relative z-10" />
                                <span className="relative z-10">Copy to Clipboard</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:bg-slate-950 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            title="Export product description as formatted PDF document"
                          >
                            {pdfExported ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>PDF Saved!</span>
                              </>
                            ) : isExportingPdf ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Exporting...</span>
                              </>
                            ) : (
                              <>
                                <FileDown className="w-3.5 h-3.5 text-indigo-300" />
                                <span>Export PDF</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                      {generatedText && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                          Ready for Shopify
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg p-5 overflow-y-auto">
                    {generatedText ? (
                      <div 
                        className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-3 dark:text-slate-200"
                        dangerouslySetInnerHTML={{ __html: generatedText }}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-500">
                        <Sparkles className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fill in attributes on the left and click Generate.</p>
                        <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Generates clean semantic HTML with &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, and &lt;strong&gt; tags.</p>
                      </div>
                    )}
                  </div>

                  {generatedText && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Semantic HTML format ready for Shopify Admin</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Copied HTML</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy HTML</span>
                            </>
                          )}
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          disabled={isExportingPdf}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FileDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Export PDF Record</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View 2: Bulk Actions Section */}
            {playgroundMode === 'bulk' && (
              <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Store Product Catalog & Bulk Enrichment
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select multiple products with missing descriptions and trigger an automated AI batch generation with Shopify GraphQL sync.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                        title="Export product catalog (Title, Vendor, Tags, Description status) as CSV file"
                      >
                        {csvExported ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">CSV Exported!</span>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Export CSV ({selectedProductIds.length > 0 ? `${selectedProductIds.length} Selected` : `${filteredCatalog.length} Items`})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={selectOnlyMissing}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Select All Missing ({catalogProducts.filter(p => !p.hasDescription).length})
                      </button>

                      <button
                        type="button"
                        onClick={handleTriggerBatchUpdate}
                        disabled={isBatchUpdating || selectedProductIds.length === 0}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isBatchUpdating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Updating {selectedProductIds.length} Products...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-300" />
                            <span>Batch Update Descriptions ({selectedProductIds.length})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Batch Progress Bar */}
                  {isBatchUpdating && (
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                          Processing AI description mutations via Shopify GraphQL Admin API...
                        </span>
                        <span>{batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                          style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 30}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Batch Success Message */}
                  {batchSuccessMessage && (
                    <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {batchSuccessMessage}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setBatchSuccessMessage(null)}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Filter and Search Bar */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search products or vendors..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setCatalogFilter('all')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            catalogFilter === 'all'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                          }`}
                        >
                          All ({catalogProducts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatalogFilter('missing')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            catalogFilter === 'missing'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                          }`}
                        >
                          Missing ({catalogProducts.filter(p => !p.hasDescription).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatalogFilter('has')}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            catalogFilter === 'has'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                          }`}
                        >
                          Described ({catalogProducts.filter(p => p.hasDescription).length})
                        </button>
                      </div>

                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {selectedProductIds.length} of {catalogProducts.length} selected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                          <th className="py-3 px-4 w-12 text-center">
                            <button
                              type="button"
                              onClick={toggleSelectAllFiltered}
                              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                              title="Select/Deselect all filtered"
                            >
                              {filteredCatalog.length > 0 && filteredCatalog.every(p => selectedProductIds.includes(p.id)) ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-4">Product Details</th>
                          <th className="py-3 px-4">Brand / Vendor</th>
                          <th className="py-3 px-4">Tags</th>
                          <th className="py-3 px-4">Description State</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {filteredCatalog.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                              No products match the filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredCatalog.map((product) => {
                            const isSelected = selectedProductIds.includes(product.id);
                            return (
                              <tr 
                                key={product.id}
                                className={`transition-colors ${
                                  isSelected 
                                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20' 
                                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleSelectProduct(product.id)}
                                    className="cursor-pointer text-slate-500 dark:text-slate-400"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>

                                <td className="py-3 px-4">
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">{product.title}</p>
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{product.id}</span>
                                </td>

                                <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                  {product.vendor}
                                </td>

                                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                                  {product.tags}
                                </td>

                                <td className="py-3 px-4">
                                  {product.status === 'processing' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      AI Generating...
                                    </span>
                                  ) : product.status === 'updated' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Enriched & Synced
                                    </span>
                                  ) : product.hasDescription ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                      Has Description
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                      <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      Missing / Blank
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2 relative">
                                    {product.descriptionHtml ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewProduct(product)}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        View Copy
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                    )}

                                    {/* Quick Actions Dropdown */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownProductId(
                                            activeDropdownProductId === product.id ? null : product.id
                                          );
                                        }}
                                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                        title="Quick Actions"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {activeDropdownProductId === product.id && (
                                        <>
                                          {/* Backdrop to close dropdown */}
                                          <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setActiveDropdownProductId(null)}
                                          />
                                          
                                          {/* Dropdown Menu */}
                                          <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-20 text-left">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                navigator.clipboard.writeText(product.title);
                                                setActiveDropdownProductId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                            >
                                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                                              <span>Copy Title</span>
                                            </button>
                                            
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (product.descriptionHtml) {
                                                  const cleanDesc = product.descriptionHtml.replace(/<[^>]*>/g, ' ');
                                                  navigator.clipboard.writeText(cleanDesc);
                                                }
                                                setActiveDropdownProductId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                              disabled={!product.descriptionHtml}
                                              style={{ opacity: product.descriptionHtml ? 1 : 0.5 }}
                                            >
                                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                                              <span>Copy Description</span>
                                            </button>

                                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                                            <button
                                              type="button"
                                              onClick={() => {
                                                setCatalogProducts(prev => prev.filter(p => p.id !== product.id));
                                                setActiveDropdownProductId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer transition-colors font-semibold"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              <span>Delete from List</span>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: View Generated Product Description Copy */}
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{previewProduct.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Brand: {previewProduct.vendor} · {previewProduct.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-3 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: previewProduct.descriptionHtml || '' }}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Shopify GraphQL catalog status: Synced</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!previewProduct.descriptionHtml) return;
                      navigator.clipboard.writeText(previewProduct.descriptionHtml);
                      setPreviewCopied(true);
                      setTimeout(() => setPreviewCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {previewCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{previewCopied ? 'Copied HTML!' : 'Copy HTML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!previewProduct.descriptionHtml) return;
                      exportProductDescriptionPdf({
                        title: previewProduct.title,
                        vendor: previewProduct.vendor,
                        tags: previewProduct.tags,
                        htmlContent: previewProduct.descriptionHtml,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Subscription Cancellation */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-8 h-8 shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cancel Active Subscription?</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to cancel your Monthly Pro Unlimited subscription? You will lose access to:
                </p>
                
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-5">
                  <li>24/7 background AI product description generation</li>
                  <li>Real-time automated sync with Shopify GraphQL Admin API</li>
                  <li>Unlimited OpenAI GPT-4o-mini generation quotas</li>
                </ul>

                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  This action will immediately disable your billing status and notify the Shopify Billing API.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Keep Subscription
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelSubscription}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Subscription</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 24/7 Webhooks & Automation */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">24/7 Autonomous Background Engine</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Subscribed to Shopify webhook <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">products/create</code>. Automatically fills blank product descriptions while merchants sleep.</p>
              </div>
              <button
                onClick={simulateIncomingWebhook}
                disabled={isSimulatingWebhook}
                className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isSimulatingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                Simulate Incoming Webhook
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Listening Status</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Online & Listening</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Endpoint: /api/webhooks/products-create</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Products Enriched</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {142 + catalogProducts.filter(p => p.status === 'updated').length}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">+16% this week</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Latency</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">412ms</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">GraphQL update speed</p>
              </div>
            </div>

            {/* Execution Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Recent Background Automation Logs
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Real-time webhook events</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-6">Timestamp</th>
                      <th className="py-3 px-6">Product Title</th>
                      <th className="py-3 px-6">Shopify ID</th>
                      <th className="py-3 px-6">Action & Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 text-xs font-mono">{log.time}</td>
                        <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100">{log.product}</td>
                        <td className="py-3.5 px-6 text-slate-400 dark:text-slate-500 text-xs font-mono">{log.idNum}</td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Subscription */}
        {activeTab === 'billing' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Secure Monetization & Billing</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Flat subscription fee of $9.00 USD billed every 30 days via Shopify Billing API.</p>
            </div>

            <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-md p-8 relative overflow-hidden ${billingStatus.active ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-800'}`}>
              <div className={`absolute top-0 right-0 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-bl-xl ${billingStatus.active ? 'bg-indigo-600' : 'bg-slate-500 dark:bg-slate-700'}`}>
                {billingStatus.active ? 'Active Plan' : 'Subscription Cancelled'}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Monthly Pro Unlimited</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated 24/7 background AI generation for all products</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">$9.00</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">USD / 30 days</span>
                </div>
              </div>

              <div className="my-6 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${billingStatus.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={billingStatus.active ? '' : 'line-through text-slate-400'}>Unlimited OpenAI GPT-4o-mini & Shopify GraphQL background sync</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${billingStatus.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={billingStatus.active ? '' : 'line-through text-slate-400'}>24/7 webhook listener for incoming products</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${billingStatus.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>
                    {billingStatus.active ? (
                      <>Next billing renewal: <strong className="text-slate-900 dark:text-slate-100">{billingStatus.nextBillingDate}</strong></>
                    ) : (
                      <span className="text-red-500 font-semibold">Subscription ends soon</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  {billingStatus.active ? 'Shopify App Billing API Verified & Secured' : 'Shopify App Subscription Cancelled'}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {billingStatus.active ? (
                    <>
                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg transition-all cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                      <button
                        onClick={() => alert('Redirecting to Shopify Billing Confirmation Screen...')}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                      >
                        Manage Subscription
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setBillingStatus(prev => ({ ...prev, active: true }))}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Reactivate Monthly Pro Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bank Payouts & Store Checkout */}
        {activeTab === 'bank-store' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Bank Payouts & Secure Customer Checkout</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connect your bank account to receive automated payouts from customer purchases and process live test checkouts.</p>
            </div>

            {/* Grid: Bank Connection status & Customer Checkout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Column 1: Merchant Bank Account Status & Link Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Merchant Payout Bank Account
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Bank Institution:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Account Holder:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{bankInfo.accountHolder}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">{bankInfo.maskedAccount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Routing Number:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">{bankInfo.routingNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Payout Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{bankInfo.status}</span>
                  </div>
                </div>

                {bankConnectSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    {bankConnectSuccess}
                  </div>
                )}

                <form onSubmit={handleConnectBank} className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Link / Update Bank Account</h4>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="e.g. Chase, Bank of America, Wells Fargo"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Routing Number</label>
                      <input
                        type="text"
                        value={bankForm.routingNumber}
                        onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                        placeholder="9-digit routing"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Account Number</label>
                      <input
                        type="password"
                        value={bankForm.accountNumber}
                        onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        placeholder="Account number"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isConnectingBank}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isConnectingBank ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Verify & Connect Bank Account
                  </button>
                </form>
              </div>

              {/* Column 2: Customer Store Checkout & Instant Product Delivery */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Customer Store Checkout Simulator
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Live Test Gateway</span>
                </div>

                <form onSubmit={handleProcessCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Select Product / Pass</label>
                    <select
                      value={selectedStoreProduct.id}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'prod_ai_pass_9') {
                          setSelectedStoreProduct({ id: val, name: 'Shopify AI Monthly Automation Pass', price: 9.00, description: '24/7 automated product description generation.' });
                        } else if (val === 'prod_bulk_29') {
                          setSelectedStoreProduct({ id: val, name: 'Shopify AI Bulk Accelerator (500 Credits)', price: 29.00, description: 'Instant batch enrichment for 500 catalog items.' });
                        } else {
                          setSelectedStoreProduct({ id: val, name: 'Enterprise Unlimited Agency Suite', price: 99.00, description: 'Multi-store automated sync & priority AI generation.' });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    >
                      <option value="prod_ai_pass_9">Shopify AI Monthly Pass ($9.00)</option>
                      <option value="prod_bulk_29">Bulk Accelerator - 500 Credits ($29.00)</option>
                      <option value="prod_enterprise_99">Enterprise Agency Suite ($99.00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Credit Card / Apple Pay">Credit Card / Apple Pay (Stripe)</option>
                      <option value="Shopify Payments">Shopify Payments</option>
                      <option value="Instant Bank ACH">Instant Bank ACH Transfer</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedStoreProduct.name}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{selectedStoreProduct.description}</p>
                    </div>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${selectedStoreProduct.price.toFixed(2)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingCheckout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingCheckout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                    Pay ${selectedStoreProduct.price.toFixed(2)} & Receive Product Instantly
                  </button>
                </form>

                {/* Checkout Result Modal / Receipt */}
                {checkoutResult && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Payment Successful & Bank Deposited!
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">{checkoutResult.orderId}</span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      <p><strong>Product:</strong> {checkoutResult.productName}</p>
                      <p><strong>Amount Charged:</strong> ${checkoutResult.amount.toFixed(2)} USD</p>
                      <p><strong>Bank Payout:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${checkoutResult.payoutDetails.merchantNetDeposit.toFixed(2)}</span> deposited to your {checkoutResult.payoutDetails.destinationBank}</p>
                      <p><strong>Digital Fulfillment:</strong> <span className="font-mono text-indigo-600 dark:text-indigo-400">{checkoutResult.fulfillment.accessCode}</span> (Delivered instantly to {checkoutResult.customerEmail})</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Payout History Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Payout History & Bank Transfers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent automatic deposits sent to {bankInfo.bankName}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {payoutHistory.length} Transactions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-6">Transaction Date</th>
                      <th className="py-3 px-6">Product / Service</th>
                      <th className="py-3 px-6">Transaction ID</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {payoutHistory.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 text-xs">{txn.date}</td>
                        <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100">{txn.product}</td>
                        <td className="py-3.5 px-6 text-slate-400 dark:text-slate-500 text-xs font-mono">{txn.id}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-slate-100">${txn.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            txn.status === 'Deposited' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Deposited' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchased Products & Downloads Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    My Purchased Products & Downloads
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Access license certificates and download files for all your purchased AI tools & passes.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredPurchasedProducts.length} / {purchasedProducts.length} Items
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  placeholder="Search purchased items by product name, order ID, or license key..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {filteredPurchasedProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No purchased products match &quot;{productSearchQuery}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPurchasedProducts.map((prod) => (
                  <div key={prod.orderId} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{prod.orderId}</span>
                        <span className="text-[10px] text-slate-400">{prod.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{prod.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">License: {prod.accessCode}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        prod.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        {prod.status}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadProduct(prod)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          Download Product
                        </button>
                        <button
                          type="button"
                          onClick={() => exportLicenseCertificatePdf({
                            productName: prod.name,
                            orderId: prod.orderId,
                            licenseKey: prod.accessCode,
                            date: prod.date,
                            status: prod.status
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300 transition-colors cursor-pointer shadow-xs border border-indigo-200 dark:border-indigo-900"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-8 text-center text-xs text-slate-400 dark:text-slate-500">
        AI Describer Shopify Applet · Built with Next.js App Router, OpenAI & Shopify Billing API
      </footer>
    </div>
  );
}
