import React, { useEffect, useState } from 'react';
import { Check, Copy, Delete, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';
import { Language, PinSecurityState } from '../types/hisab';
import { constantTimeEqual, generateRecoveryKey, generateSalt, hashSecret } from '../utils/crypto';

interface PinLockScreenProps {
  security: PinSecurityState;
  language: Language;
  t: TranslationStrings;
  onLanguageChange: (lang: Language) => void;
  onPinConfigured: (newSecurity: PinSecurityState) => void;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  security,
  language,
  t,
  onLanguageChange,
  onPinConfigured,
  onUnlock,
}) => {
  // Setup flow states
  const [pinLength, setPinLength] = useState<4 | 6>(security.pinLength || 4);
  const [setupStep, setSetupStep] = useState<'create' | 'confirm' | 'question' | 'recovery_key'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [pendingSecurity, setPendingSecurity] = useState<PinSecurityState | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Unlock flow states
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'question' | 'key'>('question');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [isResettingAfterRecovery, setIsResettingAfterRecovery] = useState(false);

  const isSetupMode = !security.isConfigured || isResettingAfterRecovery;

  // Support physical keyboard digits on unlock / setup PIN entry
  useEffect(() => {
    if (showRecoveryModal) return;
    if (isSetupMode && (setupStep === 'question' || setupStep === 'recovery_key')) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const targetLength = isSetupMode ? pinLength : security.pinLength;

  const handleDigitPress = (digit: string) => {
    setErrorMsg('');
    if (!isSetupMode) {
      if (enteredPin.length >= targetLength) return;
      const next = enteredPin + digit;
      setEnteredPin(next);
      if (next.length === targetLength) {
        void verifyUnlockPin(next);
      }
      return;
    }

    if (setupStep === 'create') {
      if (firstPin.length >= pinLength) return;
      const next = firstPin + digit;
      setFirstPin(next);
      if (next.length === pinLength) {
        setTimeout(() => setSetupStep('confirm'), 120);
      }
    } else if (setupStep === 'confirm') {
      if (confirmPin.length >= pinLength) return;
      const next = confirmPin + digit;
      setConfirmPin(next);
      if (next.length === pinLength) {
        if (next === firstPin) {
          if (isResettingAfterRecovery) {
            void finalizeResetPinOnly(next);
          } else {
            setTimeout(() => setSetupStep('question'), 120);
          }
        } else {
          setErrorMsg(t.pinMismatchError);
          setTimeout(() => {
            setConfirmPin('');
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    if (!isSetupMode) {
      setEnteredPin((prev) => prev.slice(0, -1));
      return;
    }
    if (setupStep === 'create') {
      setFirstPin((prev) => prev.slice(0, -1));
    } else if (setupStep === 'confirm') {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const verifyUnlockPin = async (pin: string) => {
    const hash = await hashSecret(pin, security.salt);
    if (constantTimeEqual(hash, security.pinHash)) {
      setEnteredPin('');
      onUnlock();
    } else {
      setErrorMsg(t.wrongPinError);
      setTimeout(() => setEnteredPin(''), 350);
    }
  };

  const handleSetupQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setErrorMsg(t.answerRequiredError);
      return;
    }
    const salt = generateSalt();
    const recKey = generateRecoveryKey();
    const [pinHash, recoveryAnswerHash, recoveryKeyHash] = await Promise.all([
      hashSecret(firstPin, salt),
      hashSecret(securityAnswer.trim().toLowerCase(), salt),
      hashSecret(recKey.toUpperCase(), salt),
    ]);

    const newSecurity: PinSecurityState = {
      isConfigured: true,
      pinLength,
      salt,
      pinHash,
      recoveryQuestion: t.securityQuestions[questionIndex] || t.securityQuestions[0],
      recoveryAnswerHash,
      recoveryKeyHash,
      lockOnBackground: true,
    };

    setGeneratedKey(recKey);
    setPendingSecurity(newSecurity);
    setSetupStep('recovery_key');
  };

  const finalizeResetPinOnly = async (newPin: string) => {
    const pinHash = await hashSecret(newPin, security.salt || generateSalt());
    const updated: PinSecurityState = {
      ...security,
      isConfigured: true,
      pinLength,
      pinHash,
    };
    onPinConfigured(updated);
    setIsResettingAfterRecovery(false);
    setFirstPin('');
    setConfirmPin('');
    setSetupStep('create');
    onUnlock();
  };

  const handleRecoveryVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const candidate =
      recoveryMode === 'question'
        ? recoveryInput.trim().toLowerCase()
        : recoveryInput.trim().toUpperCase();
    if (!candidate) {
      setErrorMsg(t.recoveryMismatchError);
      return;
    }
    const candidateHash = await hashSecret(candidate, security.salt);
    const expectedHash =
      recoveryMode === 'question' ? security.recoveryAnswerHash : security.recoveryKeyHash;

    if (constantTimeEqual(candidateHash, expectedHash)) {
      setShowRecoveryModal(false);
      setRecoveryInput('');
      setIsResettingAfterRecovery(true);
      setSetupStep('create');
      setFirstPin('');
      setConfirmPin('');
    } else {
      setErrorMsg(t.recoveryMismatchError);
    }
  };

  const activePinValue = !isSetupMode
    ? enteredPin
    : setupStep === 'create'
      ? firstPin
      : confirmPin;

  const renderKeypad = () => (
    <div className="mt-6 w-full max-w-xs mx-auto">
      <div className="flex justify-center gap-3.5 mb-6" aria-label="PIN dots">
        {Array.from({ length: targetLength }).map((_, idx) => {
          const filled = idx < activePinValue.length;
          return (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                filled
                  ? 'bg-blue-700 dark:bg-blue-500 scale-110'
                  : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {errorMsg && (
        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400 mb-4" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitPress(digit)}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums transition-all cursor-pointer"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigitPress('0')}
          className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums transition-all cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8">
      {/* Language Switcher on Lock Screen */}
      <div className="mb-6 flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {(['gu', 'hi', 'en'] as Language[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onLanguageChange(lang)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              language === lang
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिन्दी' : 'English'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center mb-4">
            {isSetupMode ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white text-balance">
            {isSetupMode ? t.setupPinTitle : t.unlockTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isSetupMode ? t.setupPinSubtitle : t.unlockSubtitle}
          </p>
        </div>

        {isSetupMode && (setupStep === 'create' || setupStep === 'confirm') && (
          <>
            {setupStep === 'create' && (
              <div className="mt-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center mb-2">
                  {t.choosePinLength}
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {([4, 6] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => {
                        setPinLength(len);
                        setFirstPin('');
                        setConfirmPin('');
                      }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        pinLength === len
                          ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {len === 4 ? t.digits4 : t.digits6}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-5 text-center text-sm font-semibold text-slate-800 dark:text-slate-200">
              {setupStep === 'create' ? t.enterNewPin : t.confirmNewPin}
            </p>
            {renderKeypad()}

            {setupStep === 'confirm' && (
              <button
                type="button"
                onClick={() => {
                  setSetupStep('create');
                  setFirstPin('');
                  setConfirmPin('');
                  setErrorMsg('');
                }}
                className="mt-4 w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t.cancel}
              </button>
            )}
          </>
        )}

        {isSetupMode && setupStep === 'question' && (
          <form onSubmit={handleSetupQuestionSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.securityQuestionLabel}
              </label>
              <select
                value={questionIndex}
                onChange={(e) => setQuestionIndex(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {t.securityQuestions.map((q, idx) => (
                  <option key={idx} value={idx}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.securityAnswerLabel}
              </label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => {
                  setSecurityAnswer(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={t.securityAnswerPlaceholder}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {errorMsg && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {t.savePinButton}
            </button>
          </form>
        )}

        {isSetupMode && setupStep === 'recovery_key' && pendingSecurity && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-2">
                <KeyRound className="w-4 h-4" />
                <span>{t.recoveryKeyTitle}</span>
              </div>
              <p className="font-mono text-xl font-bold tracking-wider text-slate-900 dark:text-white select-all py-2">
                {generatedKey}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {t.recoveryKeyWarning}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(generatedKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="w-full h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? t.recoveryKeyCopied : t.recoveryKeyCopy}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onPinConfigured(pendingSecurity);
                onUnlock();
              }}
              className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              {t.recoveryKeyContinue}
            </button>
          </div>
        )}

        {!isSetupMode && (
          <>
            {renderKeypad()}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setShowRecoveryModal(true);
                }}
                className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline py-2 px-4 cursor-pointer"
              >
                {t.forgotPin}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Forgot PIN Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.recoverPinTitle}</h2>
            <div className="mt-4 grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode('question');
                  setRecoveryInput('');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                  recoveryMode === 'question'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.recoverByQuestion}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode('key');
                  setRecoveryInput('');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                  recoveryMode === 'key'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.recoverByKey}
              </button>
            </div>

            <form onSubmit={handleRecoveryVerify} className="mt-4 space-y-4">
              {recoveryMode === 'question' ? (
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {security.recoveryQuestion || t.securityQuestions[0]}
                  </p>
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={(e) => {
                      setRecoveryInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={t.securityAnswerPlaceholder}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.recoveryKeyInputLabel}
                  </label>
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={(e) => {
                      setRecoveryInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              {errorMsg && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setErrorMsg('');
                  }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-blue-700 hover:bg-blue-800 text-sm font-semibold text-white cursor-pointer"
                >
                  {t.verifyAndReset}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
