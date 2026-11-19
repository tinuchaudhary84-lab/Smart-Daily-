import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Smartphone, X } from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';
import { downloadAndroidStudioProjectZip } from '../utils/androidProjectExporter';

interface InstallAppModalProps {
  isOpen: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  t: TranslationStrings;
  onInstallPrompt: () => Promise<boolean>;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  isInstallable,
  isIOS,
  t,
  onInstallPrompt,
  onClose,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.installModalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.installAppDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-w-[36px] min-h-[36px] rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Native PWA Install Button when beforeinstallprompt is available */}
        {isInstallable && (
          <button
            type="button"
            onClick={async () => {
              const accepted = await onInstallPrompt();
              if (accepted) {
                onClose();
              }
            }}
            className="w-full h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.installDirectPrompt}</span>
          </button>
        )}

        {/* Step-by-step instructions */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 space-y-3 text-sm">
          {!isIOS ? (
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1.5">
                {t.installAndroidStepsTitle}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>{t.installAndroidStep1}</li>
                <li>{t.installAndroidStep2}</li>
              </ol>
            </div>
          ) : (
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1.5">
                {t.installIosStepsTitle}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>{t.installIosStep1}</li>
                <li>{t.installIosStep2}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Helpful actions for iframe / external browser / Android Studio APK build */}
        <div className="space-y-2.5">
          {isInIframe && appUrl && (
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t.openInBrowser}</span>
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(appUrl);
                setCopied(true);
                onNotify(t.linkCopied);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.linkCopied : t.copyAppLink}</span>
            </button>

            <button
              type="button"
              disabled={downloadingZip}
              onClick={async () => {
                setDownloadingZip(true);
                try {
                  await downloadAndroidStudioProjectZip();
                  onNotify(t.downloadAndroidZip);
                } catch {
                  onNotify(t.restoreError);
                } finally {
                  setDownloadingZip(false);
                }
              }}
              className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span className="truncate">Android Studio (.zip)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
