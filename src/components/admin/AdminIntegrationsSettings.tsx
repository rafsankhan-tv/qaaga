import React, { useState } from 'react';
import {
  Plug,
  Bot,
  Cpu,
  MessageSquare,
  CreditCard,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
  Info,
  Server,
  Key,
  ExternalLink
} from 'lucide-react';
import { OptionalIntegrationsSettings, PlatformSystemSettings } from '../../types';
import { marketplaceStore } from '../../services/marketplaceStore';
import { DEFAULT_OPTIONAL_INTEGRATIONS } from '../../data/mockSeedData';

interface AdminIntegrationsSettingsProps {
  settings: PlatformSystemSettings;
}

export const AdminIntegrationsSettings: React.FC<AdminIntegrationsSettingsProps> = ({ settings }) => {
  const [integrations, setIntegrations] = useState<OptionalIntegrationsSettings>(() => {
    return {
      ...DEFAULT_OPTIONAL_INTEGRATIONS,
      ...(settings.integrations || {})
    };
  });

  const [filterCategory, setFilterCategory] = useState<'all' | 'ai' | 'payments' | 'sms' | 'infrastructure'>('all');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const toggleShowSecret = (fieldKey: string) => {
    setShowSecrets((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleSave = () => {
    marketplaceStore.updateIntegrations(integrations);
    setSaveSuccessMsg('Integrations settings successfully updated!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all optional integrations to default state (all disabled)?')) {
      setIntegrations({ ...DEFAULT_OPTIONAL_INTEGRATIONS });
      marketplaceStore.updateIntegrations({ ...DEFAULT_OPTIONAL_INTEGRATIONS });
      setSaveSuccessMsg('All optional integrations reset to disabled default state.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Count active integrations
  const activeCount = [
    integrations.gemini?.enabled,
    integrations.fastapiAiService?.enabled,
    integrations.smsGateway?.enabled,
    integrations.bkashPayment?.enabled,
    integrations.nagadPayment?.enabled,
    integrations.sslcommerz?.enabled,
    integrations.stripe?.enabled,
    integrations.cloudStorage?.enabled,
    integrations.redis?.enabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Plug size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">External Integrations & APIs</h3>
                <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Optional Services
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                All external integrations are <strong className="text-amber-300">disabled by default</strong> to ensure smooth startup. You can enable and configure each service individually whenever you require third-party capabilities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToDefaults}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Reset all integrations to disabled defaults"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Integrations</div>
            <div className="text-xl font-black text-white mt-0.5">
              {activeCount} <span className="text-xs font-normal text-slate-400">/ 9 configured</span>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Default Status</div>
            <div className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1">
              <Shield size={12} />
              <span>Disabled by Default</span>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Architecture Mode</div>
            <div className="text-xs font-bold text-indigo-300 mt-1 flex items-center gap-1">
              <Zap size={12} />
              <span>Lazy & In-Process Safe</span>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Startup Requirement</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>5 Core Vars Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'all', label: `All Integrations (9)` },
          { id: 'ai', label: `AI & Intelligence (2)` },
          { id: 'payments', label: `Payment Gateways & MFS (4)` },
          { id: 'sms', label: `SMS & Alerts (1)` },
          { id: 'infrastructure', label: `Cloud & Caching (2)` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Google Gemini AI */}
        {(filterCategory === 'all' || filterCategory === 'ai') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google Gemini AI Engine</h4>
                  <p className="text-[11px] text-slate-500">Smart Bengali assistant (Suchi & Cute Cat) & diagnostics</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.gemini?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      gemini: { ...integrations.gemini, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.gemini?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.gemini?.enabled ? 'Active (Enabled)' : 'Disabled (Default)'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gemini API Key:</label>
                <div className="relative">
                  <input
                    type={showSecrets['gemini_key'] ? 'text' : 'password'}
                    placeholder="AIzaSy... (leave empty to use server env if provided)"
                    value={integrations.gemini?.apiKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        gemini: { ...integrations.gemini, apiKey: e.target.value }
                      })
                    }
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('gemini_key')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['gemini_key'] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Alias:</label>
                  <select
                    value={integrations.gemini?.model || 'gemini-2.5-flash'}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        gemini: { ...integrations.gemini, model: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Recommended)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Multimodal)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={integrations.gemini?.temperature ?? 0.7}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        gemini: { ...integrations.gemini, temperature: Number(e.target.value) }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FastAPI AI Microservice */}
        {(filterCategory === 'all' || filterCategory === 'ai') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">FastAPI AI Microservice</h4>
                  <p className="text-[11px] text-slate-500">Internal dedicated Python AI service runner</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.fastapiAiService?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      fastapiAiService: { ...integrations.fastapiAiService, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.fastapiAiService?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.fastapiAiService?.enabled ? 'Active (Enabled)' : 'Disabled (Default)'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Microservice Base URL:</label>
                <input
                  type="text"
                  placeholder="http://localhost:8000"
                  value={integrations.fastapiAiService?.serviceUrl || ''}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      fastapiAiService: { ...integrations.fastapiAiService, serviceUrl: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Secret Key (Auth):</label>
                <div className="relative">
                  <input
                    type={showSecrets['fastapi_secret'] ? 'text' : 'password'}
                    placeholder="Shared secret matching AI_SERVICE_SECRET_KEY"
                    value={integrations.fastapiAiService?.secretKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        fastapiAiService: { ...integrations.fastapiAiService, secretKey: e.target.value }
                      })
                    }
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('fastapi_secret')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['fastapi_secret'] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Bangladesh Bulk SMS Gateway */}
        {(filterCategory === 'all' || filterCategory === 'sms') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bangladesh SMS Gateway</h4>
                  <p className="text-[11px] text-slate-500">OTP verification, order updates & booking alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.smsGateway?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      smsGateway: { ...integrations.smsGateway, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.smsGateway?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.smsGateway?.enabled ? 'Active (Enabled)' : 'Disabled (Default)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provider:</label>
                  <select
                    value={integrations.smsGateway?.provider || 'greenweb'}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        smsGateway: { ...integrations.smsGateway, provider: e.target.value as any }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="greenweb">Greenweb Bangladesh</option>
                    <option value="elitbuzz">ElitBuzz SMS</option>
                    <option value="alphanet">Alpha Net BD</option>
                    <option value="custom">Custom HTTP Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sender ID / Masking:</label>
                  <input
                    type="text"
                    placeholder="QAAGA"
                    value={integrations.smsGateway?.senderId || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        smsGateway: { ...integrations.smsGateway, senderId: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Key / Token:</label>
                <div className="relative">
                  <input
                    type={showSecrets['sms_key'] ? 'text' : 'password'}
                    placeholder="Enter Gateway API Key"
                    value={integrations.smsGateway?.apiKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        smsGateway: { ...integrations.smsGateway, apiKey: e.target.value }
                      })
                    }
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('sms_key')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['sms_key'] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. bKash Merchant Payment Gateway */}
        {(filterCategory === 'all' || filterCategory === 'payments') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">bKash Direct PG (Tokenized)</h4>
                  <p className="text-[11px] text-slate-500">1-click direct bKash checkout for orders & advance</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.bkashPayment?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      bkashPayment: { ...integrations.bkashPayment, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.bkashPayment?.isSandbox ?? true}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          bkashPayment: { ...integrations.bkashPayment, isSandbox: e.target.checked }
                        })
                      }
                      className="rounded text-pink-600"
                    />
                    <span>Sandbox Mode</span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.bkashPayment?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {integrations.bkashPayment?.enabled ? 'Active' : 'Disabled (Default)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">App Key:</label>
                  <input
                    type="text"
                    placeholder="bKash App Key"
                    value={integrations.bkashPayment?.appKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        bkashPayment: { ...integrations.bkashPayment, appKey: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">App Secret:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['bkash_secret'] ? 'text' : 'password'}
                      placeholder="App Secret"
                      value={integrations.bkashPayment?.appSecret || ''}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          bkashPayment: { ...integrations.bkashPayment, appSecret: e.target.value }
                        })
                      }
                      className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret('bkash_secret')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['bkash_secret'] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merchant Username:</label>
                  <input
                    type="text"
                    placeholder="Merchant User"
                    value={integrations.bkashPayment?.username || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        bkashPayment: { ...integrations.bkashPayment, username: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password:</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={integrations.bkashPayment?.password || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        bkashPayment: { ...integrations.bkashPayment, password: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Nagad Payment Gateway */}
        {(filterCategory === 'all' || filterCategory === 'payments') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nagad Payment Gateway</h4>
                  <p className="text-[11px] text-slate-500">Direct Nagad PG API checkout</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.nagadPayment?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      nagadPayment: { ...integrations.nagadPayment, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.nagadPayment?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.nagadPayment?.enabled ? 'Active' : 'Disabled (Default)'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Merchant ID:</label>
                <input
                  type="text"
                  placeholder="Nagad Merchant ID"
                  value={integrations.nagadPayment?.merchantId || ''}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      nagadPayment: { ...integrations.nagadPayment, merchantId: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PG Public Key:</label>
                  <textarea
                    rows={2}
                    placeholder="MIIBIjANBgkqhkiG9w0BAQE..."
                    value={integrations.nagadPayment?.publicKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        nagadPayment: { ...integrations.nagadPayment, publicKey: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merchant Private Key:</label>
                  <textarea
                    rows={2}
                    placeholder="MIIEowIBAAKCAQEA..."
                    value={integrations.nagadPayment?.privateKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        nagadPayment: { ...integrations.nagadPayment, privateKey: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SSLCommerz Gateway */}
        {(filterCategory === 'all' || filterCategory === 'payments') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">SSLCommerz Gateway</h4>
                  <p className="text-[11px] text-slate-500">Debit / Credit cards, Net Banking & all BD wallets</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.sslcommerz?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      sslcommerz: { ...integrations.sslcommerz, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.sslcommerz?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.sslcommerz?.enabled ? 'Active' : 'Disabled (Default)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store ID:</label>
                  <input
                    type="text"
                    placeholder="qaaga_live"
                    value={integrations.sslcommerz?.storeId || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        sslcommerz: { ...integrations.sslcommerz, storeId: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Password:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['ssl_pass'] ? 'text' : 'password'}
                      placeholder="Store Password"
                      value={integrations.sslcommerz?.storePassword || ''}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          sslcommerz: { ...integrations.sslcommerz, storePassword: e.target.value }
                        })
                      }
                      className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret('ssl_pass')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['ssl_pass'] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Stripe Payments */}
        {(filterCategory === 'all' || filterCategory === 'payments') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Stripe International Cards</h4>
                  <p className="text-[11px] text-slate-500">Global Visa, MasterCard, Amex & USD checkout</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.stripe?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      stripe: { ...integrations.stripe, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.stripe?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.stripe?.enabled ? 'Active' : 'Disabled (Default)'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publishable Key:</label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={integrations.stripe?.publishableKey || ''}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      stripe: { ...integrations.stripe, publishableKey: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secret Key:</label>
                <div className="relative">
                  <input
                    type={showSecrets['stripe_secret'] ? 'text' : 'password'}
                    placeholder="sk_test_..."
                    value={integrations.stripe?.secretKey || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        stripe: { ...integrations.stripe, secretKey: e.target.value }
                      })
                    }
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('stripe_secret')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['stripe_secret'] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Cloud Object Storage (S3 / R2) */}
        {(filterCategory === 'all' || filterCategory === 'infrastructure') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                  <Cloud size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cloud Object Storage (S3 / R2)</h4>
                  <p className="text-[11px] text-slate-500">eBook files, images & secure document uploads</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.cloudStorage?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      cloudStorage: { ...integrations.cloudStorage, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.cloudStorage?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.cloudStorage?.enabled ? 'Active' : 'Disabled (Default)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provider:</label>
                  <select
                    value={integrations.cloudStorage?.provider || 's3'}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        cloudStorage: { ...integrations.cloudStorage, provider: e.target.value as any }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="s3">Amazon Web Services (AWS S3)</option>
                    <option value="r2">Cloudflare R2 Storage</option>
                    <option value="gcs">Google Cloud Storage (GCS)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bucket Name:</label>
                  <input
                    type="text"
                    placeholder="qaaga-storage"
                    value={integrations.cloudStorage?.bucketName || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        cloudStorage: { ...integrations.cloudStorage, bucketName: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Key ID:</label>
                  <input
                    type="text"
                    placeholder="AKIA..."
                    value={integrations.cloudStorage?.accessKeyId || ''}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        cloudStorage: { ...integrations.cloudStorage, accessKeyId: e.target.value }
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secret Key:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['s3_secret'] ? 'text' : 'password'}
                      placeholder="Secret key"
                      value={integrations.cloudStorage?.secretAccessKey || ''}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          cloudStorage: { ...integrations.cloudStorage, secretAccessKey: e.target.value }
                        })
                      }
                      className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret('s3_secret')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['s3_secret'] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. Redis Distributed Caching */}
        {(filterCategory === 'all' || filterCategory === 'infrastructure') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Redis Distributed Caching & Jobs</h4>
                  <p className="text-[11px] text-slate-500">High-speed catalog cache & asynchronous background queue</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={integrations.redis?.enabled || false}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      redis: { ...integrations.redis, enabled: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${integrations.redis?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {integrations.redis?.enabled ? 'Active (Enabled)' : 'Disabled (Default - In-Memory Active)'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Redis Connection URL:</label>
                <input
                  type="text"
                  placeholder="redis://default:password@host:port or rediss://..."
                  value={integrations.redis?.connectionUrl || ''}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      redis: { ...integrations.redis, connectionUrl: e.target.value }
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Token / Auth Password:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['redis_token'] ? 'text' : 'password'}
                      placeholder="Optional Token"
                      value={integrations.redis?.token || ''}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          redis: { ...integrations.redis, token: e.target.value }
                        })
                      }
                      className="w-full p-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret('redis_token')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['redis_token'] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.redis?.useTls || false}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          redis: { ...integrations.redis, useTls: e.target.checked }
                        })
                      }
                      className="rounded text-rose-600"
                    />
                    <span className="font-bold text-slate-700">Enforce TLS / SSL</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleResetToDefaults}
          className="px-4 py-2.5 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Discard & Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Save size={15} />
          <span>Save Integrations Configuration</span>
        </button>
      </div>
    </div>
  );
};
