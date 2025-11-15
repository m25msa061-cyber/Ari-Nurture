
import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: The import `GoogleGenerativeAI` is deprecated and should not be used.
// The correct import is `GoogleGenAI`.
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES ---
type Language = 'en' | 'hi';
type View = 'farmer' | 'hr';

interface Location {
    city: string;
    country: string;
    coords?: { lat: number, lon: number };
}

interface Farmer {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  currentCrop: string;
  aiTrainingProgress: number;
  lastAiInteraction: string;
  diagnosisCount: number;
  badges: string[];
  reportedProfit: number;
  region: 'North' | 'West' | 'Central' | 'East' | 'South'; // For map
}

interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

interface DiagnosisMessage extends Message {
  image?: string;
}

interface LedgerEntry {
  id: number;
  type: 'expense' | 'sale';
  description: string;
  amount: number;
}

interface CommunityAnswer {
    id: string;
    author: string;
    text: string;
}

interface CommunityPost {
    id: string;
    author: string;
    question: string;
    imageUrl?: string;
    answers: CommunityAnswer[];
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}


// --- LOCALIZATION COPY ---
const copy = {
  en: {
    appName: "Agri-Nurture",
    toggleLang: "हिन्दी / English",
    farmerView: "Farmer View",
    hrView: "HR View",
    welcomeFarmer: "Welcome, Farmer!",
    myBadges: "My Badges",
    // Tabs
    advisorTab: "Advisor",
    profitTab: "My Profits",
    communityTab: "Community",
    marketTab: "Market",
    trainingTab: "Training",
    // Weather
    weatherTitle: "Local Weather",
    fetchingWeather: "Fetching weather...",
    weatherError: "Could not fetch weather. Please enable location services.",
    changeLocation: "Change",
    setLocation: "Set Location",
    enterCity: "Enter your city",
    // Crop Advisor
    cropAdvisorTitle: "AI Smart-Crop Advisor",
    getAdvice: "Get Crop Advice",
    soilType: "Sandy Loam",
    askFollowUp: "Ask a follow-up question...",
    // Diagnosis
    cropDiagnosisTitle: "AI Training & Diagnosis",
    diagnoseCrop: "Diagnose My Crop",
    uploadPrompt: "Upload a photo of the diseased plant",
    // Chat
    chatPlaceholder: "Type your answer here...",
    submit: "Submit",
    kisanDost: "Kisan-Dost AI Chat",
    kisanDostIntro: "I am Kisan-Dost, your friendly agricultural expert. How can I help you today?",
    generating: "Generating...",
    close: "Close",
    // New Features
    myProfits: "My Profits",
    logExpense: "Log Expense",
    logSale: "Log Sale",
    description: "Description (e.g., Seeds, Fertilizer)",
    amount: "Amount (₹)",
    add: "Add",
    totalExpenses: "Total Expenses",
    totalSales: "Total Sales",
    netProfit: "Net Profit",
    saveProfit: "Save to Profile",
    communityHub: "Community Hub",
    askQuestion: "Ask the Community",
    yourQuestion: "Your Question...",
    post: "Post",
    answers: "Answers",
    addAnswer: "Add your answer...",
    // Badges
    techSavvy: "Tech Savvy",
    profitPro: "Profit Pro",
    communityHelper: "Community Helper",
    // Market Hub
    marketHub: "Market Hub",
    marketReport: "Get Local Market Report",
    marketReportDesc: "Get real-time crop demand and pricing for your area.",
    // Training Hub
    trainingHub: "Training Hub",
    trainingDesc: "Improve your skills with our training modules.",
    module1Title: "Soil Health Mastery",
    module1Desc: "Learn to test and improve your soil for better yields.",
    module2Title: "Smart Irrigation",
    module2Desc: "Techniques for water conservation and efficient usage.",
    module3Title: "Pest Management",
    module3Desc: "Integrated strategies to protect your crops.",
    module4Title: "Market Linkages",
    module4Desc: "Understand how to connect with buyers and get better prices.",
    module5Title: "Crop Rotation Techniques",
    module5Desc: "Learn how to rotate crops to improve soil health and reduce pests.",
    module6Title: "Financial Literacy for Farmers",
    module6Desc: "Basics of budgeting, saving, and accessing credit for your farm.",
    viewModule: "View Module",
    askAiAboutTopic: "Ask AI about this topic",
    trainingContent: "This module covers key concepts... [Detailed content would go here]",
    backToModules: "Back to Modules",
    generatingContent: "Generating lesson content...",
    generatingQuiz: "Generating quiz...",
    takeQuiz: "Take the Quiz",
    submitQuiz: "Submit Quiz",
    quiz: "Quiz",
    yourScore: "Your Score",
    passed: "Passed!",
    tryAgain: "Please try again.",
    certificateOfCompletion: "Certificate of Completion",
    awardedTo: "This is to certify that",
    hasCompleted: "has successfully completed the module",
    onDate: "on",
    correct: "Correct",
    incorrect: "Incorrect",
    correctAnswerIs: "Correct answer",
    // --- HR VIEW V2 ---
    hrDashboardTitle: "HR Command Center",
    loadingData: "Loading Data...",
    noData: "No Data Found.",
    // HR Tabs
    hrTabDashboard: "Dashboard",
    hrTabFarmers: "Farmer Management",
    hrTabTraining: "Training Insights",
    hrTabCommunity: "Community Health",
    // HR Dashboard
    kpiTotalFarmers: "Total Farmers",
    kpiAvgTraining: "Avg. Training Progress",
    kpiAvgProfit: "Avg. Network Profit",
    kpiMostActive: "Most Active Farmer (24h)",
    mapTitle: "Farmer Engagement Heatmap",
    activityFeed: "Recent Activity Feed",
    // Farmer Management
    filterBy: "Filter by",
    searchFarmer: "Search by name...",
    allRegions: "All Regions",
    // Training Insights
    moduleEngagement: "Training Module Engagement",
    started: "Started",
    completed: "Completed",
    aiTrainingAnalysis: "AI Analysis of Training Gaps",
    analyzeQueries: "Analyze Farmer Queries",
    trainingAnalysisPrompt: "Based on farmer queries, identify key areas of confusion to improve our training materials.",
    // Community Health
    communityKpis: "Community KPIs",
    totalPosts: "Total Posts",
    unansweredQuestions: "Unanswered Questions",
    topContributor: "Top Contributor",
    aiCommunityAnalysis: "AI Analysis of Community Trends",
    analyzePosts: "Analyze Community Posts",
    communityAnalysisPrompt: "Identify trending topics and overall sentiment from recent community posts.",
    farmerDetails: "Farmer Details",
    aiTrainingEngagement: "AI Training Engagement",
    performanceAlignment: "Performance Alignment",
    sentimentAnalysis: "Sentiment Analysis (Simulated)",
    engagementText: (name: string, count: number) => `${name} has used the Diagnosis tool ${count} times.`,
    alignmentText: (name: string) => `${name}'s chosen crop aligns with AI profit recommendations.`,
    sentimentText: "Shows high interest in water-saving techniques and government subsidies.",
    profitVsTrainingChart: "Profit vs. AI Training Correlation",
    reportedProfit: "Reported Profit (₹)",
    aiTraining: "AI Training",
    // Login
    logout: "Logout",
    loginAsFarmer: "Login as Farmer",
    loginAsHR: "Login as HR Manager",
    welcomeMessage: "Welcome to Agri-Nurture",
    welcomeSubMessage: "Please select your role to continue",
    login: "Login",
    signup: "Sign Up",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    loginWithGoogle: "Sign in with Google",
    loginWithFacebook: "Sign in with Facebook",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    goBack: "Go Back",
  },
  hi: {
    appName: "एग्री-नर्चर",
    toggleLang: "हिन्दी / English",
    farmerView: "किसान व्यू",
    hrView: "एचआर व्यू",
    welcomeFarmer: "किसान, आपका स्वागत है!",
    myBadges: "मेरे बैज",
    // Tabs
    advisorTab: "सलाहकार",
    profitTab: "मेरा मुनाफा",
    communityTab: "समुदाय",
    marketTab: "बाजार",
    trainingTab: "प्रशिक्षण",
    // Weather
    weatherTitle: "स्थानीय मौसम",
    fetchingWeather: "मौसम की जानकारी मिल रही है...",
    weatherError: "मौसम की जानकारी नहीं मिल सकी। कृपया लोकेशन सेवाएं सक्षम करें।",
    changeLocation: "बदलें",
    setLocation: "स्थान निर्धारित करें",
    enterCity: "अपना शहर दर्ज करें",
    // Crop Advisor
    cropAdvisorTitle: "एआई स्मार्ट-फसल सलाहकार",
    getAdvice: "फसल सलाह प्राप्त करें",
    soilType: "रेतीली दोमट",
    askFollowUp: "कोई और सवाल पूछें...",
    // Diagnosis
    cropDiagnosisTitle: "एआई प्रशिक्षण और निदान",
    diagnoseCrop: "फसल की जाँच करें",
    uploadPrompt: "रोगग्रस्त पौधे की तस्वीर अपलोड करें",
    // Chat
    chatPlaceholder: "अपना उत्तर यहां लिखें...",
    submit: "प्रस्तुत",
    kisanDost: "किसान-दोस्त एआई चैट",
    kisanDostIntro: "मैं किसान-दोस्त हूँ, आपका मित्र कृषि विशेषज्ञ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    generating: "उत्पन्न हो रहा है...",
    close: "बंद करें",
    // New Features
    myProfits: "मेरा मुनाफा",
    logExpense: "खर्च दर्ज करें",
    logSale: "बिक्री दर्ज करें",
    description: "विवरण (जैसे, बीज, उर्वरक)",
    amount: "राशि (₹)",
    add: "जोड़ें",
    totalExpenses: "कुल खर्च",
    totalSales: "कुल बिक्री",
    netProfit: "शुद्ध लाभ",
    saveProfit: "प्रोफ़ाइल में सहेजें",
    communityHub: "सामुदायिक केंद्र",
    askQuestion: "समुदाय से पूछें",
    yourQuestion: "आपका प्रश्न...",
    post: "पोस्ट करें",
    answers: "उत्तर",
    addAnswer: "अपना उत्तर जोड़ें...",
     // Badges
    techSavvy: "टेक सेवी",
    profitPro: "प्रॉफिट प्रो",
    communityHelper: "कम्युनिटी हेल्पर",
     // Market Hub
    marketHub: "बाजार हब",
    marketReport: "स्थानीय बाजार रिपोर्ट प्राप्त करें",
    marketReportDesc: "अपने क्षेत्र के लिए वास्तविक समय की फसल मांग और मूल्य निर्धारण प्राप्त करें।",
    // Training Hub
    trainingHub: "प्रशिक्षण केंद्र",
    trainingDesc: "हमारे प्रशिक्षण मॉड्यूल के साथ अपने कौशल में सुधार करें।",
    module1Title: "मृदा स्वास्थ्य निपुणता",
    module1Desc: "बेहतर पैदावार के लिए अपनी मिट्टी का परीक्षण और सुधार करना सीखें।",
    module2Title: "स्मार्ट सिंचाई",
    module2Desc: "जल संरक्षण और कुशल उपयोग के लिए तकनीकें।",
    module3Title: "कीट प्रबंधन",
    module3Desc: "अपनी फसलों की सुरक्षा के लिए एकीकृत रणनीतियाँ।",
    module4Title: "बाजार लिंकेज",
    module4Desc: "समझें कि खरीदारों से कैसे जुड़ें और बेहतर मूल्य कैसे प्राप्त करें।",
    module5Title: "फसल रोटेशन तकनीक",
    module5Desc: "मिट्टी के स्वास्थ्य में सुधार और कीटों को कम करने के लिए फसलों को घुमाना सीखें।",
    module6Title: "किसानों के लिए वित्तीय साक्षरता",
    module6Desc: "अपने खेत के लिए बजट, बचत और ऋण तक पहुँच की मूल बातें।",
    viewModule: "मॉड्यूल देखें",
    askAiAboutTopic: "इस विषय के बारे में AI से पूछें",
    trainingContent: "इस मॉड्यूल में प्रमुख अवधारणाएं शामिल हैं... [विस्तृत सामग्री यहां जाएगी]",
    backToModules: "मॉड्यूल पर वापस जाएं",
    generatingContent: "पाठ सामग्री बनाई जा रही है...",
    generatingQuiz: "प्रश्नोत्तरी बनाई जा रही है...",
    takeQuiz: "प्रश्नोत्तरी लें",
    submitQuiz: "प्रश्नोत्तरी सबमिट करें",
    quiz: "प्रश्नोत्तरी",
    yourScore: "आपका स्कोर",
    passed: "सफल!",
    tryAgain: "कृपया पुन: प्रयास करें।",
    certificateOfCompletion: "समापन का प्रमाणपत्र",
    awardedTo: "यह प्रमाणित किया जाता है कि",
    hasCompleted: "ने सफलतापूर्वक मॉड्यूल पूरा कर लिया है",
    onDate: "दिनांक",
    correct: "सही",
    incorrect: "गलत",
    correctAnswerIs: "सही उत्तर",
    // --- HR VIEW V2 ---
    hrDashboardTitle: "एचआर कमांड सेंटर",
    loadingData: "डेटा लोड हो रहा है...",
    noData: "कोई डेटा नहीं मिला।",
    // HR Tabs
    hrTabDashboard: "डैशबोर्ड",
    hrTabFarmers: "किसान प्रबंधन",
    hrTabTraining: "प्रशिक्षण अंतर्दृष्टि",
    hrTabCommunity: "सामुदायिक स्वास्थ्य",
    // HR Dashboard
    kpiTotalFarmers: "कुल किसान",
    kpiAvgTraining: "औसत प्रशिक्षण प्रगति",
    kpiAvgProfit: "औसत नेटवर्क लाभ",
    kpiMostActive: "सबसे सक्रिय किसान (24 घंटे)",
    mapTitle: "किसान सहभागिता हीटमैप",
    activityFeed: "हाल की गतिविधि",
    // Farmer Management
    filterBy: "इसके अनुसार फ़िल्टर करें",
    searchFarmer: "नाम से खोजें...",
    allRegions: "सभी क्षेत्र",
    // Training Insights
    moduleEngagement: "प्रशिक्षण मॉड्यूल सहभागिता",
    started: "शुरू किया",
    completed: "पूरा किया",
    aiTrainingAnalysis: "प्रशिक्षण अंतराल का एआई विश्लेषण",
    analyzeQueries: "किसान प्रश्नों का विश्लेषण करें",
    trainingAnalysisPrompt: "किसानों के प्रश्नों के आधार पर, हमारी प्रशिक्षण सामग्री को बेहतर बनाने के लिए भ्रम के प्रमुख क्षेत्रों की पहचान करें।",
    // Community Health
    communityKpis: "सामुदायिक केपीआई",
    totalPosts: "कुल पोस्ट",
    unansweredQuestions: "अनुत्तरित प्रश्न",
    topContributor: "शीर्ष योगदानकर्ता",
    aiCommunityAnalysis: "सामुदायिक रुझानों का एआई विश्लेषण",
    analyzePosts: "सामुदायिक पोस्ट का विश्लेषण करें",
    communityAnalysisPrompt: "हाल के सामुदायिक पोस्ट से ट्रेंडिंग विषयों और समग्र भावना की पहचान करें।",
    farmerDetails: "किसान का विवरण",
    aiTrainingEngagement: "एआई प्रशिक्षण सहभागिता",
    performanceAlignment: "प्रदर्शन संरेखण",
    sentimentAnalysis: "भावना विश्लेषण (सिम्युलेटेड)",
    engagementText: (name: string, count: number) => `${name} ने निदान उपकरण का ${count} बार उपयोग किया है।`,
    alignmentText: (name: string) => `${name} की चुनी हुई फसल एआई लाभ की सिफारिशों के अनुरूप है।`,
    sentimentText: "पानी बचाने की तकनीकों और सरकारी सब्सिडी में उच्च रुचि दिखाता है।",
    profitVsTrainingChart: "लाभ बनाम एआई प्रशिक्षण सहसंबंध",
    reportedProfit: "रिपोर्टेड लाभ (₹)",
    aiTraining: "एआई प्रशिक्षण",
    // Login
    logout: "लॉग आउट",
    loginAsFarmer: "किसान के रूप में लॉगिन करें",
    loginAsHR: "एचआर मैनेजर के रूप में लॉगिन करें",
    welcomeMessage: "एग्री-नर्चर में आपका स्वागत है",
    welcomeSubMessage: "कृपया जारी रखने के लिए अपनी भूमिका चुनें",
    login: "लॉग इन करें",
    signup: "साइन अप करें",
    email: "ईमेल पता",
    password: "पासवर्ड",
    name: "पूरा नाम",
    loginWithGoogle: "Google के साथ साइन इन करें",
    loginWithFacebook: "Facebook के साथ साइन इन करें",
    orContinueWith: "या इसके साथ जारी रखें",
    noAccount: "कोई खाता नहीं है?",
    haveAccount: "पहले से ही एक खाता है?",
    goBack: "वापस जाओ",
  },
};


