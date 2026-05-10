'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User, 
  Activity, 
  Database, 
  Globe, 
  Monitor, 
  Hash,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Info,
  Shield,
  Code,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Search,
  X
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getLogEntry } from "@/server/actions/audit-log";

// Types
type LogEntry = {
  id: string;
  timestamp: string;
  userId: string | null;
  action: string;
  details: string | null;
  tableName?: string;
  recordId?: string;
  ipAddress: string | null;
  userAgent: string | null;
};

type ParsedDetails = Record<string, any> | null;

// Constants
const ACTION_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  create: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Activity },
  insert: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Activity },
  update: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Activity },
  edit: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Activity },
  delete: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: Activity },
  remove: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: Activity },
  login: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield },
  auth: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield },
} as const;

const DEFAULT_ACTION_CONFIG = { 
  color: 'bg-gray-50 text-gray-700 border-gray-200', 
  icon: Activity 
};

// Utility functions
const formatTimestamp = (timestamp: string): { date: string; time: string } => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  };
};

const getActionConfig = (action: string) => {
  const actionLower = action.toLowerCase();
  return Object.entries(ACTION_CONFIG).find(([key]) => 
    actionLower.includes(key)
  )?.[1] ?? DEFAULT_ACTION_CONFIG;
};

const parseDetails = (details: string | null): ParsedDetails => {
  if (!details) return null;
  try {
    const parsed = JSON.parse(details);
    // Ensure we return an object, not an array or primitive
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return { value: parsed };
  } catch {
    // If JSON parsing fails, treat as plain text
    return { raw: details };
  }
};

// Helper function to safely format log ID
const formatLogId = (id: string | number | any): string => {
  const idStr = String(id);
  return idStr.length > 8 ? `${idStr.slice(0, 8)}...` : idStr;
};

// Helper to format value for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

// Components
const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
      aria-label={label || `Copy ${text}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600 animate-in fade-in duration-200" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

const DetailRow = ({ 
  icon: Icon, 
  label, 
  value, 
  copyable = false,
  highlight = false
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  copyable?: boolean;
  highlight?: boolean;
}) => {
  const displayValue = value ?? '—';
  const isMissing = !value;

  return (
    <div className={`
      group flex items-center gap-4 py-3.5 px-4 -mx-4 rounded-xl
      transition-all duration-200 hover:bg-gray-50
      ${highlight ? 'bg-blue-50/50 hover:bg-blue-50' : ''}
    `}>
      <div className={`
        flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0
        ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
        transition-colors group-hover:bg-gray-200
        ${highlight ? 'group-hover:bg-blue-200' : ''}
      `}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </p>
        <p className={`
          text-sm break-all leading-relaxed
          ${isMissing ? 'text-gray-300 italic' : 'text-gray-800 font-medium'}
        `}>
          {displayValue}
        </p>
      </div>
      {copyable && value && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={value} label={`Copy ${label.toLowerCase()}`} />
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ 
  title, 
  icon: Icon, 
  children,
  accentColor = 'blue'
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  accentColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
}) => {
  const accentStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  };

  const style = accentStyles[accentColor];

  return (
    <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${style.bg} ${style.border} border`}>
            <Icon className={`h-4 w-4 ${style.text}`} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 px-6">
        {children}
      </CardContent>
    </Card>
  );
};

