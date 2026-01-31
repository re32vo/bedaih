import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Heart, Users, Globe, BookOpen, Target, HandHeart, Handshake, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Animation Variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function StatCounter() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const stats = [
    { icon: Users, label: "مستفيد", value: 15000, color: "from-blue-500 to-cyan-500" },
    { icon: Target, label: "مبادرة خيرية", value: 120, color: "from-purple-500 to-pink-500" },
    { icon: HandHeart, label: "ساعة تطوع", value: 8500, color: "from-indigo-500 to-blue-500" },
    { icon: Globe, label: "منطقة نخدمها", value: 25, color: "from-cyan-500 to-teal-500" },
  ];

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-slate-300 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-8 lg:p-12"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className="text-center space-y-2 sm:space-y-3"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 sm:mb-4 shadow-lg`}>
            <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
            {inView ? <CountUp end={stat.value} duration={2} separator="," /> : "0"}+
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[600px] md:h-[750px] lg:h-[900px] flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with responsive sources and soft overlay */}
        <div className="absolute inset-0">
          <picture>
            <source media="(max-width: 640px)" srcSet="/hero-therapy-mobile.jpg" />
            <source media="(max-width: 1024px)" srcSet="/hero-therapy-tablet.jpg" />
            <source media="(min-width: 1025px)" srcSet="/hero-therapy-desktop.jpg" />
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=90"
              alt="جلسة علاج نفسي بين طبيب ومريض"
              className="w-full h-full object-cover object-center opacity-20"
              loading="eager"
              sizes="100vw"
            />
          </picture>
          <div className="absolute inset-0 bg-white/80" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-white/80" />
          <div className="absolute inset-0 bg-white/40" />
        </div>

        {/* Content */}
        <div className="hero-content px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-6 py-3 rounded-full border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">معاً نحن أقوى ✨</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-slate-900">مد يد العون</span><br/>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">لتزهر الحياة</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
            >
              في جمعية بداية، نؤمن بأن العطاء هو جسر الأمل. نكرس جهودنا لدعم المحتاجين وبناء مجتمع متكافل تسوده الرحمة والكرامة.
            </motion.p>

            {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full"
              >
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-emerald-500/50"
                >
                  <ArrowRight className="w-5 h-5" />
                  تعرف علينا
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-800 text-white border-2 border-emerald-500/50 shadow-md flex items-center justify-center gap-2 font-semibold hover:bg-slate-700"
              >
                <Heart className="w-5 h-5" />
                تبرع الآن
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 md:py-24 mt-6 sm:-mt-10 md:-mt-24 relative z-20 container px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StatCounter />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-24 bg-slate-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div variants={fadeIn} className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                  رسالتنا: <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">الإنسان أولاً</span>
                </h2>
                <div className="w-24 h-1 bg-emerald-500 rounded-full" />
              </motion.div>
              
              <motion.p variants={fadeIn} className="text-base sm:text-lg text-slate-700 leading-relaxed">
                تأسست جمعية بداية برؤية واضحة تهدف إلى تمكين الفئات الأقل حظاً في المجتمع. نحن لا نقدم المساعدات فحسب، بل نبني جسوراً من الأمل والفرص المستدامة.
              </motion.p>
              
              <motion.ul variants={fadeIn} className="space-y-4">
                {[
                  "دعم الأسر المتعففة وتوفير الاحتياجات الأساسية.",
                  "برامج تعليمية وتدريبية لتأهيل الشباب لسوق العمل.",
                  "مبادرات صحية توفر الرعاية الطبية للمحتاجين.",
                  "كفالة الأيتام ورعايتهم اجتماعياً ونفسياً."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div variants={fadeIn}>
                <Link href="/about">
                  <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                    اقرأ المزيد عنا
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl" />
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop" 
                alt="Charity Projects" 
                className="relative rounded-2xl shadow-2xl border-2 border-emerald-500/30 w-full h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-cover"
              />
              <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-2xl max-w-xs hidden md:block p-6 border-l-4 border-emerald-500">
                <p className="font-bold text-lg text-slate-900 mb-2">"من أحياها فكأنما أحيا الناس جميعاً"</p>
                <div className="flex gap-1 text-yellow-400">
                  {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 md:mb-6">ركائز طموحنا</h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-2xl mx-auto">نعمل وفق استراتيجية متكاملة تضمن تحقيق أثر مستدام في المجتمع</p>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {[
            { icon: Users, title: "الدعم المجتمعي", desc: "تعزيز التكافل الاجتماعي وتلبية احتياجات الأسر.", gradient: "from-blue-500 to-cyan-500" },
            { icon: BookOpen, title: "التمكين", desc: "تحويل المستفيدين إلى أعضاء فاعلين ومنتجين.", gradient: "from-purple-500 to-pink-500" },
            { icon: Handshake, title: "الشراكات", desc: "التعاون مع القطاعين العام والخاص لتحقيق الأهداف.", gradient: "from-indigo-500 to-blue-500" },
            { icon: Monitor, title: "الحلول الرقمية", desc: "تسخير التقنية لتسهيل وصول الخدمات للمستحقين.", gradient: "from-cyan-500 to-teal-500" },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-300 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-700 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 md:mb-4">🌟 مشاريعنا الخيرية</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full mb-4" />
            <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-2xl mx-auto">مبادرات متنوعة نعمل بها لتحسين حياة المحتاجين والمهمشين</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[
              { icon: "❤️", title: "دعم صحي", desc: "توفير الرعاية الطبية والأدوية للمحتاجين بدون مقابل", gradient: "from-red-500 to-pink-500" },
              { icon: "📚", title: "تمكين تعليمي", desc: "برامج تعليمية وتدريبية لتأهيل الشباب للعمل", gradient: "from-blue-500 to-indigo-500" },
              { icon: "🏠", title: "دعم سكني", desc: "مساعدة الأسر المتعثرة بالحصول على مأوى آمن", gradient: "from-green-500 to-teal-500" },
            ].map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-300 rounded-2xl p-8 hover:border-emerald-500/50 transition-all"
              >
                <div className="text-5xl mb-4">{project.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{project.title}</h3>
                <p className="text-slate-700 leading-relaxed">{project.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section id="donate-section" className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 md:mb-6 lg:mb-8">تبرعك يصنع مستقبلاً</h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            مساهمتك البسيطة قد تكون سبباً في تغيير حياة أسرة كاملة. كن جزءاً من الخير.
          </p>
          <button 
            className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-bold shadow-xl hover:shadow-2xl hover:bg-emerald-50 transition-all" 
            onClick={() => window.location.href = '/donate'}
          >
            تبرع الآن
          </button>
        </div>
      </section>
    </div>
  );
}