// --- ICONS ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 4.707a1 1 0 00-1.414-1.414l-8 8a1 1 0 000 1.414l8 8a1 1 0 001.414-1.414L10.414 12l6.879-6.293z" clipRule="evenodd" /></svg>;
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>;
const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const RupeeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v1.082a.5.5 0 01-.5.5H8.587a1.886 1.886 0 00-1.88 1.516 3.348 3.348 0 00-.207.966 3.38 3.38 0 00.207.966 1.886 1.886 0 001.88 1.516H8.5a.5.5 0 01.5.5v2a.5.5 0 01-.5.5H8a1 1 0 100 2h.5a2.5 2.5 0 002.5-2.5V14a.5.5 0 01.5-.5h.087a1.886 1.886 0 001.88-1.516 3.348 3.348 0 00.207-.966 3.38 3.38 0 00-.207-.966 1.886 1.886 0 00-1.88-1.516H11.5a.5.5 0 01-.5-.5V5z" clipRule="evenodd" /></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.559 5.06a.75.75 0 01.037.994l-1.62 2.428A3.003 3.003 0 006 17a3 3 0 100-6 3 3 0 00-1.522 5.516l1.62-2.428a.75.75 0 01.994-.037zM15.5 6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM12.5 12a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>;
const MarketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L10 4.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 10-2 0v5a1 1 0 102 0v-5z" /></svg>;
const TrainingIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 00-.606.92l.707 7.071a1 1 0 00.92.921l7.071.707a1 1 0 00.92-.606l3-7a1 1 0 00-.606-.92l-7-3zM10 8a2 2 0 100-4 2 2 0 000 4z" /><path d="M3.5 9.5a1 1 0 000 2h13a1 1 0 100-2h-13z" /></svg>;
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" /></svg>;
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10.868 2.884c.321.64.321 1.415 0 2.055l-1.07 2.14a.75.75 0 00.623 1.107h2.14a.75.75 0 00.624-1.106l-1.07-2.141a1.25 1.25 0 010-2.055l1.07-2.14a.75.75 0 00-.623-1.107h-2.14a.75.75 0 00-.624 1.106l1.07 2.141zM5.868 2.884c.321.64.321 1.415 0 2.055l-1.07 2.14a.75.75 0 00.623 1.107h2.14a.75.75 0 00.624-1.106l-1.07-2.141a1.25 1.25 0 010-2.055l1.07-2.14a.75.75 0 00-.623-1.107h-2.14a.75.75 0 00-.624 1.106l1.07 2.141zM10.868 12.884c.321.64.321 1.415 0 2.055l-1.07 2.14a.75.75 0 00.623 1.107h2.14a.75.75 0 00.624-1.106l-1.07-2.141a1.25 1.25 0 010-2.055l1.07-2.14a.75.75 0 00-.623-1.107h-2.14a.75.75 0 00-.624 1.106l1.07 2.141zM5.868 12.884c.321.64.321 1.415 0 2.055l-1.07 2.14a.75.75 0 00.623 1.107h2.14a.75.75 0 00.624-1.106l-1.07-2.141a1.25 1.25 0 010-2.055l1.07-2.14a.75.75 0 00-.623-1.107h-2.14a.75.75 0 00-.624 1.106l1.07 2.141z" clipRule="evenodd" /></svg>;
const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 8.5a.5.5 0 01.5.5v1.5a.5.5 0 01-1 0V9a.5.5 0 01.5-.5z" /><path d="M10 18a5 5 0 005-5h-1a4 4 0 01-8 0H1a1 1 0 00-1 1v1a1 1 0 001 1h18a1 1 0 001-1v-1a1 1 0 00-1-1h-4a5 5 0 00-5 5z" /></svg>;

const FarmerIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A1.23 1.23 0 005.41 15H14.59a1.23 1.23 0 00.935-.495 1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 11.09a9.957 9.957 0 00-6.535 3.403z" /></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.579.055 1.14.15 1.68.283A2.5 2.5 0 0117.5 6.5v6.25a2.5 2.5 0 01-1.82 2.467 40.54 40.54 0 01-1.68.283v.443A2.75 2.75 0 0111.25 19h-2.5A2.75 2.75 0 016 16.25v-.443a40.17 40.17 0 01-1.68-.283A2.5 2.5 0 012.5 13.25V7a2.5 2.5 0 011.82-2.467c.54-.133 1.1-.228 1.68-.283V3.75zM4 8.242V13a.5.5 0 00.364.493 38.64 38.64 0 001.636.265V7.243a38.64 38.64 0 00-1.636.265A.5.5 0 004 7.999v.243zm12 0V13a.5.5 0 01-.364.493 38.64 38.64 0 01-1.636.265V7.243a38.64 38.64 0 011.636.265A.5.5 0 0116 7.999v.243z" clipRule="evenodd" /></svg>;

const BadgeIcon = ({ type }: { type: string }) => {
    const colors: { [key: string]: string } = {
        'Tech Savvy': 'text-blue-500',
        'Profit Pro': 'text-green-500',
        'Community Helper': 'text-yellow-500',
    };
    return <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors[type] || 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v3.502l2.25 1.5a.75.75 0 01-.75 1.298L10.5 8.002V18a.75.75 0 01-1.5 0V8.002L7.25 9.5a.75.75 0 01-.75-1.298l2.25-1.5V2.75A.75.75 0 0110 2z" clipRule="evenodd" /></svg>;
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path><path d="M1 1h22v22H1z" fill="none"></path></svg>;
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.96 9-9.95z"></path></svg>;
const CertificateIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M8.25 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM11.75 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM10 5.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H10.75a.75.75 0 01-.75-.75zM10 7a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0V7.75A.75.75 0 0010 7zM12 10a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM10 11.25a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0v-.01a.75.75 0 00-.75-.75zM7.25 10a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75zM10 16a.75.75 0 000-1.5h-.01a.75.75 0 000 1.5H10z" clipRule="evenodd" /><path d="M5.156 5.156a.75.75 0 010 1.06l-.884.884a.75.75 0 11-1.06-1.06l.884-.884a.75.75 0 011.06 0zM15.732 6.216a.75.75 0 111.06-1.06l.884.884a.75.75 0 11-1.06 1.06l-.884-.884zM14.844 14.844a.75.75 0 011.06 0l.884.884a.75.75 0 01-1.06 1.06l-.884-.884a.75.75 0 010-1.06zM4.268 15.904a.75.75 0 11-1.06-1.06l-.884.884a.75.75 0 111.06 1.06l.884-.884z" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM3.5 10a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" clipRule="evenodd" /></svg>;

// --- GEMINI API SERVICE ---
const geminiService = {
  ai: null as GoogleGenAI | null,
  
  getClient: function() {
    if (!this.ai) {
      if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        alert("Gemini API Key is not configured. Please set the API_KEY environment variable.");
        return null;
      }
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return this.ai;
  },

  generateText: async function(prompt: string, useSearch: boolean) {
    const ai = this.getClient();
    if (!ai) return "API Key not configured. Please set the API_KEY environment variable.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: useSearch ? { tools: [{googleSearch: {}}] } : {},
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API error:", error);
      return "An error occurred while contacting the AI. Please try again.";
    }
  },

  generateJson: async function(prompt: string) {
    const ai = this.getClient();
    if (!ai) return "API Key not configured. Please set the API_KEY environment variable.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { type: Type.STRING }
                                },
                                required: ['question', 'options', 'correctAnswer']
                            }
                        }
                    },
                    required: ['questions']
                }
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini JSON API error:", error);
        return "An error occurred while generating the quiz.";
    }
  },

  generateMultimodal: async function(prompt: string, base64Image: string, mimeType: string) {
    const ai = this.getClient();
    if (!ai) return "API Key not configured.";
    try {
      const imagePart = {
        inlineData: { data: base64Image, mimeType: mimeType },
      };
      const textPart = { text: prompt };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Multimodal API error:", error);
      return "An error occurred while analyzing the image.";
    }
  }
};


// --- FIREBASE SERVICE (SIMULATED) ---
const firebaseService = {
    getFarmers: (callback: (farmers: Farmer[]) => void) => {
        const mockFarmers: Farmer[] = [
            { id: '1', farmerId: 'FARM001', name: 'Ramesh Kumar', location: 'Punjab, India', currentCrop: 'Wheat', aiTrainingProgress: 75, lastAiInteraction: '2023-10-26', diagnosisCount: 5, badges: ['Tech Savvy', 'Profit Pro'], reportedProfit: 13300, region: 'North' },
            { id: '2', farmerId: 'FARM002', name: 'Sita Devi', location: 'Maharashtra, India', currentCrop: 'Cotton', aiTrainingProgress: 40, lastAiInteraction: '2023-10-22', diagnosisCount: 2, badges: [], reportedProfit: 8500, region: 'West' },
            { id: '3', farmerId: 'FARM003', name: 'Arjun Singh', location: 'Uttar Pradesh, India', currentCrop: 'Sugarcane', aiTrainingProgress: 90, lastAiInteraction: '2023-10-27', diagnosisCount: 12, badges: ['Tech Savvy', 'Community Helper'], reportedProfit: 18000, region: 'North' },
            { id: '4', farmerId: 'FARM004', name: 'Priya Sharma', location: 'Haryana, India', currentCrop: 'Rice', aiTrainingProgress: 60, lastAiInteraction: '2023-10-25', diagnosisCount: 4, badges: ['Profit Pro'], reportedProfit: 11200, region: 'North' },
            { id: '5', farmerId: 'FARM005', name: 'Gopal Reddy', location: 'Andhra Pradesh, India', currentCrop: 'Chilli', aiTrainingProgress: 85, lastAiInteraction: '2023-10-28', diagnosisCount: 8, badges: ['Tech Savvy'], reportedProfit: 16500, region: 'South' },
        ];
        setTimeout(() => callback(mockFarmers), 1000);
        return () => console.log("Unsubscribed from mock farmer updates.");
    },
    getCommunityPosts: (callback: (posts: CommunityPost[]) => void) => {
        const mockPosts: CommunityPost[] = [
            { id: 'p1', author: 'Sita Devi', question: 'What is this bug on my cotton plant?', imageUrl: 'https://i.imgur.com/S5Q2R3b.jpeg', answers: [{id: 'a1', author: 'Ramesh Kumar', text: 'Looks like a mealybug. Try a neem oil spray.'}]}
        ];
        setTimeout(() => callback(mockPosts), 500);
        return () => console.log("Unsubscribed from mock community posts.");
    },
    saveProfitLedger: (farmerId: string, profit: number) => {
        console.log(`Simulating save for farmer ${farmerId} with profit ${profit}`);
        // In a real app, this would be an API call to Firebase/Firestore.
        // Here, the state is managed in the App component.
        return Promise.resolve();
    },
    getTrainingStats: (callback: (stats: any) => void) => {
        const mockStats = {
            soil: { started: 15, completed: 10 },
            irrigation: { started: 12, completed: 5 },
            pest: { started: 18, completed: 12 },
            market: { started: 8, completed: 2 },
        };
         setTimeout(() => callback(mockStats), 800);
    }
};

