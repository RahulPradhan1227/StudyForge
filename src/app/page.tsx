"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, FileText, Copy, Download, Printer, BookOpen, Zap, BrainCircuit, 
  CheckCircle2, XCircle, Beaker, Loader2, Sparkles, ArrowRight, ShieldCheck, 
  Target, Brain, Clock, LayoutList, CheckCircle, Circle, FileBox, 
  ChevronRight, RefreshCcw, Sparkle, LayoutDashboard, Search, Settings, 
  TrendingUp, MessageSquare, PanelLeft, Plus, X, Flame, Maximize, Play, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Preserve API/Generation State Constants
const LOADING_STEPS = [
  "Reading lecture material",
  "Extracting key concepts",
  "Identifying exam topics",
  "Structuring revision notes",
  "Preparing practice questions"
];

const DEMO_DATA = {
  notes: `## Topic Overview\nFirst-order differential equations are fundamental mathematical tools used to model systems undergoing change. In this lecture, we explored their primary applications in physics, biology, and economics, focusing specifically on exponential growth/decay, Newton's Law of Cooling, and mixing problems.\n\n## Key Concepts\n- **Exponential Growth and Decay:** Models where the rate of change of a quantity is proportional to the quantity itself (e.g., population growth, radioactive decay).\n- **Newton's Law of Cooling:** The rate of heat loss of a body is proportional to the difference in temperatures between the body and its surroundings.\n- **Mixing Problems:** Systems where a substance is dissolved in a fluid, entering and exiting a tank at specific rates, requiring an equation balancing the inflow and outflow rates.\n\n## Important Definitions\n- **Differential Equation:** An equation involving an unknown function and its derivatives.\n- **First-Order:** The highest derivative present in the equation is the first derivative (dy/dx).\n- **Initial Value Problem (IVP):** A differential equation accompanied by an initial condition (e.g., y(0) = y_0) that allows for a specific solution rather than a general family of solutions.\n- **Time Constant:** In exponential decay, the time required for the quantity to reduce to 1/e of its initial value.\n\n## Exam-Focused Points\n- Always clearly define your variables and units before setting up the differential equation.\n- For mixing problems, remember the core principle: **Rate of Change = (Rate In) - (Rate Out)**.\n- Be prepared to solve the resulting separable or linear first-order differential equation using integrating factors.\n- In Newton's Law of Cooling, the ambient temperature $T_m$ is typically constant, but the initial condition is necessary to find the proportionality constant $k$.\n\n## Concept Relationships\n- Both Radioactive Decay and Newton's Law of Cooling are fundamentally driven by the same mathematical relationship: $dy/dt = k(y - C)$. The difference lies only in the physical interpretation of the constants and variables.\n- Mixing problems often result in linear first-order equations of the form $dy/dt + P(t)y = Q(t)$, which generalizes the simpler exponential models.\n\n## Likely Exam Questions\n1. A tank initially contains 100 liters of pure water. Brine containing 0.2 kg of salt per liter enters at 5 L/min. The well-mixed solution leaves at 5 L/min. Find the amount of salt in the tank after 20 minutes.\n2. A radioactive isotope has a half-life of 1590 years. If you start with 100 grams, how much remains after 1000 years?\n3. A cup of coffee at 90°C is placed in a room at 20°C. After 10 minutes, the coffee cools to 70°C. What will its temperature be after 20 minutes?\n`,
  quickRevision: `## 🔥 MUST REMEMBER\n- **Growth/Decay:** $dP/dt = kP$\n- **Newton's Cooling:** $dT/dt = k(T - T_m)$\n- **Mixing:** $dx/dt = (\\text{Rate In}) - (\\text{Rate Out})$\n\n## 🧮 FORMULAS\n- **Solution to $y' = ky$:** $y(t) = y_0 e^{kt}$\n- **Half-life:** $t_{1/2} = \\ln(2)/k$\n- **Rate In (Mixing):** $(\\text{concentration in}) \\times (\\text{flow rate in})$\n- **Rate Out (Mixing):** $(x(t)/\\text{Volume}) \\times (\\text{flow rate out})$\n\n## 🎯 EXAM FOCUS\n- Memorize the Integrating Factor method: $\\mu(t) = e^{\\int P(t) dt}$\n- Setting up the correct initial condition (IVP) is worth 50% of the points on modeling questions.\n\n## ⚠️ COMMON MISTAKES\n- Forgetting a negative sign for the constant $k$ in decay and cooling problems.\n- Using the wrong volume in the "Rate Out" term for mixing problems if the inflow and outflow rates are different (volume is not constant!).\n`,
  quiz: [
    { question: "Which of the following equations represents Newton's Law of Cooling?", options: [ "dT/dt = k(T + Tm)", "dT/dt = k(T - Tm)", "dT/dt = kT", "dT/dt = k / (T - Tm)" ], correctAnswerIndex: 1, explanation: "Newton's Law of Cooling states the rate of change of temperature is proportional to the difference between the object's temperature (T) and the ambient temperature (Tm)." },
    { question: "In a mixing problem, what is the fundamental principle used to set up the differential equation?", options: [ "Rate of Change = (Rate In) + (Rate Out)", "Rate of Change = (Rate Out) - (Rate In)", "Rate of Change = (Rate In) - (Rate Out)", "Rate of Change = (Rate In) * (Rate Out)" ], correctAnswerIndex: 2, explanation: "The net rate of change of a substance in a tank is exactly the rate at which it enters minus the rate at which it leaves." },
    { question: "If a population grows according to the model dP/dt = kP, what is the general form of the solution?", options: [ "P(t) = P_0 + kt", "P(t) = P_0 * e^(kt)", "P(t) = k * e^(P_0 t)", "P(t) = ln(P_0 * kt)" ], correctAnswerIndex: 1, explanation: "This is a separable differential equation. Integrating both sides yields the exponential growth formula P(t) = P_0 * e^(kt)." },
    { question: "What is the defining characteristic of a 'First-Order' differential equation?", options: [ "It only contains terms raised to the power of 1.", "It only involves one variable.", "The highest derivative present is the first derivative.", "It can only be solved using one specific method." ], correctAnswerIndex: 2, explanation: "The 'order' of a differential equation is determined by the highest derivative it contains. First-order means it contains dy/dx but no higher derivatives like d^2y/dx^2." },
    { question: "In a mixing problem where fluid enters at 4 L/min and leaves at 4 L/min, what happens to the total volume in the tank?", options: [ "It increases linearly.", "It decreases linearly.", "It remains constant.", "It grows exponentially." ], correctAnswerIndex: 2, explanation: "Since the inflow rate equals the outflow rate, the net change in volume is zero, so the total volume remains constant." }
  ]
};

