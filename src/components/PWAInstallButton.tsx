import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Laptop
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, canShare, install, triggerShare } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'ios'; // Default to iOS so "Share -> Add to Home Screen" is immediately visible
  });
  const [copied, setCopied] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // If already running as an installed PWA on standalone screen, hide install controls
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (!success) {
        // If install was dismissed or not completed, show the visual guide
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleOpenShareMenu = async () => {
    if (canShare) {
      const ok = await triggerShare({
        title: 'Developer Portal',
        text: 'Developer Portal App - Tap Add to Home Screen',
        url: window.location.href,
      });
      if (ok) {
        setShareNotice('Native share sheet opened! Select "Add to Home Screen".');
        setTimeout(() => setShareNotice(null), 5000);
        return;
      }
    }
    // Fallback if share unavailable or dismissed
    handleCopyLink();
    setShareNotice('To install on iOS: Tap the Share button in Safari toolbar, then "Add to Home Screen"');
    setTimeout(() => setShareNotice(null), 5000);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Direct URL for developer portal
  const appUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/developer`
    : '/developer';

  return (
    <>
      {/* 1. Header Variant */}
      {variant === 'header' && (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInstallClick}
            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm hover:shadow transition-all cursor-pointer ${className}`}
            title="Install Developer Portal as Mobile / Desktop App"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Install Mobile App</span>
            <span className="sm:hidden">Install</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-[9px] rounded uppercase font-bold tracking-wider">PWA</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('ios');
              setShowGuideModal(true);
            }}
            className="hidden md:inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Share & Add to Home Screen Instructions"
          >
            <Share className="w-3 h-3 text-blue-400" />
            <span>Share Home Screen</span>
          </button>
        </div>
      )}

      {/* 2. Compact Variant */}
      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer ${className}`}
          title="Install or Add to Home Screen"
        >
          <Download className="w-3 h-3 text-blue-600" />
          <span>Install / Share App</span>
        </button>
      )}

      {/* 3. Button Variant */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-blue-200" />
          <span>{isInstalling ? 'Installing...' : 'Install Developer Portal App'}</span>
        </button>
      )}

      {/* 4. Banner Variant (shown on DeveloperDashboard) */}
      {variant === 'banner' && (
        <div className={`p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl border border-indigo-500/30 shadow-lg ${className}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md font-mono font-bold text-sm shrink-0">
                &lt;/&gt;
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Developer Portal Mobile App</span>
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-[10px] rounded-full font-bold border border-blue-400/30">PWA</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Install on your iPhone, iPad, or Android home screen for full offline access & native app feel.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Primary Install Button */}
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>

              {/* Share / Add to Home Screen Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ios');
                  setShowGuideModal(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer"
              >
                <Share className="w-3.5 h-3.5 text-blue-300" />
                <span>Share to Home Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installation & Share to Home Screen Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-mono font-bold shadow-sm">
                  &lt;/&gt;
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Install Developer Portal</h3>
                  <p className="text-xs text-slate-500">Add to Home Screen as a native Mobile App</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share className="w-3.5 h-3.5 text-blue-600" />
                <span>Apple iOS (iPhone/iPad)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Modal Body / Instructions */}
            <div className="mt-4 space-y-3.5 overflow-y-auto pr-1 flex-1">
              
              {/* Notification Banner if action was triggered */}
              {shareNotice && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{shareNotice}</span>
                </div>
              )}

              {/* iOS Safari Instructions */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                      <Share className="w-3.5 h-3.5 text-blue-600" />
                      How to "Share & Add to Home Screen" on iPhone / iPad:
                    </p>
                    <p className="text-[11px] text-blue-800">
                      Follow these 3 quick steps in Safari to pin Developer Portal as a standalone app:
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900">Tap the Share Button</p>
                        <span className="p-1 bg-white border border-slate-200 rounded text-blue-600 shadow-2xs">
                          <Share className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Located at the bottom of the screen on iPhone, or in the top toolbar on iPad.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900">Select "Add to Home Screen"</p>
                        <span className="p-1 bg-white border border-slate-200 rounded text-indigo-600 shadow-2xs">
                          <PlusSquare className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Scroll down the sharing options sheet and tap <strong>"Add to Home Screen"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-slate-900">Tap "Add" in Top-Right Corner</p>
                        <span className="p-1 bg-white border border-slate-200 rounded text-emerald-600 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        The Developer Portal icon is saved directly to your home screen!
                      </p>
                    </div>
                  </div>

                  {/* Action Shortcuts for iOS */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleOpenShareMenu}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Share className="w-4 h-4" />
                      <span>Open Native Share Sheet (Add to Home Screen)</span>
                    </button>

                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Open App in Safari / Full Browser Window</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Android Instructions */}
              {activeTab === 'android' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      How to Install on Android (Chrome / Samsung):
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Install directly with native PWA support or from the browser menu:
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Tap Browser Menu (⋮)</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Tap the three dots in the top-right corner of Chrome or bottom bar of Samsung Internet.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Select "Install App" or "Add to Home screen"</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Tap <strong>Install app</strong> or <strong>Add to Home screen</strong> in the menu.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Confirm "Install"</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Confirm the prompt and Developer Portal will appear on your app drawer and home screen.
                      </p>
                    </div>
                  </div>

                  {/* Action Shortcuts for Android */}
                  <div className="pt-2 flex flex-col gap-2">
                    {isInstallable && (
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Trigger Native Android Install Prompt</span>
                      </button>
                    )}

                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Open App in Full Chrome Tab</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Desktop Instructions */}
              {activeTab === 'desktop' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                      <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                      How to Install on Desktop (Chrome / Edge / Safari):
                    </p>
                    <p className="text-[11px] text-indigo-800">
                      Run Developer Portal in its own dedicated, clean window without browser tabs:
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Click Address Bar Install Icon</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        In Chrome or Edge, look for the install icon (monitor with down arrow) on the right side of the address bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Or use Browser Menu</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Click Menu (⋮) &gt; <strong>Save and share</strong> &gt; <strong>Install Developer Portal</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    {isInstallable && (
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Developer Portal Desktop App</span>
                      </button>
                    )}

                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Open in Full Standalone Tab</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Preview Notice if running inside iframe */}
              {isInIframe && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Preview Mode Notice
                  </p>
                  <p className="text-[11px] text-amber-800">
                    You are viewing the app in the studio preview frame. For the browser's native <strong>"Add to Home Screen"</strong> prompt to trigger, click <strong>"Open App in Full Browser Window"</strong> above or copy the URL to your phone.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy App URL to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy App URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
