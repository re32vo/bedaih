import { useState, useEffect, useRef } from "react";
import { Heart, Smartphone, Landmark, CreditCard, Copy, Check, Zap, Users, Target, Award, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const donationMethods = [
  {
    id: 1,
    title: "التحويل البنكي",
    description: "حول الأموال مباشرة إلى حساب الجمعية",
    emoji: "🏦",
    icon: Landmark,
    details: {
      bank: "بنك الإنماء",
      accountName: "جمعية بداية الخيرية",
      accountNumber: "68206457616000",
      iban: "SA7705000068206457616000",
    }
  },
  {
    id: 2,
    title: "بطاقة الائتمان",
    description: "ادفع بأمان باستخدام بطاقتك",
    emoji: "💳",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Apple Pay",
    description: "ادفع بسهولة عبر Apple Pay",
    emoji: "🍎",
    icon: Smartphone,
  },
];



export default function Donate() {
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [donorEmail, setDonorEmail] = useState('');
  const paymentDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('donorToken');
    if (token) {
      fetch('/api/donors/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsLoggedIn(true);
          setDonorEmail(data.email);
        }
      })
      .catch(() => setIsLoggedIn(false));
    }
  }, []);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleProceedToPayment = () => {
    if (!finalAmount || finalAmount <= 0) {
      alert('الرجاء اختيار مبلغ صحيح');
      return;
    }
    setShowPaymentMethods(true);
    setTimeout(() => {
      paymentDetailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCompletePayment = async () => {
    if (!selectedMethod) return;

    const method = donationMethods.find(m => m.id === selectedMethod);
    const donationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      if (isLoggedIn && donorEmail) {
        await fetch('/api/donors/donation', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('donorToken')}`
          },
          body: JSON.stringify({
            email: donorEmail,
            amount: finalAmount,
            method: method?.title || 'غير محدد',
            code: donationCode
          })
        });
        
        setLocation('/thank-you?registered=true');
      } else {
        await fetch('/api/donors/donation', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'guest@donation.local',
            amount: finalAmount,
            method: method?.title || 'غير محدد',
            code: donationCode
          })
        });

        setLocation('/thank-you');
      }
    } catch (error) {
      console.error('خطأ في تسجيل التبرع:', error);
      alert('حدث خطأ في تسجيل التبرع');
    }
  };

  const selectedMethodObj = donationMethods.find(m => m.id === selectedMethod);
  const quickAmounts = [10, 20, 30, 50, 100, 500, 1000, 2000];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-[400px] sm:min-h-[480px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            <source media="(max-width: 640px)" srcSet="/1.jpg" sizes="100vw" />
            <source media="(max-width: 1024px)" srcSet="/2.jpg" sizes="100vw" />
            <source media="(min-width: 1025px)" srcSet="/3.jpg" sizes="100vw" />
            <img
              src="/3.jpg"
              alt="طفل يحلم بمستقبل أفضل"
              className="w-full h-full object-cover object-center opacity-30"
              loading="eager"
              sizes="100vw"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/50" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-900" />
        </div>

        <div className="px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-4 sm:space-y-6 md:space-y-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">تبرع وغير الحياة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight space-y-2">
              <div style={{ lineHeight: '1.3' }} className="text-white">كل ريال</div>
              <span style={{ 
                display: 'block', 
                marginTop: '1rem', 
                fontWeight: '900',
                lineHeight: '1.2'
              }} className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">يحمل أملاً</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              تبرعك ليس مجرد رقم، بل حياة جديدة تبدأ، أسرة تستقر، وطفل يحلم بمستقبل أفضل
            </p>
          </motion.div>
        </div>
      </section>

      {/* Amount Selection */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-12"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">اختر مبلغ التبرع</h2>
              <p className="text-slate-300">ادخل المبلغ الذي تود التبرع به</p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setCustomAmount(amount.toString());
                    setSelectedAmount(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all font-bold ${
                    customAmount === amount.toString()
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 text-white'
                  }`}
                >
                  ر.س {amount}
                </motion.button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto w-full"
            >
              <label className="block text-sm font-bold text-slate-200 mb-3">أو ادخل مبلغاً آخر</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="مثال: 100"
                className="w-full px-4 py-3 border-2 border-slate-700 bg-slate-900 text-white rounded-lg focus:outline-none focus:border-emerald-500 text-lg"
                min="1"
              />
            </motion.div>

            {/* Proceed Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button
                onClick={handleProceedToPayment}
                disabled={!finalAmount || finalAmount <= 0}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <Heart className="w-5 h-5 ml-2" />
                متابعة التبرع
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Payment Methods Section */}
      {showPaymentMethods && (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-slate-900" ref={paymentDetailsRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">اختر طريقة الدفع</h2>
              <p className="text-slate-300">تبرع: <span className="font-bold text-emerald-400">ر.س {finalAmount}</span></p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {donationMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-center ${
                    selectedMethod === method.id
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/50'
                  }`}
                >
                  {method.id === 3 ? (
                    <div className="h-14 flex items-center justify-center mb-3">
                      <img 
                        src="/ap.jpg" 
                        alt="Apple Pay" 
                        className="h-14 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-14 flex items-center justify-center mb-3 text-5xl">
                      {method.emoji}
                    </div>
                  )}
                  <h3 className="font-bold text-white mb-1">{method.title}</h3>
                  <p className="text-xs text-slate-400">{method.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Payment Method Details */}
            {selectedMethodObj && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 rounded-lg p-6 md:p-8 max-w-2xl mx-auto border-2 border-emerald-500/30"
              >
                {selectedMethodObj.id === 1 && selectedMethodObj.details && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-slate-700">
                      <h4 className="font-bold text-white text-lg">بيانات التحويل البنكي</h4>
                      <img 
                        src="/Alinma-Bank-Symbol.png" 
                        alt="بنك الإنماء" 
                        className="h-10 object-contain"
                      />
                    </div>
                    {[
                      { label: 'البنك', value: selectedMethodObj.details.bank, id: 0 },
                      { label: 'اسم الحساب', value: selectedMethodObj.details.accountName, id: 1 },
                      { label: 'رقم الحساب', value: selectedMethodObj.details.accountNumber, id: 2 },
                      { label: 'الآيبان', value: selectedMethodObj.details.iban, id: 3 }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                          <p className="font-bold text-white">{item.value}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.value, item.id)}
                          className="p-2 hover:bg-slate-700 rounded transition-colors"
                        >
                          {copied === item.id ? (
                            <Check className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMethodObj.id === 2 && (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">💳</div>
                    <p className="text-slate-300 text-lg">سيتم تحويلك لبوابة الدفع الآمنة لإتمام العملية</p>
                  </div>
                )}
                {selectedMethodObj.id === 3 && (
                  <div className="text-center py-8">
                    <img 
                      src="/ap.jpg" 
                      alt="Apple Pay" 
                      className="h-16 mx-auto mb-4 object-contain"
                    />
                    <p className="text-slate-300 text-lg">ادفع بسهولة وأمان عبر Apple Pay</p>
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex gap-3 max-w-md mx-auto">
              <Button
                onClick={() => {
                  setShowPaymentMethods(false);
                  setSelectedMethod(null);
                }}
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCompletePayment}
                disabled={!selectedMethod}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                <Heart className="w-4 h-4 ml-2" />
                تأكيد التبرع
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">أسئلة شائعة</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "هل تبرعي آمن وموثوق؟",
                a: "نعم بكل تأكيد. جمعية بداية منظمة رسمية معتمدة وجميع التبرعات تُستخدم وفقاً للقوانين والتشريعات."
              },
              {
                q: "كيف يمكنني معرفة كيفية استخدام تبرعي؟",
                a: "نوفر تقارير شفافة دورية توضح كيفية استخدام التبرعات ونتائج برامجنا الخيرية."
              },
              {
                q: "هل يمكنني التبرع بشكل دوري؟",
                a: "نعم، يمكنك التبرع بشكل شهري أو سنوي. يمكنك التواصل معنا للتفاصيل."
              },
              {
                q: "ماذا لو كان لدي استفسار عن تبرعي؟",
                a: "يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف وسنرد على جميع استفساراتك."
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-white mb-3">{item.q}</h3>
                <p className="text-slate-300 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