type ViewState = "dashboard" | "workspace" | "notes" | "quick-revision" | "quiz" | "flashcards" | "progress" | "settings";

export default function Home() {
  // Application UI State
  const [activeView, setActiveView] = useState<ViewState>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  
  // Generation State
  const [subject, setSubject] = useState("");
  const [examGoal, setExamGoal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "results">("idle");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Results State
  const [notes, setNotes] = useState("");
  const [quickRevisionNotes, setQuickRevisionNotes] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [insights, setInsights] = useState<{wordCount: number; readTime: number; conceptCount: number; fileSize: string; formulaDensity: number} | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Copilot Mock State
  const [chatMessages, setChatMessages] = useState<{role: "user" | "ai", text: string}[]>([
    { role: "ai", text: "Hi! I'm your Study Copilot. Upload a lecture, and I can answer specific questions about it, or generate flashcards." }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "processing") {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0].errors[0];
      toast.error("Invalid file", { description: error.message });
    },
  });

  const calculateInsights = (markdown: string, uploadedFile: File | null) => {
    const words = markdown.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const concepts = (markdown.match(/^[*-]\s/gm) || []).length;
    const formulas = (markdown.match(/\$/g) || []).length / 2;
    const fileSize = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + " MB" : "1.2 MB";
    setInsights({ wordCount: words, readTime, conceptCount: concepts, fileSize, formulaDensity: formulas });
  };

  const handleGenerate = async () => {
    if (!file && !isDemoMode) {
      toast.error("Missing File", { description: "Please upload a PDF lecture." });
      return;
    }

    setStatus("processing");
    setActiveView("workspace");
    
    if (isDemoMode) {
      setTimeout(() => {
        setNotes(DEMO_DATA.notes);
        setQuickRevisionNotes(DEMO_DATA.quickRevision);
        setQuizData(DEMO_DATA.quiz);
        calculateInsights(DEMO_DATA.notes, null);
        setStatus("results");
        setActiveView("notes");
      }, 7500);
      return;
    }

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (subject) formData.append("subject", subject);
      if (examGoal) formData.append("examGoal", examGoal);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to generate notes");
        } else {
          const errorText = await res.text();
          if (res.status === 413 || errorText.includes("Request Entity Too Large")) {
            throw new Error("File is too large. Vercel free tier limits uploads to 4.5MB.");
          }
          throw new Error(`Server Error (${res.status}): ${errorText.substring(0, 50)}...`);
        }
      }

      const data = await res.json();
      setNotes(data.notes);
      setQuickRevisionNotes(data.quickRevision);
      setQuizData(data.quiz);
      calculateInsights(data.notes, file);
      setStatus("results");
      setActiveView("notes");
    } catch (error: any) {
      setStatus("idle");
      setActiveView("dashboard");
      toast.error("Error", { description: error.message || "An unexpected error occurred." });
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text: chatInput }]);
    const currentInput = chatInput;
    setChatInput("");
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "ai", text: `I am currently operating as a mock UI for your presentation, but in a real scenario, I would look through the uploaded PDF to answer: "${currentInput}".` }]);
    }, 1000);
  };

  const SidebarItem = ({ icon: Icon, label, id, isLocked = false }: { icon: any, label: string, id: ViewState | "divider", isLocked?: boolean }) => {
    if (id === "divider") return <div className="h-px bg-white/5 my-2 mx-4" />;
    const isActive = activeView === id;
    
    return (
      <button 
        onClick={() => !isLocked && setActiveView(id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium
          ${isActive ? "bg-white/[0.08] text-white shadow-sm" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}
          ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Icon className={`w-[18px] h-[18px] ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
        {label}
        {isLocked && <div className="ml-auto text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-slate-500">MOCK</div>}
      </button>
    );
  };

  // Exam Mode Wrapper
  if (isExamMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-black text-white p-8 flex flex-col selection:bg-indigo-500/30">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-bold tracking-widest uppercase text-slate-300 text-sm">Exam Mode Active</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="font-mono text-2xl font-bold tracking-tight text-white/90">00:45:00</div>
            <Button variant="ghost" onClick={() => setIsExamMode(false)} className="text-slate-400 hover:text-white rounded-xl border border-white/10 hover:bg-white/5">
              Exit Mode <X className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </header>
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {activeView === "quiz" ? (
             <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex-1">
               <h2 className="text-2xl font-bold mb-8">Practice Quiz (Mock)</h2>
               <p className="text-slate-400">Your generated quiz will appear here in a distraction-free environment.</p>
             </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex-1 prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-8">High Priority Revision</h2>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{quickRevisionNotes || "No quick revision data loaded."}</ReactMarkdown>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050712] text-slate-200 font-sans flex overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik00MCAwSDBWNDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMEwwIDQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8cGF0aCBkPSJNMCA0MEw0MCA0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />
      </div>

      {/* Persistent Left Sidebar (Desktop) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-3xl shrink-0 z-20 h-screen"
          >
            <div className="h-16 px-6 flex items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="font-bold text-sm tracking-wide text-white/90">StudyForge</span>
              </div>
            </div>
            
            <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <SidebarItem icon={LayoutDashboard} label="Overview" id="dashboard" />
              <SidebarItem icon={PanelLeft} label="Workspace" id="workspace" />
              <SidebarItem id="divider" icon={LayoutDashboard} label="" />
              
              <div className="px-4 py-2 mt-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Study Materials</p>
              </div>
              
              <SidebarItem icon={BookOpen} label="Revision Notes" id="notes" />
              <SidebarItem icon={Zap} label="Quick Revision" id="quick-revision" />
              <SidebarItem icon={BrainCircuit} label="Practice Quiz" id="quiz" />
              <SidebarItem icon={FileBox} label="Flashcards" id="flashcards" isLocked />
              
              <SidebarItem id="divider" icon={LayoutDashboard} label="" />
              <div className="px-4 py-2 mt-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Analytics</p>
              </div>
              <SidebarItem icon={TrendingUp} label="Progress" id="progress" isLocked />
              <SidebarItem icon={Settings} label="Settings" id="settings" isLocked />
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">ST</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Student User</p>
                  <p className="text-[10px] text-slate-500">Free Tier</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <PanelLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold capitalize text-white/90 hidden sm:block">
              {activeView.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white/60 hover:text-white/90 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10">
              <input 
                type="checkbox" 
                checked={isDemoMode} 
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-500 bg-black/50 border-white/20 focus:ring-0 focus:ring-offset-0"
              />
              Demo Mode
            </label>
            {(status === "results" && activeView !== "dashboard") && (
              <Button size="sm" onClick={() => setIsExamMode(true)} className="bg-white text-black hover:bg-slate-200 h-8 px-4 rounded-md text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ENTER EXAM MODE
              </Button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* VIEW: DASHBOARD */}
            {activeView === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto w-full space-y-8 pb-20">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-white tracking-tight">Good evening 👋</h2>
                  <p className="text-slate-400">Ready to turn your lectures into exam-ready knowledge?</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 w-fit">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">StudyForge AI is ready</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Notes Generated", val: "12", icon: FileText, color: "text-blue-400" },
                    { label: "Revision Progress", val: "84%", icon: Target, color: "text-emerald-400" },
                    { label: "Quiz Accuracy", val: "92%", icon: CheckCircle2, color: "text-indigo-400" },
                    { label: "Study Streak", val: "4 days", icon: Flame, color: "text-orange-400" }
                  ].map((stat, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
                      <stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
                      <div className="text-2xl font-semibold text-white mb-1">{stat.val}</div>
                      <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Main AI Copilot Input */}
                <div className="mt-12 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-1 flex flex-col shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="p-6 md:p-8 relative z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold tracking-wide">✦ AI Study Copilot</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Subject</label>
                        <Input placeholder="e.g. Computer Networks" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-black/40 border-white/10 h-12 rounded-xl focus-visible:ring-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Exam Goal</label>
                        <Input placeholder="e.g. Midterm Prep" value={examGoal} onChange={(e) => setExamGoal(e.target.value)} className="bg-black/40 border-white/10 h-12 rounded-xl focus-visible:ring-indigo-500/50" />
                      </div>
                    </div>

                    <div {...getRootProps()} className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"} ${isDemoMode ? "opacity-60" : ""}`}>
                      <input {...getInputProps()} disabled={isDemoMode} />
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-300">Drag & drop your lecture PDF</p>
                      <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">MAX 4MB</p>
                      
                      {(file && !isDemoMode) && (
                        <div className="mt-4 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl inline-flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm text-indigo-100 font-medium">{file.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 hover:bg-white/10 rounded-md"><X className="w-4 h-4 text-slate-400" /></button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button onClick={handleGenerate} disabled={!file && !isDemoMode} className="h-12 px-8 rounded-xl bg-white text-black font-semibold hover:bg-slate-200">
                        {isDemoMode ? "Generate Demo Pack" : "Analyze Lecture →"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: WORKSPACE (Processing / Results Entry) */}
            {activeView === "workspace" && (
              <motion.div key="workspace" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto w-full space-y-8">
                
                {status === "processing" ? (
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 border-2 border-t-indigo-400 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><Brain className="w-6 h-6 text-indigo-300" /></div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-6">AI is analyzing your document...</h3>
                    <div className="w-full max-w-sm space-y-3 text-left">
                      {LOADING_STEPS.map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-3 text-sm transition-all duration-500 ${idx < loadingStepIndex ? "text-emerald-400" : idx === loadingStepIndex ? "text-white" : "text-slate-600"}`}>
                          {idx < loadingStepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx === loadingStepIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <Circle className="w-4 h-4" />}
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : status === "results" ? (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-start justify-between bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                          <FileText className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">{isDemoMode ? "Differential Equations Lecture" : (file?.name || "Lecture Document")}</h2>
                          <p className="text-sm text-slate-400 flex items-center gap-2">
                            <span>PDF Document</span> • <span>{insights?.fileSize}</span> • <span className="text-emerald-400 flex items-center"><Check className="w-3 h-3 mr-1" /> Analysis Complete</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Revision Notes", desc: "Exam-focused structure", icon: BookOpen, id: "notes", color: "indigo" },
                        { title: "Quick Revision", desc: "2-minute recall sheet", icon: Zap, id: "quick-revision", color: "yellow" },
                        { title: "Practice Quiz", desc: "Test your knowledge", icon: BrainCircuit, id: "quiz", color: "emerald" },
                        { title: "Flashcards", desc: "Spaced repetition (Mock)", icon: FileBox, id: "flashcards", color: "blue", locked: true }
                      ].map((action, i) => (
                        <motion.button 
                          key={i}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          onClick={() => !action.locked && setActiveView(action.id as ViewState)}
                          className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left group
                            ${action.locked ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/5" : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"}
                          `}
                        >
                          <div className={`p-3 rounded-xl mb-4 bg-${action.color}-500/10 text-${action.color}-400 group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-base font-semibold text-white mb-1">{action.title}</h3>
                          <p className="text-xs text-slate-400">{action.desc}</p>
                        </motion.button>
                      ))}
                    </div>

                    {/* Study Intelligence Panel */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                      <div className="flex items-center gap-2 mb-6 text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="text-sm font-bold tracking-widest uppercase">✦ Study Intelligence</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Key Metrics</p>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Word Count</span><span className="font-medium text-white">{insights?.wordCount}</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Est. Read Time</span><span className="font-medium text-white">{insights?.readTime} min</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Concept Density</span><span className="font-medium text-emerald-400">High</span></div>
                        </div>
                        <div className="col-span-2 space-y-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI Recommendations</p>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-300">
                            Based on this material, we recommend focusing on the <strong className="text-white">Integrating Factor method</strong> and practicing <strong className="text-white">Mixing Problems</strong>, as they have the highest formula density.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-20 text-slate-500">No document processed yet. Go to Overview to start.</div>
                )}
              </motion.div>
            )}

            {/* VIEW: NOTES & QUICK REVISION */}
            {(activeView === "notes" || activeView === "quick-revision") && (
              <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto w-full">
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                   <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                     <h2 className="text-2xl font-bold text-white">{activeView === "notes" ? "Revision Notes" : "2-Minute Revision"}</h2>
                     <div className="flex gap-2">
                       <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(activeView === "notes" ? notes : quickRevisionNotes || "")} className="text-slate-400 hover:text-white bg-white/5"><Copy className="w-4 h-4" /></Button>
                     </div>
                   </div>
                   <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:text-indigo-300 prose-p:text-slate-300 prose-li:text-slate-300">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {activeView === "notes" ? notes : quickRevisionNotes || ""}
                     </ReactMarkdown>
                   </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: QUIZ */}
            {activeView === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto w-full space-y-8">
                {quizData ? (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Practice Quiz</h2>
                      <p className="text-slate-400">Test your recall on the extracted concepts.</p>
                    </div>
                    {quizData.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 block">Question {qIndex + 1}</span>
                        <h3 className="text-lg font-medium text-white mb-6">{q.question}</h3>
                        <div className="space-y-3">
                          {q.options.map((opt: string, oIndex: number) => {
                            const isSelected = userAnswers[qIndex] === oIndex;
                            const isCorrect = q.correctAnswerIndex === oIndex;
                            const showCorrect = quizSubmitted && isCorrect;
                            const showWrong = quizSubmitted && isSelected && !isCorrect;

                            return (
                              <button key={oIndex} onClick={() => !quizSubmitted && setUserAnswers(prev => ({ ...prev, [qIndex]: oIndex }))} disabled={quizSubmitted}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4
                                  ${isSelected && !quizSubmitted ? "bg-indigo-500/20 border-indigo-500" : "bg-white/5 border-white/10"}
                                  ${showCorrect ? "bg-emerald-500/20 border-emerald-500" : ""}
                                  ${showWrong ? "bg-red-500/20 border-red-500" : ""}
                                `}
                              >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected || showCorrect || showWrong ? (showCorrect ? "border-emerald-400" : showWrong ? "border-red-400" : "border-indigo-400") : "border-slate-600"}`}>
                                  {(isSelected || showCorrect || showWrong) && <div className={`w-2.5 h-2.5 rounded-full ${showCorrect ? "bg-emerald-400" : showWrong ? "bg-red-400" : "bg-indigo-400"}`}></div>}
                                </div>
                                <span className={`text-sm ${showCorrect ? "text-emerald-100" : showWrong ? "text-red-100" : "text-slate-200"}`}>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className={`mt-6 p-4 rounded-xl border ${userAnswers[qIndex] === q.correctAnswerIndex ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                            <p className="text-sm text-slate-300"><strong className={userAnswers[qIndex] === q.correctAnswerIndex ? 'text-emerald-400' : 'text-slate-400'}>Explanation: </strong>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {!quizSubmitted ? (
                      <Button onClick={() => setQuizSubmitted(true)} className="w-full h-14 rounded-xl bg-white text-black font-bold">SUBMIT QUIZ</Button>
                    ) : (
                      <Button variant="outline" onClick={() => { setUserAnswers({}); setQuizSubmitted(false); }} className="w-full h-14 rounded-xl border-white/10 text-white bg-transparent">RETRY QUIZ</Button>
                    )}
                  </>
                ) : (
                  <div className="text-center mt-20 text-slate-500">No quiz data available. Process a document first.</div>
                )}
              </motion.div>
            )}

            {/* MOCK VIEWS */}
            {(activeView === "flashcards" || activeView === "progress" || activeView === "settings") && (
              <motion.div key="mock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                  {activeView === "flashcards" ? <FileBox className="w-8 h-8 text-blue-400" /> : activeView === "progress" ? <TrendingUp className="w-8 h-8 text-emerald-400" /> : <Settings className="w-8 h-8 text-slate-400" />}
                </div>
                <h2 className="text-2xl font-bold text-white capitalize mb-2">{activeView} (Mock UI)</h2>
                <p className="text-slate-400 max-w-md">This view is currently a visual mockup for the hackathon presentation. No backend logic is wired to this module yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating AI Copilot Chat (Mock) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isCopilotOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-[350px] h-[450px] bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="h-14 border-b border-white/10 bg-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-indigo-400"><Sparkles className="w-4 h-4" /> <span className="text-sm font-semibold text-white">Study Copilot</span></div>
                <button onClick={() => setIsCopilotOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/10 text-slate-200 rounded-tl-sm border border-white/5"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10 bg-black/20">
                <form onSubmit={handleChatSubmit} className="relative">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask a question..." className="bg-white/5 border-white/10 pr-10 rounded-xl text-sm" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-colors">< ArrowRight className="w-3 h-3" /></button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 ${isCopilotOpen ? "bg-slate-800 text-white border border-white/10" : "bg-white text-black"}`}
        >
          {isCopilotOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40">
        {[
          { icon: LayoutDashboard, id: "dashboard" },
          { icon: PanelLeft, id: "workspace" },
          { icon: BookOpen, id: "notes" },
          { icon: BrainCircuit, id: "quiz" }
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id as ViewState)} className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${activeView === item.id ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-slate-300"}`}>
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

    </div>
  );
}
