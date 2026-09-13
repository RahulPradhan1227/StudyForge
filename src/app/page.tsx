"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, 
  FileText, 
  Copy, 
  Download, 
  Printer, 
  BookOpen, 
  Zap, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  Beaker,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ZapIcon,
  Target,
  Brain,
  Clock,
  LayoutList,
  CheckCircle,
  Circle,
  FileBox,
  ChevronRight,
  RefreshCcw,
  Sparkle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LOADING_STEPS = [
  "Reading lecture material",
  "Extracting key concepts",
  "Identifying exam topics",
  "Structuring revision notes",
  "Preparing practice questions"
];

const DEMO_DATA = {
  notes: `## Topic Overview
First-order differential equations are fundamental mathematical tools used to model systems undergoing change. In this lecture, we explored their primary applications in physics, biology, and economics, focusing specifically on exponential growth/decay, Newton's Law of Cooling, and mixing problems.

## Key Concepts
- **Exponential Growth and Decay:** Models where the rate of change of a quantity is proportional to the quantity itself (e.g., population growth, radioactive decay).
- **Newton's Law of Cooling:** The rate of heat loss of a body is proportional to the difference in temperatures between the body and its surroundings.
- **Mixing Problems:** Systems where a substance is dissolved in a fluid, entering and exiting a tank at specific rates, requiring an equation balancing the inflow and outflow rates.

## Important Definitions
- **Differential Equation:** An equation involving an unknown function and its derivatives.
- **First-Order:** The highest derivative present in the equation is the first derivative (dy/dx).
- **Initial Value Problem (IVP):** A differential equation accompanied by an initial condition (e.g., y(0) = y_0) that allows for a specific solution rather than a general family of solutions.
- **Time Constant:** In exponential decay, the time required for the quantity to reduce to 1/e of its initial value.

## Exam-Focused Points
- Always clearly define your variables and units before setting up the differential equation.
- For mixing problems, remember the core principle: **Rate of Change = (Rate In) - (Rate Out)**.
- Be prepared to solve the resulting separable or linear first-order differential equation using integrating factors.
- In Newton's Law of Cooling, the ambient temperature $T_m$ is typically constant, but the initial condition is necessary to find the proportionality constant $k$.

## Concept Relationships
- Both Radioactive Decay and Newton's Law of Cooling are fundamentally driven by the same mathematical relationship: $dy/dt = k(y - C)$. The difference lies only in the physical interpretation of the constants and variables.
- Mixing problems often result in linear first-order equations of the form $dy/dt + P(t)y = Q(t)$, which generalizes the simpler exponential models.

## Likely Exam Questions
1. A tank initially contains 100 liters of pure water. Brine containing 0.2 kg of salt per liter enters at 5 L/min. The well-mixed solution leaves at 5 L/min. Find the amount of salt in the tank after 20 minutes.
2. A radioactive isotope has a half-life of 1590 years. If you start with 100 grams, how much remains after 1000 years?
3. A cup of coffee at 90°C is placed in a room at 20°C. After 10 minutes, the coffee cools to 70°C. What will its temperature be after 20 minutes?
`,
  quickRevision: `## 🔥 MUST REMEMBER
- **Growth/Decay:** $dP/dt = kP$
- **Newton's Cooling:** $dT/dt = k(T - T_m)$
- **Mixing:** $dx/dt = (\\text{Rate In}) - (\\text{Rate Out})$

## 🧮 FORMULAS
- **Solution to $y' = ky$:** $y(t) = y_0 e^{kt}$
- **Half-life:** $t_{1/2} = \\ln(2)/k$
- **Rate In (Mixing):** $(\\text{concentration in}) \\times (\\text{flow rate in})$
- **Rate Out (Mixing):** $(x(t)/\\text{Volume}) \\times (\\text{flow rate out})$

## 🎯 EXAM FOCUS
- Memorize the Integrating Factor method: $\\mu(t) = e^{\\int P(t) dt}$
- Setting up the correct initial condition (IVP) is worth 50% of the points on modeling questions.

## ⚠️ COMMON MISTAKES
- Forgetting a negative sign for the constant $k$ in decay and cooling problems.
- Using the wrong volume in the "Rate Out" term for mixing problems if the inflow and outflow rates are different (volume is not constant!).
`,
  quiz: [
    {
      question: "Which of the following equations represents Newton's Law of Cooling?",
      options: [
        "dT/dt = k(T + Tm)",
        "dT/dt = k(T - Tm)",
        "dT/dt = kT",
        "dT/dt = k / (T - Tm)"
      ],
      correctAnswerIndex: 1,
      explanation: "Newton's Law of Cooling states the rate of change of temperature is proportional to the difference between the object's temperature (T) and the ambient temperature (Tm)."
    },
    {
      question: "In a mixing problem, what is the fundamental principle used to set up the differential equation?",
      options: [
        "Rate of Change = (Rate In) + (Rate Out)",
        "Rate of Change = (Rate Out) - (Rate In)",
        "Rate of Change = (Rate In) - (Rate Out)",
        "Rate of Change = (Rate In) * (Rate Out)"
      ],
      correctAnswerIndex: 2,
      explanation: "The net rate of change of a substance in a tank is exactly the rate at which it enters minus the rate at which it leaves."
    },
    {
      question: "If a population grows according to the model dP/dt = kP, what is the general form of the solution?",
      options: [
        "P(t) = P_0 + kt",
        "P(t) = P_0 * e^(kt)",
        "P(t) = k * e^(P_0 t)",
        "P(t) = ln(P_0 * kt)"
      ],
      correctAnswerIndex: 1,
      explanation: "This is a separable differential equation. Integrating both sides yields the exponential growth formula P(t) = P_0 * e^(kt)."
    },
    {
      question: "What is the defining characteristic of a 'First-Order' differential equation?",
      options: [
        "It only contains terms raised to the power of 1.",
        "It only involves one variable.",
        "The highest derivative present is the first derivative.",
        "It can only be solved using one specific method."
      ],
      correctAnswerIndex: 2,
      explanation: "The 'order' of a differential equation is determined by the highest derivative it contains. First-order means it contains dy/dx but no higher derivatives like d^2y/dx^2."
    },
    {
      question: "In a mixing problem where fluid enters at 4 L/min and leaves at 4 L/min, what happens to the total volume in the tank?",
      options: [
        "It increases linearly.",
        "It decreases linearly.",
        "It remains constant.",
        "It grows exponentially."
      ],
      correctAnswerIndex: 2,
      explanation: "Since the inflow rate equals the outflow rate, the net change in volume is zero, so the total volume remains constant."
    }
  ]
};

