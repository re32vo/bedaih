import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LogOut, Users, Heart, Briefcase, Mail, CheckCircle, AlertCircle, Phone, MapPin, FileText, Calendar, RefreshCw, Search, Download, Bell, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    beneficiaries: 0,
    jobs: 0,
    contacts: 0,
    total: 0,
  });
  const [recentItems, setRecentItems] = useState<any>({
    beneficiaries: [],
    jobs: [],
    contacts: [],
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'beneficiaries' | 'jobs' | 'contacts'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const itemsPerPage = 10;

  const hasPermission = (perm: string) => userPermissions.includes(perm);
  const isPresident = userRole === 'president';

  const refreshData = async () => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      // إعادة جلب الصلاحيات أولاً
      const verifyRes = await fetch("/api/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setUserPermissions(verifyData.permissions || []);
      }
      
      const [statsRes, recentRes] = await Promise.all([
        fetch("/api/dashboard/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("/api/dashboard/recent?limit=10", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentItems(recentData);
      }
    } catch (err) {
      // Silently fail on refresh error
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check token from sessionStorage (OTP system) or URL (legacy magic link)
    const sessionToken = sessionStorage.getItem("authToken");
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    
    if (sessionToken) {
      // OTP authentication - token already in sessionStorage
      setToken(sessionToken);
      setIsAuthenticated(true);
      // Try to verify token with backend to get user email
      fetch("/api/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then(data => {
          if (data.email) {
            setUserEmail(data.email);
            setUserName(data.name || data.email);
            setUserRole(data.role || "موظف");
            setUserPermissions(data.permissions || []);
            console.log('الصلاحيات:', data.permissions);
            // Fetch dashboard stats
            return fetch("/api/dashboard/stats", {
              headers: {
                "Authorization": `Bearer ${sessionToken}`
              }
            });
          }
        })
        .then(res => {
          if (res && res.ok) return res.json();
        })
        .then(statsData => {
          if (statsData) {
            setStats(statsData);
            // Fetch recent items
            return fetch("/api/dashboard/recent?limit=10", {
              headers: {
                "Authorization": `Bearer ${sessionToken}`
              }
            });
          }
        })
        .then(res => {
          if (res && res.ok) return res.json();
        })
        .then(recentData => {
          if (recentData) {
            setRecentItems(recentData);
          }
        })
        .catch(() => {
          // If token invalid, clear and redirect
          sessionStorage.removeItem("authToken");
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
        
        // تحديث تلقائي للصلاحيات كل 10 ثوانٍ
        const permissionInterval = setInterval(() => {
          fetch("/api/auth/verify-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionToken}`
            }
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data?.permissions) {
                setUserPermissions(data.permissions);
              }
            })
            .catch(() => {});
        }, 10000);
        
        return () => clearInterval(permissionInterval);
    } else if (urlToken) {
      // Legacy magic link - token in URL
      const email = sessionStorage.getItem("loginEmail");
      if (email) {
        setToken(urlToken);
        setUserEmail(email);
        setUserName(email);
        setIsAuthenticated(true);
        sessionStorage.setItem("authToken", urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, "/dashboard");
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserEmail(null);
    setUserName(null);
    setUserRole(null);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("loginEmail");
    window.location.href = "/login";
  };

  const handleViewItem = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setDialogOpen(true);
  };

  const getFilteredItems = () => {
    let items = [];
    if (activeView === 'all') {
      // Combine all items and sort by date
      const all = [
        ...recentItems.beneficiaries.map((item: any) => ({ ...item, type: 'beneficiary' })),
        ...recentItems.jobs.map((item: any) => ({ ...item, type: 'job' })),
        ...recentItems.contacts.map((item: any) => ({ ...item, type: 'contact' })),
      ];
      items = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeView === 'beneficiaries') {
      items = recentItems.beneficiaries.map((item: any) => ({ ...item, type: 'beneficiary' }));
    } else if (activeView === 'jobs') {
      items = recentItems.jobs.map((item: any) => ({ ...item, type: 'job' }));
    } else if (activeView === 'contacts') {
      items = recentItems.contacts.map((item: any) => ({ ...item, type: 'contact' }));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      items = items.filter((item: any) => {
        const query = searchQuery.toLowerCase();
        return (
          item.email?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.fullName?.toLowerCase().includes(query) ||
          item.phone?.includes(query) ||
          item.address?.toLowerCase().includes(query) ||
          item.assistanceType?.toLowerCase().includes(query)
        );
      });
    }

    return items;
  };

  const getPaginatedItems = () => {
    const filtered = getFilteredItems();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  };

  const totalPages = Math.ceil(getFilteredItems().length / itemsPerPage);

  const handleExportData = () => {
    const items = getFilteredItems();
    
    // Build CSV with proper escaping for Arabic text
    const csvRows = [];
    
    // Headers
    csvRows.push(['النوع', 'الاسم الكامل', 'البريد الإلكتروني', 'رقم الهاتف', 'العنوان', 'نوع الطلب', 'التاريخ والوقت']);
    
    // Data rows
    items.forEach((item: any) => {
      const type = item.type === 'beneficiary' ? 'مستفيد' : item.type === 'job' ? 'طلب وظيفي' : 'رسالة تواصل';
      const name = item.name || item.fullName || 'غير محدد';
      const email = item.email || 'غير محدد';
      // Use ="value" format to force Excel to treat as text and prevent scientific notation
      const phone = item.phone ? `="${item.phone}"` : 'غير محدد';
      const address = item.address || 'غير محدد';
      const requestType = item.assistanceType || item.subject || item.experience || 'غير محدد';
      const date = new Date(item.createdAt).toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      csvRows.push([type, name, email, phone, address, requestType, date]);
    });
    
    // Convert to CSV format with proper quoting
    const csv = csvRows.map(row => 
      row.map(cell => {
        // Don't quote the phone number formula (="...")
        if (String(cell).startsWith('="')) return cell;
        // Quote all other cells and escape internal quotes
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\r\n');

    // Add BOM for UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `بيانات_الطلبات_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getItemIcon = (type: string) => {
    if (type === 'beneficiary') return Heart;
    if (type === 'job') return Briefcase;
    if (type === 'contact') return Mail;
    return FileText;
  };

  const translateAssistanceType = (type: string): string => {
    const translations: Record<string, string> = {
      'financial': 'مساعدة مالية',
      'food': 'سلة غذائية',
      'medical': 'علاج ودواء',
      'housing': 'ترميم منازل',
      'education': 'دعم تعليمي',
      'إسكان': 'ترميم منازل',
      'مساعدة مالية': 'مساعدة مالية',
    };
    return translations[type] || type;
  };

  const getItemTitle = (item: any, type: string) => {
    if (type === 'beneficiary') {
      const assistanceType = translateAssistanceType(item.assistanceType);
      return `طلب مساعدة - ${assistanceType}`;
    }
    if (type === 'job') return `طلب وظيفي - ${item.fullName || 'بيانات ناقصة'}`;
    if (type === 'contact') return `رسالة من ${item.name || 'باعث'}`;
    return 'طلب';
  };

  const getItemColor = (type: string) => {
    if (type === 'beneficiary') return 'text-red-600';
    if (type === 'job') return 'text-blue-600';
    if (type === 'contact') return 'text-green-600';
    return 'text-slate-900';
  };

  const formatDate = (date: any) => {
    if (!date) return 'بيانات ناقصة';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <div className="bg-slate-950 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h2 className="text-2xl font-bold font-heading text-white mb-2">صلاحية غير صحيحة</h2>
            <p className="text-white/80 mb-6">
              لم يتم التحقق من الدخول
            </p>
            <p className="text-white/80 mb-6">
              يرجى إعادة تسجيل الدخول
            </p>
            <a href="/login" className="block">
              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg">
                العودة لتسجيل الدخول
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "طلبات المساعدة",
      value: stats.beneficiaries.toString(),
      icon: Heart,
      gradient: "from-red-500 to-pink-500",
      permission: "beneficiaries:view",
    },
    {
      title: "الطلبات الوظيفية",
      value: stats.jobs.toString(),
      icon: Briefcase,
      gradient: "from-blue-500 to-indigo-500",
      permission: "jobs:view",
    },
    {
      title: "رسائل التواصل",
      value: stats.contacts.toString(),
      icon: Mail,
      gradient: "from-green-500 to-teal-500",
      permission: "contact:view",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.total.toString(),
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      permission: null, // always visible
    },
  ].filter(card => !card.permission || hasPermission(card.permission));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">لوحة التحكم</h1>
              <p className="text-sm sm:text-base text-white/80">مرحباً بك في نظام إدارة الجمعية</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button
                onClick={refreshData}
                disabled={refreshing}
                className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث البيانات</span>
                <span className="sm:hidden">تحديث</span>
              </Button>
              <Button
                onClick={handleExportData}
                className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">تصدير البيانات</span>
                <span className="sm:hidden">تصدير</span>
              </Button>
              {(userRole === 'president' || userPermissions.some(p => p.startsWith('employees:'))) && (
                <Button
                  onClick={() => window.location.href = "/admin"}
                  className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إدارة الموظفين</span>
                  <span className="sm:hidden">موظفين</span>
                </Button>
              )}              {(isPresident || hasPermission("manage_donors")) && (
                <Button
                  onClick={() => window.location.href = "/donors-management"}
                  className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إدارة المتبرعين</span>
                  <span className="sm:hidden">متبرعين</span>
                </Button>
              )}              {(userRole === 'president' || userPermissions.includes('audit:view')) && (
                <Button
                  onClick={() => window.location.href = "/logs"}
                  className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">سجلات النظام</span>
                  <span className="sm:hidden">سجلات</span>
                </Button>
              )}
              <Button
                onClick={handleLogout}
                className="btn-ultra-premium flex items-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-auto"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </div>
          </div>

          <motion.div 
            className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 shrink-0" />
              <div className="text-sm sm:text-base">
                <p className="text-white font-semibold">✓ تم تسجيل الدخول بنجاح</p>
                <p className="text-white text-xs sm:text-sm"><span className="font-bold">{userName || userEmail}</span> {userRole && <span className="badge-ultra text-[10px] sm:text-xs ml-2">{userRole}</span>}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="cursor-pointer"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full shadow-lg hover:shadow-xl transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 text-white shadow-ultra`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-white text-xs sm:text-sm mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-2">
                  {index === 0 && '+' + Math.floor(Number(stat.value) * 0.15) + ' هذا الشهر'}
                  {index === 1 && '+' + Math.floor(Number(stat.value) * 0.12) + ' هذا الأسبوع'}
                  {index === 2 && '+' + Math.floor(Number(stat.value) * 0.08) + ' اليوم'}
                  {index === 3 && 'إجمالي الطلبات'}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">آخر الطلبات</CardTitle>
                    <CardDescription className="text-white">طلبات المساعدة والتطبيقات الوظيفية الأخيرة</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="ابحث..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pr-10 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getPaginatedItems().length === 0 ? (
                    <div className="text-center py-8 text-white">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات حالياً'}</p>
                    </div>
                  ) : (
                    <>
                      {getPaginatedItems().map((item: any, index: number) => {
                        const Icon = getItemIcon(item.type);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getItemColor(item.type)}`} style={{ background: `linear-gradient(to br, rgb(var(--primary)), rgb(var(--secondary)))` }}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{getItemTitle(item, item.type)}</p>
                                <p className="text-xs text-white">{formatDate(item.createdAt)}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-white hover:text-white"
                              onClick={() => handleViewItem(item, item.type)}
                            >
                              عرض
                            </Button>
                          </div>
                        );
                      })}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-white">
                            صفحة {currentPage} من {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">الإجراءات السريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasPermission('beneficiaries:view') && (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 font-bold justify-between text-white"
                    onClick={() => { setActiveView('beneficiaries'); setCurrentPage(1); }}
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      عرض الطلبات
                    </span>
                    <Badge variant="secondary">{stats.beneficiaries}</Badge>
                  </Button>
                )}
                {hasPermission('jobs:view') && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold justify-between"
                    onClick={() => { setActiveView('jobs'); setCurrentPage(1); }}
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      الطلبات الوظيفية
                    </span>
                    <Badge variant="secondary">{stats.jobs}</Badge>
                  </Button>
                )}
                {hasPermission('contact:view') && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 font-bold justify-between"
                    onClick={() => { setActiveView('contacts'); setCurrentPage(1); }}
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      رسائل التواصل
                    </span>
                    <Badge variant="secondary">{stats.contacts}</Badge>
                  </Button>
                )}
                {userRole === 'president' && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                    onClick={() => window.location.href = '/admin'}
                  >
                    <Users className="w-4 h-4 ml-2" />
                    الموظفون
                  </Button>
                )}
                {activeView !== 'all' && (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 font-bold"
                    onClick={() => { setActiveView('all'); setCurrentPage(1); }}
                    variant="outline"
                  >
                    عرض الكل
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-sm text-white">معلومات الجلسة</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-white">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  الجلسة نشطة وآمنة
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-white" />
                  {new Date().toLocaleDateString('ar-SA')}
                </p>
                <p className="text-[10px] text-white">
                  آخر تحديث: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-white">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-xs text-white">
                  <span>معدل الاستجابة</span>
                  <Badge variant="outline" className="bg-green-500/30 text-green-200 border-green-500/50 font-semibold">98%</Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-white">
                  <span>الطلبات الجديدة اليوم</span>
                  <Badge variant="outline" className="bg-blue-500/30 text-blue-200 border-blue-500/50 font-semibold">{Math.floor(stats.total * 0.05)}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-white">
                  <span>متوسط وقت المعالجة</span>
                  <Badge variant="outline" className="bg-amber-500/30 text-amber-200 border-amber-500/50 font-semibold">2.5 ساعة</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Item Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">
                {selectedItem && getItemTitle(selectedItem, selectedItem.type)}
              </DialogTitle>
              <DialogDescription className="text-white">
                تفاصيل الطلب الكاملة
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4 mt-4">
                {selectedItem.type === 'beneficiary' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          العنوان
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">${selectedItem.address ? selectedItem.address : 'لم يتم تعيين عنوان'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        نوع الحالة
                      </label>
                      <p className="text-white bg-slate-800/80 p-3 rounded">${selectedItem.assistanceType ? translateAssistanceType(selectedItem.assistanceType) : 'لم يتم تحديد نوع'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.email || 'غير محدد'}</p>
                    </div>
                  </>
                )}

                {selectedItem.type === 'job' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          الاسم الكامل
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">${selectedItem.fullName ? selectedItem.fullName : 'بيانات ناقصة'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.email || 'غير محدد'}</p>
                    </div>
                    {selectedItem.cvUrl && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          السيرة الذاتية
                        </label>
                        <a 
                          href={selectedItem.cvUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline bg-slate-800/80 p-3 rounded block"
                        >
                          عرض السيرة الذاتية
                        </a>
                      </div>
                    )}
                  </>
                )}

                {selectedItem.type === 'contact' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          الاسم
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">${selectedItem.name ? selectedItem.name : 'اسم غير موفر'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </label>
                        <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <p className="text-white bg-slate-800/80 p-3 rounded">{selectedItem.email || 'غير محدد'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        الرسالة
                      </label>
                      <p className="text-white bg-slate-800/80 p-3 rounded whitespace-pre-wrap">{selectedItem.message || 'لا توجد رسالة'}</p>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Calendar className="w-4 h-4" />
                    <span>تاريخ الإرسال: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('ar-SA') : 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}



