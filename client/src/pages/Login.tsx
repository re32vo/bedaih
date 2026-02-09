import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader, Home } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/direct-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل تسجيل الدخول");
      }

      const data = await res.json();
      sessionStorage.setItem("authToken", data.token);
      
      toast({
        title: "تم التحقق بنجاح",
        description: "جاري التوجيه للوحة التحكم...",
      });

      setTimeout(() => setLocation("/dashboard"), 500);
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-slate-900 text-white">
          <CardHeader className="text-center bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg p-6 sm:p-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-white/20 rounded-full p-2 sm:p-3">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <CardTitle className="text-3xl">دخول الموظفين</CardTitle>
            <CardDescription className="text-white mt-2">
              تسجيل دخول مؤقت للاختبار
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleLogin} className="space-y-6">
                <Alert className="bg-slate-800 border-slate-700" style={{ background: `rgba(15, 23, 42, 1)`, borderColor: `rgba(51, 65, 85, 1)` }}>
                  <Mail className="h-4 w-4 text-white" style={{ color: `white` }} />
                  <AlertDescription className="text-sm text-white" style={{ color: `white` }}>
                    تم تعطيل الدخول المؤقت حالياً. أدخل بريدك لتسجيل الدخول مباشرة.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-semibold">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@charity.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-right border-2 border-slate-200 focus:border-primary h-12"
                    dir="ltr"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-bold text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      تسجيل الدخول
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white hover:bg-slate-800"
                  onClick={() => setLocation("/")}
                >
                  <Home className="w-4 h-4 ml-2" />
                  العودة للموقع
                </Button>
              </form>
            </motion.div>

            <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-white">
              <p className="text-white">هل واجهت مشكلة؟</p>
              <a href="mailto:admin@charity.com" className="text-emerald-400 hover:underline font-semibold">
                تواصل مع المسؤول
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-slate-900 backdrop-blur rounded-lg p-4 text-center text-sm text-white border border-slate-800"
        >
          <p className="text-white">هذه الصفحة مخصصة للموظفين فقط</p>
          <p className="text-white mt-1">لا تشارك بيانات الدخول مع أحد</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