// --- UTILITY FUNCTIONS ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const getCityFromCoords = async (lat: number, lon: number): Promise<Location> => {
    console.log(`Simulating reverse geocoding for ${lat}, ${lon}`);
    if (lat > 28 && lon > 75) {
        return { city: "Jaipur", country: "India", coords: { lat, lon } };
    }
    return { city: "Bhopal", country: "India", coords: { lat, lon } };
};

// --- UI COMPONENTS ---

const VoiceInputButton: React.FC<{
    onTranscript: (text: string) => void;
    language: Language;
}> = ({ onTranscript, language }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // FIX: Cast window to `any` to access non-standard `SpeechRecognition` properties. This resolves TypeScript errors as these properties are not in the standard DOM typings.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

    }, [language, onTranscript]);
    
    const handleToggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        return null; // Don't render button if API is not supported
    }

    return (
        <button
            type="button"
            onClick={handleToggleListening}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            title="Voice Input"
        >
            <MicrophoneIcon className="h-5 w-5" />
        </button>
    );
};


const RoleSelectionScreen: React.FC<{
  setSelectedRole: (role: View) => void;
  language: Language;
}> = ({ setSelectedRole, language }) => {
  const currentCopy = copy[language];
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-brand-light p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-brand-green-dark">{currentCopy.appName}</h1>
        <p className="text-lg text-brand-brown mt-2">{currentCopy.welcomeMessage}</p>
        <p className="text-md text-gray-600">{currentCopy.welcomeSubMessage}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => setSelectedRole('farmer')}
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center group"
        >
          <FarmerIcon className="h-20 w-20 text-brand-green group-hover:text-brand-green-dark transition-colors" />
          <h2 className="text-2xl font-bold text-brand-brown mt-4">{currentCopy.farmerView}</h2>
          <p className="text-gray-500 mt-1">{currentCopy.loginAsFarmer}</p>
        </button>
        <button
          onClick={() => setSelectedRole('hr')}
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-center group"
        >
          <BriefcaseIcon className="h-20 w-20 text-brand-green group-hover:text-brand-green-dark transition-colors" />
          <h2 className="text-2xl font-bold text-brand-brown mt-4">{currentCopy.hrView}</h2>
          <p className="text-gray-500 mt-1">{currentCopy.loginAsHR}</p>
        </button>
      </div>
    </div>
  );
};

const AuthScreen: React.FC<{
  role: View;
  onLoginSuccess: () => void;
  onBack: () => void;
  language: Language;
}> = ({ role, onLoginSuccess, onBack, language }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const currentCopy = copy[language];
  const title = role === 'farmer' ? currentCopy.farmerView : currentCopy.hrView;

  // Since it's a simulation, login is instant
  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      onLoginSuccess();
  }
  const handleSocialLogin = () => {
      onLoginSuccess();
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-brand-light p-4 relative">
      <button onClick={onBack} className="absolute top-4 left-4 flex items-center text-brand-green-dark hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        {currentCopy.goBack}
      </button>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-brown">{title}</h2>
            <p className="text-gray-500">{isLoginView ? currentCopy.login : currentCopy.signup}</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLoginView && (
            <div>
              <label className="text-sm font-bold text-gray-700 tracking-wide">{currentCopy.name}</label>
              <input className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-brand-green" type="text" placeholder="Ramesh Kumar" required />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">{currentCopy.email}</label>
            <input className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-brand-green" type="email" placeholder="farmer@agri.com" required />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 tracking-wide">{currentCopy.password}</label>
            <input className="w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-brand-green" type="password" placeholder="••••••••" required />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center bg-brand-green text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-brand-green-dark">
              {isLoginView ? currentCopy.login : currentCopy.signup}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-16 bg-gray-300"></span>
            <span className="text-gray-500 font-normal">{currentCopy.orContinueWith}</span>
            <span className="h-px w-16 bg-gray-300"></span>
        </div>

        <div className="flex flex-col space-y-4">
            <button onClick={handleSocialLogin} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <GoogleIcon className="w-5 h-5 mr-2" />
                {currentCopy.loginWithGoogle}
            </button>
            <button onClick={handleSocialLogin} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166eeb]">
                <FacebookIcon className="w-5 h-5 mr-2" />
                {currentCopy.loginWithFacebook}
            </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          {isLoginView ? currentCopy.noAccount : currentCopy.haveAccount}{' '}
          <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-brand-green hover:text-brand-green-dark focus:outline-none">
            {isLoginView ? currentCopy.signup : currentCopy.login}
          </button>
        </p>
      </div>
    </div>
  );
};


const Header: React.FC<{
  language: Language;
  setLanguage: (lang: Language) => void;
  handleLogout: () => void;
}> = ({ language, setLanguage, handleLogout }) => {
  const currentCopy = copy[language];

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-brand-green-dark">{currentCopy.appName}</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-4 py-2 text-sm font-medium text-brand-green-dark border border-brand-green-dark rounded-lg hover:bg-brand-green hover:text-white transition-colors"
        >
          {currentCopy.toggleLang}
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
        >
          {currentCopy.logout}
        </button>
      </div>
    </header>
  );
};

const LocationModal: React.FC<{
    currentLocation: Location;
    onClose: () => void;
    onSave: (newLocation: Location) => void;
    language: Language;
}> = ({ currentLocation, onClose, onSave, language }) => {
    const [city, setCity] = useState(currentLocation.city);
    const currentCopy = copy[language];

    const handleSave = () => {
        onSave({ ...currentLocation, city });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <header className="p-4 border-b">
                    <h3 className="font-bold text-lg">{currentCopy.setLocation}</h3>
                </header>
                <main className="p-4">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={currentCopy.enterCity}
                        className="w-full border rounded-lg p-2"
                    />
                </main>
                <footer className="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">{currentCopy.close}</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-green text-white rounded-lg">{currentCopy.submit}</button>
                </footer>
            </div>
        </div>
    );
};


const WeatherWidget: React.FC<{
    language: Language;
    location: Location | null;
    setLocation: (location: Location) => void;
}> = ({ language, location, setLocation }) => {
    const [weather, setWeather] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentCopy = copy[language];

    useEffect(() => {
        if (location) {
            setWeather(`Sunny, 32°C in ${location.city}`);
        }
    }, [location]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><SunIcon /> {currentCopy.weatherTitle}</h3>
                {location && (
                    <button onClick={() => setIsModalOpen(true)} className="text-sm text-blue-600 hover:underline">
                        {currentCopy.changeLocation}
                    </button>
                )}
            </div>
            {!location ? <p className="text-gray-500">{currentCopy.fetchingWeather}</p> : <p className="text-gray-700">{weather}</p>}
            {isModalOpen && location && (
                <LocationModal
                    currentLocation={location}
                    onClose={() => setIsModalOpen(false)}
                    onSave={setLocation}
                    language={language}
                />
            )}
        </div>
    );
};

