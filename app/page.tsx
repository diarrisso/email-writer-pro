'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Sparkles, User, Send, Copy, Check, History, Trash2, X, Clock } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/translations';

type Locale = 'en-US' | 'de-DE' | 'fr-FR';
type ToneValue = 'professional' | 'warm' | 'concise' | 'formal' | 'casual' | 'persuasive';

interface EmailHistoryItem {
  id: string;
  prompt: string;
  email: string;
  tone: ToneValue;
  language: Locale;
  timestamp: number;
}

export default function Home() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('de-DE');
  const t = (key: keyof typeof TRANSLATIONS['en-US']) => 
    TRANSLATIONS[currentLocale]?.[key] || TRANSLATIONS['en-US'][key] || key;

  const [rawThoughts, setRawThoughts] = useState('');
  const [tone, setTone] = useState<ToneValue>('professional');
  const [contextEmail, setContextEmail] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('email_history');
    if (savedHistory) {
      try {
        setEmailHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = (prompt: string, email: string) => {
    const newItem: EmailHistoryItem = {
      id: Date.now().toString(),
      prompt,
      email,
      tone,
      language: currentLocale,
      timestamp: Date.now(),
    };

    const updatedHistory = [newItem, ...emailHistory].slice(0, 20); // Keep only last 20
    setEmailHistory(updatedHistory);
    localStorage.setItem('email_history', JSON.stringify(updatedHistory));
  };

  // Load from history
  const loadFromHistory = (item: EmailHistoryItem) => {
    setRawThoughts(item.prompt);
    setGeneratedEmail(item.email);
    setTone(item.tone);
    setCurrentLocale(item.language);
    setShowHistory(false);
  };

  // Delete single item
  const deleteHistoryItem = (id: string) => {
    const updatedHistory = emailHistory.filter(item => item.id !== id);
    setEmailHistory(updatedHistory);
    localStorage.setItem('email_history', JSON.stringify(updatedHistory));
  };

  // Clear all history
  const clearHistory = () => {
    if (confirm('Möchten Sie wirklich den gesamten Verlauf löschen?')) {
      setEmailHistory([]);
      localStorage.removeItem('email_history');
    }
  };

  const tones: Array<{ value: ToneValue; label: string; description: string }> = [
    { value: 'professional', label: t('professionalTone'), description: t('professionalDescription') },
    { value: 'warm', label: t('warmTone'), description: t('warmDescription') },
    { value: 'concise', label: t('conciseTone'), description: t('conciseDescription') },
    { value: 'formal', label: t('formalTone'), description: t('formalDescription') },
    { value: 'casual', label: t('casualTone'), description: t('casualDescription') },
    { value: 'persuasive', label: t('persuasiveTone'), description: t('persuasiveDescription') }
  ];

  const generateEmail = async () => {
    if (!rawThoughts.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawThoughts,
          tone,
          contextEmail: contextEmail.trim() || null,
          language: currentLocale,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedEmail(data.generatedEmail);
      // Save to history
      saveToHistory(rawThoughts, data.generatedEmail);
    } catch (error) {
      console.error('Error generating email:', error);
      setGeneratedEmail('Sorry, there was an error generating your email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generateEmail();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `Vor ${diffMins} Min`;
    if (diffHours < 24) return `Vor ${diffHours} Std`;
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Language Selector & History Button */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/20 flex gap-2">
          <button
            onClick={() => setCurrentLocale('en-US')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentLocale === 'en-US'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => setCurrentLocale('fr-FR')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentLocale === 'fr-FR'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            🇫🇷 FR
          </button>
          <button
            onClick={() => setCurrentLocale('de-DE')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentLocale === 'de-DE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            🇩🇪 DE
          </button>
        </div>
        
        {/* History Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/20 hover:bg-white transition-all flex items-center gap-2 font-medium text-slate-700"
        >
          <History className="w-5 h-5" />
          Verlauf ({emailHistory.length})
        </button>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Email-Verlauf</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              
              {emailHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Gesamten Verlauf löschen
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {emailHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Noch keine E-Mails generiert</p>
                  <p className="text-slate-400 text-sm mt-2">Ihre Verlauf erscheint hier</p>
                </div>
              ) : (
                emailHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {formatDate(item.timestamp)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {item.tone}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                          {item.language}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        <strong>Prompt:</strong> {item.prompt}
                      </p>
                      
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {item.email.substring(0, 150)}...
                      </p>
                    </div>
                    
                    <button
                      onClick={() => loadFromHistory(item)}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Wiederverwenden
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Masinga Tech Branding */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-slate-800">Masinga Tech</h1>
                    <p className="text-sm text-slate-500">Email Writer Pro</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('transformThoughtsDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">{t('yourThoughts')}</h2>
              </div>
              
              <textarea
                value={rawThoughts}
                onChange={(e) => setRawThoughts(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('thoughtsPlaceholder')}
                className="w-full h-40 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 placeholder-slate-400"
              />
              
              <div className="mt-4 text-sm text-slate-500">
                {t('tipKeyboardShortcut')}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">{t('emailTone')}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {tones.map((toneOption) => (
                  <button
                    key={toneOption.value}
                    onClick={() => setTone(toneOption.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      tone === toneOption.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white/70'
                    }`}
                  >
                    <div className="font-medium text-slate-800">{toneOption.label}</div>
                    <div className="text-sm text-slate-600 mt-1">{toneOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Context Email Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">{t('contextOptional')}</h2>
                </div>
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {showContext ? t('hide') : t('show')}
                </button>
              </div>
              
              {showContext && (
                <>
                  <p className="text-slate-600 mb-4">
                    {t('contextDescription')}
                  </p>
                  <textarea
                    value={contextEmail}
                    onChange={(e) => setContextEmail(e.target.value)}
                    placeholder={t('contextPlaceholder')}
                    className="w-full h-32 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 placeholder-slate-400"
                  />
                </>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateEmail}
              disabled={isLoading || !rawThoughts.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('craftingEmail')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('generateEmail')}
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 min-h-96">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">{t('generatedEmail')}</h2>
                </div>
                
                {generatedEmail && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('copy')}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {generatedEmail ? (
                <div className="bg-white/80 rounded-xl p-6 border border-slate-200">
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                    {generatedEmail}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Mail className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">{t('emailWillAppearHere')}</p>
                  <p className="text-sm mt-2">{t('getStartedPrompt')}</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3">{t('proTips')}</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>{t('tipBeSpecific')}</li>
                <li>{t('tipIncludeDetails')}</li>
                <li>{t('tipTryTones')}</li>
                <li>{t('tipAddContext')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Masinga Tech branding */}
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-slate-500">
          Powered by <span className="font-semibold text-slate-700">Masinga Tech</span> | AI Email Assistant
        </p>
      </footer>
    </div>
  );
}