export default function Home() {
  const [subject, setSubject] = useState("");
  const [examGoal, setExamGoal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "results">("idle");
  const [notes, setNotes] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"notes" | "quick-revision" | "quiz">("notes");
  const [insights, setInsights] = useState<{wordCount: number; readTime: number; conceptCount: number; fileSize: string; formulaDensity: number} | null>(null);
  
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [quickRevisionNotes, setQuickRevisionNotes] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "processing") {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 1500); // Faster perceived loading for better UX
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
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0].errors[0];
      toast.error("Invalid file", {
        description: error.message,
      });
    },
  });

  const calculateInsights = (markdown: string, uploadedFile: File | null) => {
    const words = markdown.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const concepts = (markdown.match(/^[*-]\s/gm) || []).length;
    const formulas = (markdown.match(/\$/g) || []).length / 2; // Rough estimate based on LaTeX markers
    const fileSize = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + " MB" : "1.2 MB";
    setInsights({ wordCount: words, readTime, conceptCount: concepts, fileSize, formulaDensity: formulas });
  };

  const handleGenerate = async () => {
    if (!file && !isDemoMode) {
      toast.error("Missing File", { description: "Please upload a PDF lecture." });
      return;
    }

    setStatus("processing");
    
    if (isDemoMode) {
      setTimeout(() => {
        setNotes(DEMO_DATA.notes);
        setQuickRevisionNotes(DEMO_DATA.quickRevision);
        setQuizData(DEMO_DATA.quiz);
        calculateInsights(DEMO_DATA.notes, null);
        setStatus("results");
        setActiveTab("notes");
      }, 7500); // 1.5s per step * 5 steps
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
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate notes");
      }

      const data = await res.json();
      setNotes(data.notes);
      setQuickRevisionNotes(data.quickRevision);
      setQuizData(data.quiz);
      calculateInsights(data.notes, file);
      setStatus("results");
      setActiveTab("notes");
    } catch (error: any) {
      setStatus("idle");
      toast.error("Error", {
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === "notes" ? notes : quickRevisionNotes || "");
    toast.success("Copied to clipboard", { description: "You can now paste your notes anywhere." });
  };

  const handleDownload = () => {
    const content = activeTab === "notes" ? notes : quickRevisionNotes || "";
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject || "StudyForge"}_${activeTab === "notes" ? "Notes" : "Quick_Revision"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuizSubmit = () => {
    if (quizData && Object.keys(userAnswers).length < quizData.length) {
      toast.error("Incomplete", { description: "Please answer all questions before submitting." });
      return;
    }
    setQuizSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans relative selection:bg-indigo-500/30 selection:text-indigo-100 flex flex-col">
      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none -z-20 print:hidden overflow-hidden bg-[#020617]">
        {/* Subtle atmospheric gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-indigo-900/10 rounded-[100%] blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-blue-900/10 rounded-[100%] blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[40%] bg-violet-900/10 rounded-[100%] blur-[150px] mix-blend-screen"></div>
        {/* Subtle Grid Noise */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik00MCAwSDBWNDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMEwwIDQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8cGF0aCBkPSJNMCA0MEw0MCA0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-30"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 print:hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setStatus("idle"); setFile(null); }}>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-400/50 transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white/90">StudyForge</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white/60 hover:text-white/90 text-sm cursor-pointer transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <input 
                type="checkbox" 
                checked={isDemoMode} 
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-500 bg-black/50 border-white/20 focus:ring-0 focus:ring-offset-0"
              />
              Demo Mode
            </label>
            {status === "results" && (
              <Button variant="ghost" size="sm" onClick={() => { setStatus("idle"); setFile(null); }} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 px-4 text-xs font-medium border border-transparent hover:border-white/10 transition-all">
                New Session <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col z-10 pt-8 md:pt-16">
        
        {/* State: Idle / Upload */}
        {status === "idle" && (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Landing Hero */}
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <Sparkle className="w-3 h-3" /> AI-Powered Study Workspace
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm pb-2">
                StudyForge
              </h1>
              <p className="text-xl md:text-2xl font-light text-slate-300/80 max-w-2xl mx-auto leading-relaxed">
                From lecture overload to <span className="text-white font-medium">exam-ready clarity.</span>
              </p>
              <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
                Turn your lecture materials into focused notes, rapid revision sheets, and practice questions in seconds.
              </p>
            </div>

            {/* Input Workspace */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pl-2 opacity-80 mb-2">
                <LayoutList className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold tracking-widest uppercase text-indigo-300">Create Your Study Session</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] p-5 shadow-lg transition-all hover:border-indigo-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 relative z-10">Subject / Course</label>
                  <Input
                    placeholder="e.g. Computer Networks"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-transparent border-0 border-b border-white/10 text-white placeholder:text-slate-600 rounded-none px-0 h-10 text-lg focus-visible:ring-0 focus-visible:border-indigo-400 relative z-10 transition-colors shadow-none"
                  />
                </div>
                <div className="group relative rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] p-5 shadow-lg transition-all hover:border-blue-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 relative z-10">Exam Goal</label>
                  <Input
                    placeholder="e.g. Midterm Preparation"
                    value={examGoal}
                    onChange={(e) => setExamGoal(e.target.value)}
                    className="bg-transparent border-0 border-b border-white/10 text-white placeholder:text-slate-600 rounded-none px-0 h-10 text-lg focus-visible:ring-0 focus-visible:border-blue-400 relative z-10 transition-colors shadow-none"
                  />
                </div>
              </div>

              {/* Futuristic Dropzone */}
              <div
                {...getRootProps()}
                className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/30 backdrop-blur-xl p-10 md:p-16 text-center transition-all duration-500 ease-out flex flex-col items-center justify-center gap-6 shadow-2xl group cursor-pointer ${isDemoMode ? "opacity-60 cursor-not-allowed" : ""} ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.01]"
                    : "hover:border-white/20 hover:bg-slate-900/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                <input {...getInputProps()} disabled={isDemoMode} />
                
                <div className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-transform duration-500 ${isDragActive ? "scale-110 bg-indigo-500/20 border-indigo-500/50" : "bg-white/5 border border-white/10 group-hover:scale-105 group-hover:bg-white/10 group-hover:border-white/20"}`}>
                  <UploadCloud className={`w-8 h-8 transition-colors ${isDragActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"}`} />
                </div>
                
                <div className="space-y-2 relative z-10">
                  <h3 className="text-xl md:text-2xl font-semibold text-white/90 tracking-tight">
                    {isDragActive ? "Drop to forge material" : "Drop your lecture here"}
                  </h3>
                  <p className="text-sm text-slate-400">Drag & drop your PDF or <span className="text-indigo-400 group-hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30 transition-colors">browse files</span></p>
                  <p className="text-[11px] font-medium tracking-widest text-slate-500 uppercase mt-4">PDF • MAX 20MB</p>
                </div>
                
                {(file && !isDemoMode) && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] mb-2">
                      <FileText className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-white">{file.name}</h4>
                      <p className="text-sm text-indigo-300/80 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB ready</p>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Remove File
                    </Button>
                  </div>
                )}
              </div>

              {/* Generate CTA */}
              <div className="pt-4 flex flex-col items-center gap-6">
                <Button
                  onClick={handleGenerate}
                  disabled={!file && !isDemoMode}
                  className={`relative w-full md:w-auto md:min-w-[320px] h-16 text-lg font-bold rounded-2xl transition-all duration-500 overflow-hidden group ${
                    (!file && !isDemoMode) 
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-slate-100 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className={`w-5 h-5 ${(file || isDemoMode) ? "text-indigo-600" : ""}`} /> 
                    {isDemoMode ? "GENERATE DEMO PACK" : "FORGE MY STUDY PACK"}
                  </span>
                  {(file || isDemoMode) && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  <span className="flex items-center gap-1.5"><ZapIcon className="w-3.5 h-3.5" /> Fast Processing</span>
                  <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Exam-Focused</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Private & Secure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Processing */}
        {status === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full min-h-[500px] animate-in fade-in zoom-in-95 duration-500 ease-out print:hidden">
            <div className="mb-12 relative">
              {isDemoMode && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  DEMO MODE ACTIVE
                </div>
              )}
              {/* Orbital Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-[40px] animate-pulse"></div>
              
              <div className="relative w-24 h-24 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,0.5)_360deg)] animate-[spin_2s_linear_infinite]"></div>
                <div className="absolute inset-[2px] bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <Brain className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" />
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <h3 className="text-center text-sm font-semibold tracking-widest text-slate-400 uppercase mb-8">StudyForge AI Processing</h3>
              
              <div className="flex flex-col gap-3">
                {LOADING_STEPS.map((step, index) => {
                  const isCompleted = index < loadingStepIndex;
                  const isActive = index === loadingStepIndex;
                  const isPending = index > loadingStepIndex;

                  return (
                    <div key={step} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isActive ? "bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] scale-[1.02]" :
                      isCompleted ? "bg-white/[0.02] border-white/5 opacity-70" : "border-transparent opacity-30"
                    }`}>
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {isCompleted ? <CheckCircle className="w-5 h-5 text-indigo-400" /> :
                         isActive ? <Loader2 className="w-5 h-5 text-white animate-spin" /> :
                         <Circle className="w-5 h-5 text-slate-600" />}
                      </div>
                      <span className={`text-sm md:text-base font-medium ${isActive ? "text-white" : "text-slate-300"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* State: Results */}
        {status === "results" && (
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            
            {/* Sidebar Left: Navigation & Insights */}
            <div className="w-full xl:w-80 flex flex-col gap-6 sticky top-24 print:hidden flex-shrink-0">
              
              {/* Context Header */}
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-5 shadow-xl relative overflow-hidden">
                {isDemoMode && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest py-1 px-8 translate-x-6 translate-y-3 rotate-45 shadow-md">
                    Demo Mode
                  </div>
                )}
                <h3 className="text-sm font-semibold tracking-wide text-white/90 mb-1 leading-snug">
                  {isDemoMode ? "Applications of First-Order Differential Equations" : (subject || file?.name || "Study Session")}
                </h3>
                <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> {isDemoMode ? "Midterm Preparation" : (examGoal || "General Review")}
                </p>
              </div>

              {/* Navigation Menu */}
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-3 shadow-xl flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start h-11 px-4 text-sm font-medium transition-all ${activeTab === "notes" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  onClick={() => setActiveTab("notes")}
                >
                  <BookOpen className={`w-4 h-4 mr-3 ${activeTab === "notes" ? "text-indigo-400" : ""}`} /> Revision Notes
                </Button>
                
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start h-11 px-4 text-sm font-medium transition-all ${activeTab === "quick-revision" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  onClick={() => setActiveTab("quick-revision")}
                >
                  <Zap className={`w-4 h-4 mr-3 ${activeTab === "quick-revision" ? "text-yellow-400" : ""}`} /> 2-Min Revision
                </Button>

                <Button 
                  variant="ghost" 
                  className={`w-full justify-start h-11 px-4 text-sm font-medium transition-all ${activeTab === "quiz" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  <BrainCircuit className={`w-4 h-4 mr-3 ${activeTab === "quiz" ? "text-emerald-400" : ""}`} /> Practice Quiz
                </Button>
              </div>

              {/* Study Insights */}
              {insights && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-5 shadow-xl">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Study Insights
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <Clock className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="block text-lg font-bold text-white leading-none">{insights.readTime}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1 block">Min Read</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <ZapIcon className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="block text-lg font-bold text-white leading-none">{insights.conceptCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1 block">Key Concepts</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="block text-lg font-bold text-white leading-none">{insights.wordCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1 block">Total Words</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <Beaker className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="block text-lg font-bold text-white leading-none">{insights.formulaDensity > 0 ? insights.formulaDensity : "-"}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1 block">Formulas</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Center */}
              {(activeTab === "notes" || activeTab === "quick-revision") && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-4 shadow-xl flex flex-col gap-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300" onClick={handleCopy}>
                    <Copy className="w-3.5 h-3.5 mr-2" /> Copy Notes
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5 mr-2" /> Download Markdown
                  </Button>
                  <Button size="sm" className="w-full justify-start text-xs font-semibold bg-white text-black hover:bg-slate-200 mt-1" onClick={handlePrint}>
                    <Printer className="w-3.5 h-3.5 mr-2" /> Export to PDF
                  </Button>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
              
              {/* Tab: Notes */}
              {activeTab === "notes" && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-6 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10 print:border-black/10">
                    <div className="p-3 bg-indigo-500/20 rounded-xl print:hidden">
                      <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white print:text-black">Exam-Focused Revision</h2>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest print:text-black/50">AI Structured Content</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert prose-indigo max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight 
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 
                    prose-p:text-slate-300 prose-p:leading-relaxed 
                    prose-li:text-slate-300 prose-li:marker:text-indigo-400
                    prose-strong:text-white prose-strong:font-semibold
                    print:prose-p:text-black print:prose-headings:text-black print:prose-strong:text-black print:max-w-full">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {notes}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tab: Quick Revision */}
              {activeTab === "quick-revision" && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-6 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 print:border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-500/20 rounded-xl print:hidden">
                        <ZapIcon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white print:text-black">2-Minute Revision</h2>
                        <span className="text-xs font-medium text-slate-400 print:text-black/50">Everything you need to recall before the exam.</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 print:hidden">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-lg font-mono font-bold text-white">02:00</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert prose-yellow max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight 
                    prose-h2:text-xl prose-h2:text-yellow-400 prose-h2:mt-8 prose-h2:mb-4 
                    prose-p:text-slate-300 prose-p:leading-relaxed 
                    prose-li:text-slate-300 prose-li:marker:text-yellow-500
                    prose-strong:text-white prose-strong:font-semibold
                    bg-white/[0.02] border border-white/[0.05] p-6 md:p-8 rounded-2xl
                    print:prose-p:text-black print:prose-headings:text-black print:prose-strong:text-black print:max-w-full print:bg-transparent print:border-0 print:p-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {quickRevisionNotes || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tab: Quiz */}
              {activeTab === "quiz" && (
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-6 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                  {quizData ? (
                    <div className="max-w-3xl mx-auto">
                      <div className="text-center mb-10 pb-8 border-b border-white/10">
                        <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-4">
                          <BrainCircuit className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Test Yourself</h2>
                        <p className="text-slate-400">See how much you actually remember from this lecture.</p>
                      </div>

                      <div className="space-y-12">
                        {quizData.map((q, qIndex) => (
                          <div key={qIndex} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 shadow-inner relative">
                            <span className="absolute -top-3 left-6 px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10">
                              Question {qIndex + 1} of 5
                            </span>
                            
                            <h3 className="text-lg md:text-xl font-medium text-white mb-6 leading-relaxed mt-2">{q.question}</h3>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {q.options.map((opt: string, oIndex: number) => {
                                const isSelected = userAnswers[qIndex] === oIndex;
                                const isCorrect = q.correctAnswerIndex === oIndex;
                                const showCorrect = quizSubmitted && isCorrect;
                                const showWrong = quizSubmitted && isSelected && !isCorrect;

                                return (
                                  <button
                                    key={oIndex}
                                    onClick={() => !quizSubmitted && setUserAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                                    disabled={quizSubmitted}
                                    className={`p-4 md:p-5 text-left rounded-xl border transition-all duration-200 flex items-center gap-4 group
                                      ${isSelected && !quizSubmitted ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : ""}
                                      ${!isSelected && !quizSubmitted ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" : ""}
                                      ${showCorrect ? "bg-emerald-500/20 border-emerald-500" : ""}
                                      ${showWrong ? "bg-red-500/20 border-red-500" : ""}
                                      ${quizSubmitted && !isSelected && !isCorrect ? "bg-white/5 border-white/5 opacity-40" : ""}
                                    `}
                                  >
                                    <div className="flex-shrink-0">
                                      {showCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
                                       showWrong ? <XCircle className="w-5 h-5 text-red-400" /> : 
                                       <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${isSelected ? "border-emerald-400" : "border-white/30 group-hover:border-white/50"}`}>
                                         {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>}
                                       </div>}
                                    </div>
                                    <span className={`text-[15px] ${showCorrect ? "text-emerald-100 font-medium" : showWrong ? "text-red-100" : "text-white/90"}`}>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Explanation */}
                            {quizSubmitted && (
                              <div className={`mt-6 p-5 rounded-xl border ${userAnswers[qIndex] === q.correctAnswerIndex ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-white/10'} animate-in fade-in slide-in-from-top-4`}>
                                <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${userAnswers[qIndex] === q.correctAnswerIndex ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {userAnswers[qIndex] === q.correctAnswerIndex ? '🎉 Correct' : 'Explanation'}
                                </p>
                                <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-12 text-center">
                        {!quizSubmitted ? (
                          <Button 
                            onClick={handleQuizSubmit} 
                            className="w-full md:w-auto md:min-w-[300px] h-14 text-lg font-bold bg-white text-black hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] rounded-xl"
                          >
                            SUBMIT QUIZ <ChevronRight className="w-5 h-5 ml-1 -mr-1" />
                          </Button>
                        ) : (
                          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Your Score</span>
                            <div className="text-5xl font-extrabold text-white mb-4">
                              {quizData.reduce((acc, q, i) => acc + (userAnswers[i] === q.correctAnswerIndex ? 1 : 0), 0)} <span className="text-3xl text-slate-500">/ {quizData.length}</span>
                            </div>
                            <p className="text-emerald-400 font-medium mb-8">
                              {quizData.reduce((acc, q, i) => acc + (userAnswers[i] === q.correctAnswerIndex ? 1 : 0), 0) >= 4 ? "🎉 Great work! You're ready." : "Keep reviewing the notes!"}
                            </p>
                            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 px-8 rounded-xl" onClick={() => {
                              setUserAnswers({});
                              setQuizSubmitted(false);
                            }}>
                              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