const CropAdvisor: React.FC<{ language: Language, location: Location | null }> = ({ language, location }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentCopy = copy[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGetAdvice = useCallback(async () => {
    if (!location) return;
    setIsLoading(true);
    setMessages([]);
    const soilType = currentCopy.soilType;
    const prompt = `You are an expert agronomist. The user is a farmer in ${location.city}, ${location.country} with ${soilType} soil. Using Google Search, find the current local market prices, weather forecast, and soil moisture data for this region. Recommend 3 crops that will give the farmer the highest profit this season. Also, advise them on whether their soil needs more water (irrigation) based on the weather. Format the response clearly with headings. End by asking if they have any questions.`;
    const result = await geminiService.generateText(prompt, true);
    setMessages([{ sender: 'ai', text: result }]);
    setIsLoading(false);
  }, [currentCopy.soilType, location]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !location) return;
    const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    const history = newMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `You are an expert agronomist continuing a conversation with a farmer in ${location.city}. Here is the conversation history:\n${history}\n\nBased on the user's latest question, provide a helpful and concise answer using Google Search if necessary.`;
    const result = await geminiService.generateText(prompt, true);
    setMessages(prev => [...prev, { sender: 'ai', text: result }]);
    setIsLoading(false);
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><LeafIcon /> {currentCopy.cropAdvisorTitle}</h3>
      {messages.length === 0 ? (
        <button onClick={handleGetAdvice} disabled={isLoading || !location} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark transition-colors disabled:bg-gray-400">
          {isLoading ? currentCopy.generating : currentCopy.getAdvice}
        </button>
      ) : (
        <div className="h-96 bg-gray-50 border rounded-lg p-2 flex flex-col">
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-center text-gray-500">{currentCopy.generating}</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-2 flex items-center gap-2">
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={currentCopy.askFollowUp} className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-green" disabled={isLoading} />
                <VoiceInputButton onTranscript={setUserInput} language={language} />
                <button onClick={handleSendMessage} disabled={isLoading} className="bg-brand-green text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-green-dark transition-colors disabled:bg-gray-400">{currentCopy.submit}</button>
            </div>
        </div>
      )}
    </div>
  );
};