// New improved DetailsViewer component
const DetailsViewer = ({ details, rawDetails }: { details: ParsedDetails; rawDetails: string }) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const filterDetails = (obj: ParsedDetails): ParsedDetails => {
    if (!searchTerm) return obj;
    if (!obj) return null;
    
    const filtered: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
      const stringValue = formatValue(value).toLowerCase();
      if (key.toLowerCase().includes(searchTerm.toLowerCase()) || 
          stringValue.includes(searchTerm.toLowerCase())) {
        filtered[key] = value;
      }
    });
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  const filteredDetails = filterDetails(details);
  const hasDetails = filteredDetails && Object.keys(filteredDetails).length > 0;

  const FullscreenModal = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Additional Details (Fullscreen)</h3>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );

  const DetailsContent = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'formatted' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5 inline mr-1.5" />
            Formatted View
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'raw' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="h-3.5 w-3.5 inline mr-1.5" />
            Raw JSON
          </button>
        </div>
        
        {viewMode === 'formatted' && (
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {viewMode === 'formatted' ? (
          <>
            {!hasDetails ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No matching details found</p>
                {searchTerm && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(filteredDetails!).map(([key, value]) => {
                  const isExpanded = expandedSections.has(key);
                  const displayValue = formatValue(value);
                  const isComplex = typeof value === 'object' && value !== null;
                  const lineCount = displayValue.split('\n').length;
                  const needsExpansion = isComplex && lineCount > 10;

                  return (
                    <div
                      key={key}
                      className="group border border-gray-100 rounded-xl hover:border-gray-200 transition-all bg-white"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={() => isComplex && toggleSection(key)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 mb-0.5">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                            </p>
                            {!isComplex && (
                              <p className="text-sm text-gray-600 break-all">
                                {displayValue.length > 100 ? `${displayValue.substring(0, 100)}...` : displayValue}
                              </p>
                            )}
                            {isComplex && (
                              <p className="text-xs text-gray-400">
                                {isExpanded ? 'Click to collapse' : 'Click to expand'} • {lineCount} lines
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isComplex && (
                            <CopyButton text={displayValue} label={`Copy ${key}`} />
                          )}
                          {isComplex && (
                            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          )}
                        </div>
                      </div>
                      
                      {isComplex && isExpanded && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                          <div className="relative">
                            <div className="absolute top-3 right-3 z-10">
                              <CopyButton text={displayValue} label={`Copy ${key} JSON`} />
                            </div>
                            <pre className="text-xs font-mono bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                              {displayValue}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton text={rawDetails} label="Copy raw JSON" />
            </div>
            <pre className="text-xs font-mono bg-gray-900 text-emerald-400 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isFullscreen ? (
        <FullscreenModal>
          <DetailsContent />
        </FullscreenModal>
      ) : (
        <DetailsContent />
      )}
    </>
  );
};

const LoadingState = () => (
  <section className="min-h-screen bg-gray-50 px-4 py-6">
    <div className="mx-auto">
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-gray-600 font-medium">Loading log entry</p>
          <p className="text-sm text-gray-400">Fetching audit data...</p>
        </div>
      </div>
    </div>
  </section>
);

const ErrorState = ({ error, onBack }: { error: string; onBack: () => void }) => (
  <section className="min-h-screen bg-gray-50 px-4 py-6">
    <div className="mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Audit Logs
      </Button>
      <Card className="border border-rose-200 bg-white shadow-sm">
        <CardContent className="pt-10 pb-10">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 bg-rose-50 rounded-xl border border-rose-100">
              <Info className="h-6 w-6 text-rose-500" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 font-semibold text-lg">{error}</p>
              <p className="text-sm text-gray-500">Please try again or contact support</p>
            </div>
            <Button onClick={onBack} variant="outline" className="mt-2">
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);

const LogDetails = ({ log }: { log: LogEntry }) => {
  const parsedDetails = parseDetails(log.details);
  const { date, time } = formatTimestamp(log.timestamp);
  const actionConfig = getActionConfig(log.action);
  const ActionIcon = actionConfig.icon;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <Badge className={`
              ${actionConfig.color} 
              px-3 py-1.5 text-xs font-semibold rounded-full 
              shadow-sm inline-flex items-center gap-1.5 border
            `}>
              <ActionIcon className="h-3.5 w-3.5" />
              {log.action}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Log Entry Details
            </h1>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{date}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={String(log.id)} label="Copy log ID" />
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              {formatLogId(log.id)}
            </span>
          </div>
        </div>
      </div>

      {/* Entry Information */}
      <SectionCard title="Entry Information" icon={Info} accentColor="blue">
        <DetailRow icon={Hash} label="Log ID" value={String(log.id)} copyable highlight />
        <DetailRow icon={Clock} label="Timestamp" value={`${date} ${time}`} />
        <DetailRow icon={User} label="User ID" value={log.userId} copyable />
        <DetailRow icon={Activity} label="Action Type" value={log.action} />
      </SectionCard>

      {/* Database Reference */}
      {(log.tableName || log.recordId) && (
        <SectionCard title="Database Reference" icon={Database} accentColor="emerald">
          <DetailRow icon={Database} label="Table Name" value={log.tableName || null} />
          <DetailRow icon={Hash} label="Record ID" value={log.recordId || null} copyable />
        </SectionCard>
      )}

      {/* Request Information */}
      <SectionCard title="Request Information" icon={Globe} accentColor="purple">
        <DetailRow icon={Globe} label="IP Address" value={log.ipAddress} copyable />
        <DetailRow icon={Monitor} label="User Agent" value={log.userAgent} />
      </SectionCard>

      {/* Additional Details - Improved Version */}
      {log.details && (
        <SectionCard title="Additional Details" icon={FileText} accentColor="amber">
          <DetailsViewer details={parsedDetails} rawDetails={log.details} />
        </SectionCard>
      )}
    </div>
  );
};

// Main Component
export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [state, setState] = useState<{
    log: LogEntry | null;
    loading: boolean;
    error: string | null;
  }>({
    log: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const { id } = await params;
        const logEntry = await getLogEntry(id);
        setState({ log: logEntry, loading: false, error: null });
      } catch (err) {
        setState({ 
          log: null, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Failed to load log entry'
        });
      }
    };

    fetchLog();
  }, [params]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (state.loading) {
    return <LoadingState />;
  }

  if (state.error || !state.log) {
    return <ErrorState error={state.error || 'Log entry not found'} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="group -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Audit Logs
          </Button>
        </div>
      </div>
      
      <section className="px-4 py-6">
        <div className="mx-auto">
          <LogDetails log={state.log} />
        </div>
      </section>
    </div>
  );
}