const DiagnosisTool: React.FC<{ language: Language }> = ({ language }) => {
    const [messages, setMessages] = useState<DiagnosisMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [image, setImage] = useState<{file: File, base64: string, mimeType: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const currentCopy = copy[language];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            const base64 = await fileToBase64(file);
            setImage({ file, base64, mimeType: file.type });
            const initialPrompt = `You are an AI agricultural assistant. A farmer has sent you this image. Do not give the answer immediately. Your primary goal is to train the farmer to collaborate with AI. First, ask them 2-3 clarifying questions (e.g., 'Are these spots also on the stems?', 'What does the underside of the leaf look like?') to teach them what data you need. After they answer, provide a final diagnosis and treatment plan.`;
            setMessages([{ sender: 'user', text: currentCopy.uploadPrompt, image: URL.createObjectURL(file) }]);
            const response = await geminiService.generateMultimodal(initialPrompt, base64, file.type);
            setMessages(prev => [...prev, { sender: 'ai', text: response }]);
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async () => {
      if (!userInput.trim() || isLoading) return;
      const newMessages: DiagnosisMessage[] = [...messages, { sender: 'user', text: userInput }];
      setMessages(newMessages);
      setUserInput('');
      setIsLoading(true);
      const history = newMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
      const followUpPrompt = `This is a follow-up conversation about a crop disease. Here is the history:\n${history}\nNow, provide a final diagnosis and treatment plan based on the user's latest answer.`;
      const response = image ? await geminiService.generateMultimodal(followUpPrompt, image.base64, image.mimeType) : await geminiService.generateText(followUpPrompt, false);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
      setIsLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><BrainIcon className="h-5 w-5 mr-2" /> {currentCopy.cropDiagnosisTitle}</h3>
            <div className="h-80 bg-gray-50 border rounded-lg p-2 flex flex-col">
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                            <UploadIcon />
                            <p>{currentCopy.uploadPrompt}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm bg-brand-green text-white font-bold py-1 px-3 rounded-lg hover:bg-brand-green-dark transition-colors">{currentCopy.diagnoseCrop}</button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>
                                {msg.image && <img src={msg.image} alt="Uploaded plant" className="rounded-lg mb-2"/>}
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-gray-500">{currentCopy.generating}</div>}
                    <div ref={messagesEndRef} />
                </div>
                {messages.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={currentCopy.chatPlaceholder} className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-green" disabled={isLoading} />
                        <VoiceInputButton onTranscript={setUserInput} language={language} />
                        <button onClick={handleSendMessage} disabled={isLoading} className="bg-brand-green text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-green-dark transition-colors disabled:bg-gray-400">{currentCopy.submit}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfitLedger: React.FC<{ language: Language; farmerId: string, onSaveProfit: (farmerId: string, profit: number) => void; }> = ({ language, farmerId, onSaveProfit }) => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const currentCopy = copy[language];

    const handleAddEntry = (type: 'expense' | 'sale') => {
        if (!description || !amount) return;
        const newEntry: LedgerEntry = { id: Date.now(), type, description, amount: parseFloat(amount) };
        setEntries([...entries, newEntry]);
        setDescription('');
        setAmount('');
    };
    
    const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const totalSales = entries.filter(e => e.type === 'sale').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalSales - totalExpenses;

    const handleSave = () => {
        firebaseService.saveProfitLedger(farmerId, netProfit);
        onSaveProfit(farmerId, netProfit);
        alert('Profit saved!');
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><RupeeIcon className="h-5 w-5 mr-2" /> {currentCopy.myProfits}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={currentCopy.description} className="border p-2 rounded-lg w-full" />
                    <VoiceInputButton onTranscript={setDescription} language={language} />
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={currentCopy.amount} className="border p-2 rounded-lg" />
            </div>
            <div className="flex gap-4 mb-4">
                <button onClick={() => handleAddEntry('expense')} className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">{currentCopy.logExpense}</button>
                <button onClick={() => handleAddEntry('sale')} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">{currentCopy.logSale}</button>
            </div>
            <div className="space-y-2">
                {entries.map(entry => (
                    <div key={entry.id} className={`flex justify-between p-2 rounded-md ${entry.type === 'expense' ? 'bg-red-50' : 'bg-green-50'}`}>
                        <span>{entry.description}</span>
                        <span className={`${entry.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>{entry.type === 'expense' ? '-' : '+'}₹{entry.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 border-t pt-4 space-y-2 font-bold">
                 <div className="flex justify-between text-red-700"><span>{currentCopy.totalExpenses}:</span><span>-₹{totalExpenses.toLocaleString()}</span></div>
                 <div className="flex justify-between text-green-700"><span>{currentCopy.totalSales}:</span><span>+₹{totalSales.toLocaleString()}</span></div>
                 <div className={`flex justify-between text-xl p-2 rounded-md ${netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><span>{currentCopy.netProfit}:</span><span>₹{netProfit.toLocaleString()}</span></div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark">{currentCopy.saveProfit}</button>
        </div>
    );
};

const CommunityHub: React.FC<{ language: Language }> = ({ language }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const currentCopy = copy[language];

    useEffect(() => {
        const unsubscribe = firebaseService.getCommunityPosts(data => {
            setPosts(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
         <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center"><UsersIcon className="h-5 w-5 mr-2" /> {currentCopy.communityHub}</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <div className="relative">
                    <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder={currentCopy.yourQuestion} className="w-full p-2 border rounded-md mb-2 pr-12"></textarea>
                    <div className="absolute top-2 right-2">
                       <VoiceInputButton onTranscript={setNewQuestion} language={language} />
                    </div>
                </div>
                <button className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark">{currentCopy.post}</button>
            </div>
             <div className="space-y-6">
                {isLoading ? <p>{currentCopy.loadingData}</p> : posts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4">
                        <p className="font-semibold">{post.question}</p>
                        <p className="text-xs text-gray-500 mb-2">by {post.author}</p>
                        {post.imageUrl && <img src={post.imageUrl} alt="Community post" className="rounded-lg my-2 max-h-60" />}
                        <div className="mt-4 border-t pt-2 space-y-2">
                            <h4 className="font-bold text-sm">{currentCopy.answers} ({post.answers.length})</h4>
                            {post.answers.map(answer => (
                                <div key={answer.id} className="bg-gray-100 p-2 rounded-md">
                                    <p className="text-sm">{answer.text}</p>
                                    {/* FIX: Use `answer.author` from the mapped object instead of a non-existent `author` variable. */}
                                    <p className="text-xs text-gray-600 text-right"> - {answer.author}</p>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 pt-2">
                                <input type="text" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder={currentCopy.addAnswer} className="flex-grow border p-2 text-sm rounded-lg"/>
                                <VoiceInputButton onTranscript={setNewAnswer} language={language} />
                                <button className="bg-brand-green-dark text-white font-bold px-3 py-2 rounded-lg text-sm">{currentCopy.submit}</button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

const MarketHub: React.FC<{ language: Language, location: Location | null }> = ({ language, location }) => {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentCopy = copy[language];

    const handleGetReport = async () => {
        if (!location) return;
        setIsLoading(true);
        setReport('');
        const prompt = `You are a market analyst for Indian farmers in ${location.city}, ${location.country}. Using Google Search, find the current market demand and average selling prices for the top 5 most profitable crops in this region. Present this as a simple table with columns: Crop, Demand (High/Medium/Low), and Avg. Price (per Quintal).`;
        const result = await geminiService.generateText(prompt, true);
        setReport(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><MarketIcon /> {currentCopy.marketHub}</h3>
            <p className="text-sm text-gray-600 mb-4">{currentCopy.marketReportDesc}</p>
            <button onClick={handleGetReport} disabled={isLoading || !location} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark transition-colors disabled:bg-gray-400">
                {isLoading ? currentCopy.generating : currentCopy.marketReport}
            </button>
            {report && <div className="mt-4 p-4 bg-gray-50 rounded-md border whitespace-pre-wrap font-mono">{report}</div>}
        </div>
    );
};

const Certificate: React.FC<{ moduleTitle: string; language: Language; farmerName: string }> = ({ moduleTitle, language, farmerName }) => {
    const currentCopy = copy[language];
    const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-300 p-8 rounded-lg shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat bg-center opacity-5" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
            <div className="relative z-10">
                <CertificateIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold text-brand-brown">{currentCopy.certificateOfCompletion}</h3>
                <p className="text-gray-600 mt-4">{currentCopy.awardedTo}</p>
                <p className="text-3xl font-semibold text-brand-green-dark my-2">{farmerName}</p>
                <p className="text-gray-600">{currentCopy.hasCompleted}</p>
                <p className="text-xl font-bold text-brand-brown mt-1">"{moduleTitle}"</p>
                <p className="text-sm text-gray-500 mt-6">{currentCopy.onDate} {today}</p>
            </div>
        </div>
    );
};


const TrainingModule: React.FC<{
    module: { id: string, title: string };
    language: Language;
    farmerName: string;
    onBack: () => void;
}> = ({ module, language, farmerName, onBack }) => {
    const [content, setContent] = useState('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState({ content: true, quiz: true });
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const currentCopy = copy[language];

    useEffect(() => {
        const fetchContent = async () => {
            const prompt = `Generate a short and simple explanation of "${module.title}" for a beginner farmer. Use simple language. The language should be ${language === 'hi' ? 'Hindi' : 'English'}.`;
            const result = await geminiService.generateText(prompt, false);
            setContent(result);
            setIsLoading(prev => ({ ...prev, content: false }));
        };

        const fetchQuiz = async () => {
            const prompt = `Create a 2-question multiple-choice quiz about "${module.title}" for a farmer. Ensure the language is very simple. Provide the output as a JSON object with this exact structure: { "questions": [ { "question": "...", "options": ["...", "...", "..."], "correctAnswer": "..." } ] }. The questions and options should be in ${language === 'hi' ? 'Hindi' : 'English'}.`;
            try {
                const result = await geminiService.generateJson(prompt);
                const parsedResult = JSON.parse(result);
                if (parsedResult.questions) {
                    setQuiz(parsedResult.questions);
                }
            } catch (error) {
                console.error("Failed to parse quiz JSON:", error);
            }
            setIsLoading(prev => ({ ...prev, quiz: false }));
        };

        fetchContent();
        fetchQuiz();
    }, [module.id, module.title, language]);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmitQuiz = () => {
        let currentScore = 0;
        quiz.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                currentScore++;
            }
        });
        setScore(currentScore);
        setIsSubmitted(true);
    };

    const passedQuiz = score !== null && score >= quiz.length * 0.8; // Pass if 80% correct

    return (
        <div>
            <button onClick={onBack} className="text-brand-green-dark hover:underline mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {currentCopy.backToModules}
            </button>
            <h3 className="text-2xl font-bold text-brand-brown mb-4">{module.title}</h3>
            
            {isLoading.content ? <p>{currentCopy.generatingContent}</p> : <div className="bg-gray-50 p-4 rounded-lg mb-6 whitespace-pre-wrap">{content}</div>}

            {passedQuiz ? (
                <Certificate moduleTitle={module.title} language={language} farmerName={farmerName}/>
            ) : (
                <>
                    {!isLoading.content && !showQuiz && (
                        <button onClick={() => setShowQuiz(true)} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark">
                            {currentCopy.takeQuiz}
                        </button>
                    )}

                    {showQuiz && (
                        <div>
                             <h4 className="text-xl font-bold text-brand-green-dark mb-4">{currentCopy.quiz}</h4>
                            {isLoading.quiz ? <p>{currentCopy.generatingQuiz}</p> : (
                                <div className="space-y-6">
                                    {quiz.map((q, qIndex) => (
                                        <div key={qIndex} className={`p-4 rounded-lg ${isSubmitted ? (userAnswers[qIndex] === q.correctAnswer ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500') : 'bg-white border'}`}>
                                            <p className="font-semibold mb-2">{q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((option, oIndex) => (
                                                    <label key={oIndex} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`question-${qIndex}`}
                                                            value={option}
                                                            checked={userAnswers[qIndex] === option}
                                                            onChange={() => handleAnswerChange(qIndex, option)}
                                                            disabled={isSubmitted}
                                                            className="form-radio h-4 w-4 text-brand-green focus:ring-brand-green"
                                                        />
                                                        <span className="ml-3 text-gray-700">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {isSubmitted && (
                                                <div className="mt-2 text-sm font-bold">
                                                    {userAnswers[qIndex] === q.correctAnswer ? (
                                                        <p className="text-green-700">{currentCopy.correct}</p>
                                                    ) : (
                                                        <p className="text-red-700">{currentCopy.incorrect} ({currentCopy.correctAnswerIs}: {q.correctAnswer})</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {!isSubmitted && (
                                        <button onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length !== quiz.length} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark disabled:bg-gray-400">
                                            {currentCopy.submitQuiz}
                                        </button>
                                    )}
                                    {isSubmitted && !passedQuiz && (
                                        <div className="text-center p-4 bg-red-100 rounded-lg">
                                            <p className="font-bold text-red-800">{currentCopy.yourScore}: {score}/{quiz.length}</p>
                                            <p className="text-red-700">{currentCopy.tryAgain}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


const TrainingHub: React.FC<{ language: Language, farmerName: string }> = ({ language, farmerName }) => {
    const currentCopy = copy[language];
    const [activeModule, setActiveModule] = useState<{ id: string, title: string, desc: string } | null>(null);

    const modules = [
        { id: 'soil', title: currentCopy.module1Title, desc: currentCopy.module1Desc },
        { id: 'irrigation', title: currentCopy.module2Title, desc: currentCopy.module2Desc },
        { id: 'pest', title: currentCopy.module3Title, desc: currentCopy.module3Desc },
        { id: 'market', title: currentCopy.module4Title, desc: currentCopy.module4Desc },
        { id: 'rotation', title: currentCopy.module5Title, desc: currentCopy.module5Desc },
        { id: 'finance', title: currentCopy.module6Title, desc: currentCopy.module6Desc },
    ];
    
    if (activeModule) {
        return (
             <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                <TrainingModule module={activeModule} language={language} farmerName={farmerName} onBack={() => setActiveModule(null)} />
             </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-bold text-brand-brown mb-2 flex items-center"><TrainingIcon className="h-5 w-5 mr-2" /> {currentCopy.trainingHub}</h3>
            <p className="text-sm text-gray-600 mb-4">{currentCopy.trainingDesc}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map(module => (
                    <div key={module.id} className="border p-4 rounded-lg flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <div>
                            <h4 className="font-bold text-brand-green-dark">{module.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{module.desc}</p>
                        </div>
                        <button onClick={() => setActiveModule(module)} className="mt-4 w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark text-sm">
                            {currentCopy.viewModule}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const KisanDostChat: React.FC<{ language: Language; onClose: () => void }> = ({ language, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([{ sender: 'system', text: copy[language].kisanDostIntro }]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentCopy = copy[language];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;
        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        const prompt = `You are 'Kisan-Dost,' a friendly agricultural expert. Answer all farmer questions in simple ${language === 'hi' ? 'Hindi' : 'English'}. You can answer questions about crop disease, pesticide prices, and government schemes. Use Google Search to find the most accurate and local information. Here is the user's question: ${userInput}`;
        
        const response = await geminiService.generateText(prompt, true);
        setMessages(prev => [...prev, { sender: 'ai', text: response }]);
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col">
                <header className="p-4 bg-brand-green text-white flex justify-between items-center rounded-t-lg">
                    <h3 className="font-bold text-lg">{currentCopy.kisanDost}</h3>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-green text-white' : 'bg-gray-200'} ${msg.sender === 'system' ? 'bg-yellow-100 text-yellow-800 text-center w-full' : ''}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-gray-500">{currentCopy.generating}</div>}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="p-4 border-t flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={currentCopy.chatPlaceholder}
                        className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
                        disabled={isLoading}
                    />
                    <VoiceInputButton onTranscript={setUserInput} language={language} />
                    <button onClick={handleSendMessage} disabled={isLoading} className="bg-brand-green text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-green-dark disabled:bg-gray-400">
                        {currentCopy.submit}
                    </button>
                </footer>
            </div>
        </div>
    );
};


const BadgesDisplay: React.FC<{ badges: string[], language: Language }> = ({ badges, language }) => {
    const currentCopy = copy[language];
    const badgeMap: {[key: string]: string} = {
        'Tech Savvy': currentCopy.techSavvy,
        'Profit Pro': currentCopy.profitPro,
        'Community Helper': currentCopy.communityHelper
    };

    if (badges.length === 0) return null;

    return (
        <div className="flex items-center space-x-2">
            {badges.map(badge => (
                <div key={badge} className="flex items-center bg-gray-100 rounded-full px-2 py-1" title={badgeMap[badge]}>
                    <BadgeIcon type={badge} />
                    <span className="text-xs font-semibold ml-1 hidden sm:inline">{badgeMap[badge]}</span>
                </div>
            ))}
        </div>
    );
};

const FarmerView: React.FC<{ 
    language: Language; 
    location: Location | null; 
    setLocation: (location: Location) => void;
    farmer: Farmer;
    onSaveProfit: (farmerId: string, profit: number) => void;
}> = ({ language, location, setLocation, farmer, onSaveProfit }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('advisor');
  const currentCopy = copy[language];
  
  const tabs = {
      advisor: currentCopy.advisorTab,
      market: currentCopy.marketTab,
      profit: currentCopy.profitTab,
      training: currentCopy.trainingTab,
      community: currentCopy.communityTab,
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h2 className="text-3xl font-bold text-brand-brown">{currentCopy.welcomeFarmer}</h2>
            <p className="text-sm text-gray-500">{farmer.name}</p>
        </div>
        <BadgesDisplay badges={farmer.badges} language={language}/>
      </div>

      <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {Object.entries(tabs).map(([key, value]) => (
                 <button key={key} onClick={() => setActiveTab(key)} className={`${activeTab === key ? 'border-brand-green text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                     {value}
                 </button> 
              ))}
          </nav>
      </div>
      
      <div>
        {activeTab === 'advisor' && (
            <div className="space-y-6">
                <WeatherWidget language={language} location={location} setLocation={setLocation} />
                <CropAdvisor language={language} location={location}/>
                <DiagnosisTool language={language} />
            </div>
        )}
        {activeTab === 'market' && <MarketHub language={language} location={location} />}
        {activeTab === 'profit' && <ProfitLedger language={language} farmerId={farmer.id} onSaveProfit={onSaveProfit} />}
        {activeTab === 'training' && <TrainingHub language={language} farmerName={farmer.name} />}
        {activeTab === 'community' && <CommunityHub language={language} />}
      </div>
       <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-green-dark text-white p-4 rounded-full shadow-lg hover:bg-brand-green transition-transform hover:scale-110"
        aria-label={currentCopy.kisanDost}>
          <ChatIcon className="h-6 w-6 text-white"/>
      </button>
      {isChatOpen && <KisanDostChat language={language} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};


const FarmerDetailModal: React.FC<{ farmer: Farmer | null; onClose: () => void; language: Language }> = ({ farmer, onClose, language }) => {
  if (!farmer) return null;
  const currentCopy = copy[language];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <header className="p-4 bg-gray-100 border-b flex justify-between items-center rounded-t-lg">
          <h3 className="font-bold text-lg text-brand-brown">{currentCopy.farmerDetails}</h3>
          <button onClick={onClose} className="text-2xl font-bold text-gray-600">&times;</button>
        </header>
        <main className="p-6 space-y-4">
          <div>
            <h4 className="font-bold">{farmer.name}</h4>
            <p className="text-sm text-gray-500">{farmer.location} - {farmer.currentCrop}</p>
            <div className="mt-2"><BadgesDisplay badges={farmer.badges} language={language} /></div>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-brand-green-dark">{currentCopy.aiTrainingEngagement}</h5>
            <p className="text-sm text-gray-700">{currentCopy.engagementText(farmer.name, farmer.diagnosisCount)}</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-brand-green-dark">{currentCopy.performanceAlignment}</h5>
            <p className="text-sm text-gray-700">{currentCopy.alignmentText(farmer.name)}</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-brand-green-dark">{currentCopy.sentimentAnalysis}</h5>
            <p className="text-sm text-gray-700">{currentCopy.sentimentText}</p>
          </div>
        </main>
        <footer className="p-4 bg-gray-50 text-right rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark">{currentCopy.close}</button>
        </footer>
      </div>
    </div>
  );
};

// --- HR VIEW V2 COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div className="p-3 bg-brand-light rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-brown">{value}</p>
        </div>
    </div>
);

const ProfitVsTrainingChart: React.FC<{ farmers: Farmer[], language: Language }> = ({ farmers, language }) => {
    const currentCopy = copy[language];

    const chartBuckets = [
        { range: '0-25%', totalProfit: 0, count: 0 },
        { range: '26-50%', totalProfit: 0, count: 0 },
        { range: '51-75%', totalProfit: 0, count: 0 },
        { range: '76-100%', totalProfit: 0, count: 0 },
    ];

    farmers.forEach(farmer => {
        const { aiTrainingProgress: progress, reportedProfit: profit } = farmer;
        if (progress >= 0 && progress <= 25) {
            chartBuckets[0].totalProfit += profit;
            chartBuckets[0].count++;
        } else if (progress > 25 && progress <= 50) {
            chartBuckets[1].totalProfit += profit;
            chartBuckets[1].count++;
        } else if (progress > 50 && progress <= 75) {
            chartBuckets[2].totalProfit += profit;
            chartBuckets[2].count++;
        } else { // 76-100
            chartBuckets[3].totalProfit += profit;
            chartBuckets[3].count++;
        }
    });

    const chartData = chartBuckets.map(bucket => ({
        range: bucket.range,
        avgProfit: bucket.count > 0 ? Math.round(bucket.totalProfit / bucket.count) : 0,
    }));

    const maxAvgProfit = Math.max(...chartData.map(d => d.avgProfit), 1); // Use 1 to avoid division by zero if all profits are 0

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-brown mb-1">{currentCopy.profitVsTrainingChart}</h3>
            <p className="text-sm text-gray-500 mb-6">{`${currentCopy.reportedProfit} vs. ${currentCopy.aiTraining}`}</p>
            <div className="h-64 flex items-end justify-around gap-4 relative border-l border-b border-gray-200 pl-4 pb-8">
                 {/* Y-axis Label */}
                <span className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-500 whitespace-nowrap">{currentCopy.reportedProfit}</span>
                {/* X-axis Label */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-gray-500 mt-2">{currentCopy.aiTraining} (%)</span>

                {chartData.map((data, index) => (
                    <div key={index} className="flex-1 h-full flex flex-col items-center justify-end">
                         <div 
                            className="w-3/4 bg-brand-green hover:bg-brand-green-dark transition-colors rounded-t-md relative group"
                            style={{ height: `${(data.avgProfit / maxAvgProfit) * 100}%` }}
                            aria-label={`Training progress ${data.range}: Average profit ₹${data.avgProfit.toLocaleString()}`}
                         >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
                                ₹{data.avgProfit.toLocaleString()}
                            </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-2 absolute -bottom-6">{data.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HRDashboardOverview: React.FC<{ farmers: Farmer[], language: Language }> = ({ farmers, language }) => {
    const currentCopy = copy[language];
    const totalFarmers = farmers.length;
    const avgTraining = totalFarmers > 0 ? Math.round(farmers.reduce((acc, f) => acc + f.aiTrainingProgress, 0) / totalFarmers) : 0;
    const avgProfit = totalFarmers > 0 ? Math.round(farmers.reduce((acc, f) => acc + f.reportedProfit, 0) / totalFarmers) : 0;
    
    // Mock regions data
    const regions = {
        North: farmers.filter(f => f.region === 'North').length,
        West: farmers.filter(f => f.region === 'West').length,
        Central: farmers.filter(f => f.region === 'Central').length,
        East: farmers.filter(f => f.region === 'East').length,
        South: farmers.filter(f => f.region === 'South').length,
    };
    const maxFarmersInRegion = Math.max(...Object.values(regions));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={currentCopy.kpiTotalFarmers} value={totalFarmers.toString()} icon={<UsersIcon className="h-6 w-6 text-brand-green-dark"/>} />
                <KpiCard title={currentCopy.kpiAvgTraining} value={`${avgTraining}%`} icon={<TrainingIcon className="h-6 w-6 text-brand-green-dark"/>} />
                <KpiCard title={currentCopy.kpiAvgProfit} value={`₹${(avgProfit / 1000).toFixed(1)}k`} icon={<RupeeIcon className="h-6 w-6 text-brand-green-dark"/>} />
                <KpiCard title={currentCopy.kpiMostActive} value="Arjun Singh" icon={<SparklesIcon className="h-6 w-6 text-brand-green-dark w-6 h-6"/>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
                     <h3 className="text-lg font-bold text-brand-brown mb-4">{currentCopy.mapTitle}</h3>
                     <div className="aspect-video bg-gray-100 rounded-lg p-4 flex justify-center items-center">
                         <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2">
                             {Object.entries(regions).map(([region, count]) => {
                                 const opacity = maxFarmersInRegion > 0 ? (count / maxFarmersInRegion) * 0.8 + 0.2 : 0.2;
                                 return (
                                     <div key={region} title={`${region}: ${count} farmers`} className="bg-brand-green flex justify-center items-center rounded-md text-white text-xs font-bold" style={{ opacity }}>
                                         {region}
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                     <h3 className="text-lg font-bold text-brand-brown mb-4">{currentCopy.activityFeed}</h3>
                     <ul className="space-y-3 text-sm">
                         <li className="flex items-start"><UsersIcon className="h-4 w-4 mr-2 mt-1 text-green-500"/><p><span className="font-semibold">Gopal Reddy</span> joined the network from Andhra Pradesh.</p></li>
                         <li className="flex items-start"><BrainIcon className="h-4 w-4 mr-2 mt-1 text-blue-500"/><p><span className="font-semibold">Sita Devi</span> used the AI diagnosis tool.</p></li>
                         <li className="flex items-start"><RupeeIcon className="h-4 w-4 mr-2 mt-1 text-yellow-500"/><p><span className="font-semibold">Ramesh Kumar</span> logged a new profit of ₹15,200.</p></li>
                     </ul>
                </div>
            </div>
            <ProfitVsTrainingChart farmers={farmers} language={language} />
        </div>
    );
};

const FarmerManagement: React.FC<{ farmers: Farmer[], language: Language, onSelectFarmer: (f: Farmer) => void }> = ({ farmers, language, onSelectFarmer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const currentCopy = copy[language];
    
    const filteredFarmers = farmers
        .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(f => regionFilter === 'All' || f.region === regionFilter);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex w-full md:w-1/3 items-center gap-2">
                    <input type="text" placeholder={currentCopy.searchFarmer} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border p-2 rounded-lg"/>
                    <VoiceInputButton onTranscript={setSearchTerm} language={language} />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{currentCopy.filterBy}:</label>
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="border p-2 rounded-lg text-sm">
                        <option value="All">{currentCopy.allRegions}</option>
                        <option value="North">North</option>
                        <option value="West">West</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="Central">Central</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Profit (₹)</th>
                            <th className="p-3">Training (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFarmers.map(farmer => (
                             <tr key={farmer.id} onClick={() => onSelectFarmer(farmer)} className="border-b hover:bg-gray-50 cursor-pointer">
                                <td className="p-3 font-medium text-brand-green-dark">{farmer.name}</td>
                                <td className="p-3">{farmer.location}</td>
                                <td className="p-3 font-semibold text-green-700">{farmer.reportedProfit.toLocaleString()}</td>
                                <td className="p-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-brand-green h-2.5 rounded-full" style={{ width: `${farmer.aiTrainingProgress}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TrainingInsights: React.FC<{ language: Language }> = ({ language }) => {
    const [stats, setStats] = useState<any>(null);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentCopy = copy[language];
    
    useEffect(() => {
        firebaseService.getTrainingStats(setStats);
    }, []);
    
    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const prompt = `You are an HR analyst for an agri-tech company. Our app has training modules for farmers. Based on simulated farmer queries, we've found common questions are: "How to use less water for my crop?", "What is the best fertilizer for sandy soil?", and "When is the right time to sell sugarcane?". Based on these queries, summarize the top 3 topics where farmers need more detailed training. Provide actionable recommendations for our T&D team.`;
        const result = await geminiService.generateText(prompt, false);
        setAnalysis(result);
        setIsLoading(false);
    }
    
    if (!stats) return <p>{currentCopy.loadingData}</p>;
    
    const modules = [
        { id: 'soil', title: currentCopy.module1Title, data: stats.soil },
        { id: 'irrigation', title: currentCopy.module2Title, data: stats.irrigation },
        { id: 'pest', title: currentCopy.module3Title, data: stats.pest },
        { id: 'market', title: currentCopy.module4Title, data: stats.market },
    ];
    const maxStarted = Math.max(...modules.map(m => m.data.started));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-brand-brown mb-4">{currentCopy.moduleEngagement}</h3>
                <div className="space-y-4">
                    {modules.map(module => (
                        <div key={module.id}>
                            <p className="text-sm font-semibold">{module.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-blue-300 h-4 rounded-full" style={{ width: `${(module.data.started / maxStarted) * 100}%`}}>
                                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(module.data.completed / module.data.started) * 100}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-xs w-16 text-right">{module.data.completed} / {module.data.started}</span>
                            </div>
                        </div>
                    ))}
                    <div className="flex text-xs gap-4"><span className="flex items-center"><div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>{currentCopy.completed}</span><span className="flex items-center"><div className="h-2 w-2 bg-blue-300 rounded-full mr-1"></div>{currentCopy.started}</span></div>
                </div>
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-brand-brown mb-4">{currentCopy.aiTrainingAnalysis}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentCopy.trainingAnalysisPrompt}</p>
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark disabled:bg-gray-400">
                    {isLoading ? currentCopy.generating : currentCopy.analyzeQueries}
                </button>
                {analysis && <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">{analysis}</div>}
             </div>
        </div>
    );
};

const CommunityHealth: React.FC<{ language: Language }> = ({ language }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentCopy = copy[language];
    
    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        const prompt = `You are a community manager for an agri-tech platform. Here are some recent posts from our farmer community: "What is this bug on my cotton plant?", "My wheat yield was low this year, any tips?", "Neem oil spray worked for my mealybug problem. Thanks Ramesh!". Analyze these posts and provide a summary covering: 1. Top trending topic/concern. 2. Overall community sentiment (e.g., helpful, anxious). 3. Identify any emerging community leaders.`;
        const result = await geminiService.generateText(prompt, false);
        setAnalysis(result);
        setIsLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title={currentCopy.totalPosts} value="1" icon={<UsersIcon className="h-6 w-6 text-brand-green-dark"/>} />
                <KpiCard title={currentCopy.unansweredQuestions} value="0" icon={<ChatIcon className="h-6 w-6 text-brand-green-dark"/>} />
                <KpiCard title={currentCopy.topContributor} value="Ramesh K." icon={<SparklesIcon className="h-6 w-6 text-brand-green-dark"/>} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <h3 className="text-lg font-bold text-brand-brown mb-4">{currentCopy.aiCommunityAnalysis}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentCopy.communityAnalysisPrompt}</p>
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-green-dark disabled:bg-gray-400">
                    {isLoading ? currentCopy.generating : currentCopy.analyzePosts}
                </button>
                {analysis && <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm whitespace-pre-wrap">{analysis}</div>}
            </div>
        </div>
    )
};


const HRView: React.FC<{ language: Language, farmers: Farmer[] }> = ({ language, farmers }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentCopy = copy[language];
  
  const tabs = {
      dashboard: currentCopy.hrTabDashboard,
      farmers: currentCopy.hrTabFarmers,
      training: currentCopy.hrTabTraining,
      community: currentCopy.hrTabCommunity,
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-full">
      <h2 className="text-3xl font-bold text-brand-brown mb-4">{currentCopy.hrDashboardTitle}</h2>
      
      <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
               {Object.entries(tabs).map(([key, value]) => (
                 <button key={key} onClick={() => setActiveTab(key)} className={`${activeTab === key ? 'border-brand-green text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium`}>
                     {value}
                 </button> 
              ))}
          </nav>
      </div>
      
      {isLoading ? (
        <p>{currentCopy.loadingData}</p>
      ) : farmers.length === 0 ? (
        <p>{currentCopy.noData}</p>
      ) : (
        <div>
            {activeTab === 'dashboard' && <HRDashboardOverview farmers={farmers} language={language} />}
            {activeTab === 'farmers' && <FarmerManagement farmers={farmers} language={language} onSelectFarmer={setSelectedFarmer}/>}
            {activeTab === 'training' && <TrainingInsights language={language}/>}
            {activeTab === 'community' && <CommunityHealth language={language}/>}
        </div>
      )}

      <FarmerDetailModal farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} language={language} />
    </div>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedRole, setSelectedRole] = useState<View | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    // Fetch initial farmer data
    const unsubscribe = firebaseService.getFarmers((data) => {
      setFarmers(data);
      setIsDataLoading(false);
    });
    
    // Fetch location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = await getCityFromCoords(latitude, longitude);
          setLocation(userLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation({ city: "Mumbai", country: "India" });
        }
      );
    } else {
      console.error("Geolocation is not available.");
      setLocation({ city: "Mumbai", country: "India" });
    }
    
    return () => unsubscribe();
  }, []);
  
  const handleLogout = () => {
    setSelectedRole(null);
    setIsAuthenticated(false);
  };
  
  const handleUpdateProfit = (farmerId: string, newProfit: number) => {
      setFarmers(prevFarmers => 
          prevFarmers.map(farmer => 
              farmer.id === farmerId ? { ...farmer, reportedProfit: newProfit } : farmer
          )
      );
  };

  if (!selectedRole) {
    return <RoleSelectionScreen setSelectedRole={setSelectedRole} language={language} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen
      role={selectedRole}
      onLoginSuccess={() => setIsAuthenticated(true)}
      onBack={() => setSelectedRole(null)}
      language={language}
    />
  }

  // A logged-in farmer is assumed to be the first one in the list for this simulation
  const currentFarmer = farmers[0];

  return (
    <div className="min-h-screen bg-brand-light font-sans">
      <Header language={language} setLanguage={setLanguage} handleLogout={handleLogout} />
      <main>
        {isDataLoading ? <p className="text-center p-8">{copy[language].loadingData}</p> : (
            selectedRole === 'farmer' && currentFarmer ? (
              <FarmerView 
                language={language} 
                location={location} 
                setLocation={setLocation}
                farmer={currentFarmer}
                onSaveProfit={handleUpdateProfit} 
               />
            ) : (
              <HRView language={language} farmers={farmers} />
            )
        )}
      </main>
    </div>
  );
}
