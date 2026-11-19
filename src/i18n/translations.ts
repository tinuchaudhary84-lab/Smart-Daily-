import { Language, PaymentMethod } from '../types/hisab';

export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  // Navigation
  navHome: string;
  navHistory: string;
  navAdd: string;
  navReports: string;
  navSettings: string;
  // PIN Security
  setupPinTitle: string;
  setupPinSubtitle: string;
  choosePinLength: string;
  digits4: string;
  digits6: string;
  enterNewPin: string;
  confirmNewPin: string;
  securityQuestionLabel: string;
  securityAnswerLabel: string;
  securityAnswerPlaceholder: string;
  savePinButton: string;
  pinMismatchError: string;
  pinIncompleteError: string;
  answerRequiredError: string;
  recoveryKeyTitle: string;
  recoveryKeyWarning: string;
  recoveryKeyCopy: string;
  recoveryKeyCopied: string;
  recoveryKeyContinue: string;
  unlockTitle: string;
  unlockSubtitle: string;
  wrongPinError: string;
  forgotPin: string;
  lockNow: string;
  recoverPinTitle: string;
  recoverByQuestion: string;
  recoverByKey: string;
  recoveryKeyInputLabel: string;
  verifyAndReset: string;
  recoveryMismatchError: string;
  changePinTitle: string;
  currentPinLabel: string;
  wrongCurrentPin: string;
  pinChangedSuccess: string;
  // Dashboard
  availableBalance: string;
  totalIncome: string;
  totalExpenses: string;
  todayExpenses: string;
  monthExpenses: string;
  openingBalance: string;
  editOpeningBalance: string;
  recentTransactions: string;
  viewAll: string;
  noTransactionsTitle: string;
  noTransactionsDesc: string;
  addFirstTransaction: string;
  quickAddExpense: string;
  quickAddIncome: string;
  // Add / Edit Transaction
  addTransactionTitle: string;
  editTransactionTitle: string;
  transactionType: string;
  expense: string;
  income: string;
  amount: string;
  amountPlaceholder: string;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
  notesPlaceholder: string;
  saveTransaction: string;
  updateTransaction: string;
  cancel: string;
  invalidAmountError: string;
  selectCategoryError: string;
  transactionSaved: string;
  transactionUpdated: string;
  // Payment methods
  pmCash: string;
  pmUpi: string;
  pmBankTransfer: string;
  pmDebitCard: string;
  pmCreditCard: string;
  pmOther: string;
  // History
  historyTitle: string;
  searchPlaceholder: string;
  filterType: string;
  filterAll: string;
  filterCategory: string;
  allCategories: string;
  filterDate: string;
  dateAll: string;
  dateToday: string;
  dateThisWeek: string;
  dateThisMonth: string;
  dateCustom: string;
  fromDate: string;
  toDate: string;
  sortBy: string;
  sortNewest: string;
  sortOldest: string;
  edit: string;
  delete: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  confirmDelete: string;
  transactionDeleted: string;
  matchingCount: string;
  // Reports
  reportsTitle: string;
  dailyReport: string;
  monthlyReport: string;
  yearlyReport: string;
  todayIncome: string;
  todayNetBalance: string;
  dailyTransactions: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  monthlySavings: string;
  categoryExpenseAnalysis: string;
  annualIncome: string;
  annualExpenses: string;
  annualSavings: string;
  monthWiseComparison: string;
  chartIncomeVsExpense: string;
  chartCategoryPie: string;
  chartMonthlyTrend: string;
  chartYearlyOverview: string;
  noDataForPeriod: string;
  monthCol: string;
  savingsCol: string;
  shareCol: string;
  transactionsCount: string;
  // Settings
  settingsTitle: string;
  securitySection: string;
  changePin: string;
  autoLockBackground: string;
  autoLockDesc: string;
  viewRecoveryInfo: string;
  preferencesSection: string;
  languageLabel: string;
  currencyLabel: string;
  themeLabel: string;
  lightMode: string;
  darkMode: string;
  financialSection: string;
  manageCategories: string;
  addCategory: string;
  editCategory: string;
  categoryNameEn: string;
  categoryNameGu: string;
  categoryNameHi: string;
  categoryColor: string;
  saveCategory: string;
  addCategoryShort: string;
  removeCategoryShort: string;
  deleteCategoryModeHint: string;
  categoryAdded: string;
  categoryDeleted: string;
  keepAtLeastOneCategory: string;
  quickCategoryNamePlaceholder: string;
  deleteCategoryConfirm: string;
  categoryInUseNotice: string;
  backupExportSection: string;
  backupData: string;
  backupDesc: string;
  restoreData: string;
  restoreDesc: string;
  restoreSuccess: string;
  restoreError: string;
  exportPdf: string;
  exportCsv: string;
  installApp: string;
  installAppShort: string;
  installAppDesc: string;
  installModalTitle: string;
  installDirectPrompt: string;
  installAndroidStepsTitle: string;
  installAndroidStep1: string;
  installAndroidStep2: string;
  installIosStepsTitle: string;
  installIosStep1: string;
  installIosStep2: string;
  openInBrowser: string;
  copyAppLink: string;
  linkCopied: string;
  appInfoSection: string;
  appInfoTitle: string;
  appInfoDesc: string;
  offlineReady: string;
  androidSourceTitle: string;
  androidSourceDesc: string;
  downloadAndroidZip: string;
  save: string;
  close: string;
  monthsShort: string[];
  securityQuestions: string[];
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  gu: {
    appName: 'સ્માર્ટ દૈનિક હિસાબ',
    appSubtitle: 'વ્યક્તિગત દૈનિક આવક અને ખર્ચ મેનેજર',
    navHome: 'હોમ',
    navHistory: 'ઇતિહાસ',
    navAdd: 'ઉમેરો',
    navReports: 'રિપોર્ટ',
    navSettings: 'સેટિંગ્સ',
    setupPinTitle: 'સુરક્ષિત PIN સેટ કરો',
    setupPinSubtitle: 'તમારી વ્યક્તિગત નાણાકીય માહિતી સુરક્ષિત રાખવા માટે 4 અથવા 6 અંકનો PIN બનાવો.',
    choosePinLength: 'PIN લંબાઈ પસંદ કરો',
    digits4: '4 અંક',
    digits6: '6 અંક',
    enterNewPin: 'નવો PIN દાખલ કરો',
    confirmNewPin: 'PIN ની પુષ્ટિ કરો',
    securityQuestionLabel: 'સુરક્ષા પ્રશ્ન (PIN ભૂલી જાઓ તો)',
    securityAnswerLabel: 'તમારો જવાબ',
    securityAnswerPlaceholder: 'જવાબ લખો...',
    savePinButton: 'PIN સેટ કરો અને આગળ વધો',
    pinMismatchError: 'બંને PIN સરખા નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    pinIncompleteError: 'કૃપા કરીને પૂરો PIN દાખલ કરો.',
    answerRequiredError: 'PIN રિકવરી માટે સુરક્ષા જવાબ જરૂરી છે.',
    recoveryKeyTitle: 'તમારી રિકવરી કી સાચવી રાખો',
    recoveryKeyWarning: 'જો તમે ક્યારેય PIN ભૂલી જાઓ તો આ રિકવરી કી વડે PIN રીસેટ કરી શકશો. તેને સુરક્ષિત જગ્યાએ લખી લો.',
    recoveryKeyCopy: 'કી કૉપિ કરો',
    recoveryKeyCopied: 'કૉપિ થઈ ગઈ',
    recoveryKeyContinue: 'હિસાબ શરૂ કરો',
    unlockTitle: 'સ્માર્ટ દૈનિક હિસાબ અનલૉક કરો',
    unlockSubtitle: 'આગળ વધવા માટે તમારો સુરક્ષા PIN દાખલ કરો',
    wrongPinError: 'ખોટો PIN. કૃપા કરીને સાચો PIN દાખલ કરો.',
    forgotPin: 'PIN ભૂલી ગયા છો?',
    lockNow: 'લૉક કરો',
    recoverPinTitle: 'PIN રિકવરી',
    recoverByQuestion: 'સુરક્ષા પ્રશ્ન દ્વારા',
    recoverByKey: 'રિકવરી કી દ્વારા',
    recoveryKeyInputLabel: '12 અક્ષરની રિકવરી કી દાખલ કરો',
    verifyAndReset: 'ચકાસો અને નવો PIN સેટ કરો',
    recoveryMismatchError: 'જવાબ અથવા રિકવરી કી મેળ ખાતી નથી.',
    changePinTitle: 'PIN બદલો',
    currentPinLabel: 'હાલનો PIN',
    wrongCurrentPin: 'હાલનો PIN ખોટો છે.',
    pinChangedSuccess: 'PIN સફળતાપૂર્વક બદલાયો છે.',
    availableBalance: 'ઉપલબ્ધ બેલેન્સ',
    totalIncome: 'કુલ આવક',
    totalExpenses: 'કુલ ખર્ચ',
    todayExpenses: 'આજનો ખર્ચ',
    monthExpenses: 'આ મહિનાનો ખર્ચ',
    openingBalance: 'શરૂઆતનું બેલેન્સ',
    editOpeningBalance: 'બદલો',
    recentTransactions: 'તાજેતરના વ્યવહારો',
    viewAll: 'બધું જુઓ',
    noTransactionsTitle: 'હજી સુધી કોઈ વ્યવહાર નથી',
    noTransactionsDesc: 'તમારી પહેલી આવક અથવા ખર્ચ ઉમેરીને દૈનિક હિસાબ શરૂ કરો.',
    addFirstTransaction: 'પહેલો વ્યવહાર ઉમેરો',
    quickAddExpense: 'ખર્ચ ઉમેરો',
    quickAddIncome: 'આવક ઉમેરો',
    addTransactionTitle: 'નવો વ્યવહાર ઉમેરો',
    editTransactionTitle: 'વ્યવહાર સુધારો',
    transactionType: 'વ્યવહારનો પ્રકાર',
    expense: 'ખર્ચ',
    income: 'આવક',
    amount: 'રકમ',
    amountPlaceholder: '0',
    category: 'કેટેગરી',
    date: 'તારીખ',
    paymentMethod: 'ચુકવણીની રીત',
    notes: 'વિગત / નોંધ',
    notesPlaceholder: 'ટૂંકી નોંધ લખો (વૈકલ્પિક)...',
    saveTransaction: 'વ્યવહાર સાચવો',
    updateTransaction: 'વ્યવહાર અપડેટ કરો',
    cancel: 'રદ કરો',
    invalidAmountError: 'કૃપા કરીને 0 થી મોટી સાચી રકમ દાખલ કરો.',
    selectCategoryError: 'કૃપા કરીને કેટેગરી પસંદ કરો.',
    transactionSaved: 'વ્યવહાર સફળતાપૂર્વક સાચવાયો.',
    transactionUpdated: 'વ્યવહાર અપડેટ થયો.',
    pmCash: 'રોકડ (Cash)',
    pmUpi: 'UPI',
    pmBankTransfer: 'બેંક ટ્રાન્સફર',
    pmDebitCard: 'ડેબિટ કાર્ડ',
    pmCreditCard: 'ક્રેડિટ કાર્ડ',
    pmOther: 'અન્ય',
    historyTitle: 'વ્યવહાર ઇતિહાસ',
    searchPlaceholder: 'નોંધ, કેટેગરી અથવા રકમ શોધો...',
    filterType: 'પ્રકાર',
    filterAll: 'બધું',
    filterCategory: 'કેટેગરી',
    allCategories: 'બધી કેટેગરી',
    filterDate: 'તારીખ ફિલ્ટર',
    dateAll: 'બધી તારીખ',
    dateToday: 'આજે',
    dateThisWeek: 'આ અઠવાડિયે',
    dateThisMonth: 'આ મહિને',
    dateCustom: 'ચોક્કસ તારીખ',
    fromDate: 'થી',
    toDate: 'સુધી',
    sortBy: 'ક્રમ',
    sortNewest: 'નવું પહેલાં',
    sortOldest: 'જૂનું પહેલાં',
    edit: 'સુધારો',
    delete: 'કાઢી નાખો',
    deleteConfirmTitle: 'વ્યવહાર કાઢી નાખવો છે?',
    deleteConfirmMessage: 'આ વ્યવહાર કાયમ માટે દૂર થઈ જશે અને તમારું બેલેન્સ આપમેળે અપડેટ થશે.',
    confirmDelete: 'હા, કાઢી નાખો',
    transactionDeleted: 'વ્યવહાર દૂર કરવામાં આવ્યો.',
    matchingCount: 'વ્યવહારો',
    reportsTitle: 'નાણાકીય રિપોર્ટ્સ અને ચાર્ટ્સ',
    dailyReport: 'દૈનિક',
    monthlyReport: 'માસિક',
    yearlyReport: 'વાર્ષિક',
    todayIncome: 'આજની આવક',
    todayNetBalance: 'આજનું ચોખ્ખું બેલેન્સ',
    dailyTransactions: 'દૈનિક વ્યવહારોની યાદી',
    monthlyIncome: 'માસિક આવક',
    monthlyExpenses: 'માસિક ખર્ચ',
    monthlySavings: 'માસિક બચત',
    categoryExpenseAnalysis: 'કેટેગરી મુજબ ખર્ચ વિશ્લેષણ',
    annualIncome: 'વાર્ષિક આવક',
    annualExpenses: 'વાર્ષિક ખર્ચ',
    annualSavings: 'વાર્ષિક બચત',
    monthWiseComparison: 'મહિનાવાર સરખામણી',
    chartIncomeVsExpense: 'આવક વિરુદ્ધ ખર્ચ',
    chartCategoryPie: 'કેટેગરી મુજબ ખર્ચ (પાઇ ચાર્ટ)',
    chartMonthlyTrend: 'માસિક ખર્ચ ગ્રાફ',
    chartYearlyOverview: 'વાર્ષિક નાણાકીય ઝાંખી',
    noDataForPeriod: 'પસંદ કરેલા સમયગાળા માટે કોઈ વ્યવહાર નથી.',
    monthCol: 'મહિનો',
    savingsCol: 'બચત',
    shareCol: 'હિસ્સો',
    transactionsCount: 'વ્યવહારો',
    settingsTitle: 'સેટિંગ્સ',
    securitySection: 'સુરક્ષા અને PIN લૉક',
    changePin: 'PIN બદલો',
    autoLockBackground: 'બેકગ્રાઉન્ડમાં જતા ઑટો-લૉક',
    autoLockDesc: 'જ્યારે એપ બંધ થાય અથવા અન્ય એપ પર જાઓ ત્યારે તરત લૉક કરો',
    viewRecoveryInfo: 'રિકવરી કી ફરી સેટ કરો',
    preferencesSection: 'ભાષા, ચલણ અને થીમ',
    languageLabel: 'ભાષા પસંદગી',
    currencyLabel: 'ચલણ (Currency)',
    themeLabel: 'દેખાવ (Theme)',
    lightMode: 'લાઇટ મોડ',
    darkMode: 'ડાર્ક મોડ',
    financialSection: 'કેટેગરી અને બેલેન્સ',
    manageCategories: 'કેટેગરી મેનેજ કરો',
    addCategory: 'નવી કેટેગરી ઉમેરો',
    editCategory: 'કેટેગરી સુધારો',
    categoryNameEn: 'નામ (English)',
    categoryNameGu: 'નામ (ગુજરાતી)',
    categoryNameHi: 'નામ (हिन्दी)',
    categoryColor: 'રંગ',
    saveCategory: 'કેટેગરી સાચવો',
    addCategoryShort: 'એડ કેટેગરી',
    removeCategoryShort: 'કાઢો',
    deleteCategoryModeHint: 'જે કેટેગરી કાઢવી હોય તેના પર ટૅપ કરો',
    categoryAdded: 'નવી કેટેગરી ઉમેરાઈ.',
    categoryDeleted: 'કેટેગરી કાઢી નાખવામાં આવી.',
    keepAtLeastOneCategory: 'ઓછામાં ઓછી એક કેટેગરી રાખવી જરૂરી છે.',
    quickCategoryNamePlaceholder: 'નવી કેટેગરીનું નામ લખો...',
    deleteCategoryConfirm: 'આ કેટેગરી કાઢી નાખવી છે?',
    categoryInUseNotice: 'ઓછામાં ઓછી એક કેટેગરી રાખવી જરૂરી છે.',
    backupExportSection: 'ડેટા બેકઅપ, રિસ્ટોર અને નિકાસ',
    backupData: 'ડેટા બેકઅપ (JSON)',
    backupDesc: 'તમારા બધા વ્યવહારો અને કેટેગરીની ફાઇલ ઉપકરણમાં સાચવો',
    restoreData: 'ડેટા રિસ્ટોર કરો',
    restoreDesc: 'અગાઉ સાચવેલી બેકઅપ JSON ફાઇલમાંથી ડેટા પાછો મેળવો',
    restoreSuccess: 'બેકઅપ ડેટા સફળતાપૂર્વક રિસ્ટોર થયો!',
    restoreError: 'અમાન્ય બેકઅપ ફાઇલ. કૃપા કરીને સાચી JSON બેકઅપ ફાઇલ પસંદ કરો.',
    exportPdf: 'PDF રિપોર્ટ ડાઉનલોડ',
    exportCsv: 'CSV (Excel) નિકાસ',
    installApp: 'મોબાઇલ એપ ઇન્સ્ટૉલ કરો',
    installAppShort: 'ઇન્સ્ટૉલ',
    installAppDesc: 'ઑફલાઇન ઉપયોગ માટે હોમ સ્ક્રીન પર ઉમેરો',
    installModalTitle: 'સ્માર્ટ દૈનિક હિસાબ ઇન્સ્ટૉલ કરો',
    installDirectPrompt: 'હમણાં જ ઇન્સ્ટૉલ કરો',
    installAndroidStepsTitle: 'Android (Chrome) પર ઇન્સ્ટૉલ કરવાની રીત:',
    installAndroidStep1: 'બ્રાઉઝરના ઉપરના જમણા ખૂણે મેનુ (⋮) પર ટૅપ કરો.',
    installAndroidStep2: '"Install app" અથવા "Add to Home screen" પસંદ કરો.',
    installIosStepsTitle: 'iPhone / iPad (Safari) પર ઇન્સ્ટૉલ કરવાની રીત:',
    installIosStep1: 'નીચે Share બટન પર ટૅપ કરો.',
    installIosStep2: 'નીચે સ્ક્રોલ કરી "Add to Home Screen" પસંદ કરો.',
    openInBrowser: 'નવા બ્રાઉઝર ટૅબમાં ખોલો',
    copyAppLink: 'એપ લિંક કૉપિ કરો',
    linkCopied: 'લિંક કૉપિ થઈ ગઈ',
    appInfoSection: 'એપ માહિતી અને Android સોર્સ',
    appInfoTitle: 'સ્માર્ટ દૈનિક હિસાબ v1.0',
    appInfoDesc: '100% ખાનગી, ઑફલાઇન-ફર્સ્ટ વ્યક્તિગત હિસાબ એપ્લિકેશન. તમારો બધો ડેટા ફક્ત તમારા ઉપકરણ પર જ સુરક્ષિત રીતે સંગ્રહિત થાય છે.',
    offlineReady: 'ઑફલાઇન કાર્યરત — લોકલ સ્ટોરેજ સુરક્ષિત',
    androidSourceTitle: 'Android Studio Kotlin + Jetpack Compose પ્રોજેક્ટ',
    androidSourceDesc: 'Room Database, Material 3 અને Android Keystore સાથેનો સંપૂર્ણ Android Studio સોર્સ કોડ ZIP ડાઉનલોડ કરો.',
    downloadAndroidZip: 'Android Studio પ્રોજેક્ટ (.zip) ડાઉનલોડ કરો',
    save: 'સાચવો',
    close: 'બંધ કરો',
    monthsShort: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટે', 'ઓક્ટો', 'નવે', 'ડિસે'],
    securityQuestions: [
      'તમારા પ્રિય મિત્રનું નામ શું છે?',
      'તમારું જન્મસ્થળ કયું છે?',
      'તમારી પ્રથમ શાળાનું નામ શું હતું?',
      'તમારા પ્રિય શિક્ષકનું નામ શું છે?',
    ],
  },
  hi: {
    appName: 'स्मार्ट दैनिक हिसाब',
    appSubtitle: 'व्यक्तिगत दैनिक आय और खर्च प्रबंधक',
    navHome: 'होम',
    navHistory: 'इतिहास',
    navAdd: 'जोड़ें',
    navReports: 'रिपोर्ट',
    navSettings: 'सेटिंग्स',
    setupPinTitle: 'सुरक्षित PIN सेट करें',
    setupPinSubtitle: 'अपने व्यक्तिगत वित्तीय रिकॉर्ड सुरक्षित रखने के लिए 4 या 6 अंकों का PIN बनाएं।',
    choosePinLength: 'PIN की लंबाई चुनें',
    digits4: '4 अंक',
    digits6: '6 अंक',
    enterNewPin: 'नया PIN दर्ज करें',
    confirmNewPin: 'PIN की पुष्टि करें',
    securityQuestionLabel: 'सुरक्षा प्रश्न (PIN भूलने पर)',
    securityAnswerLabel: 'आपका उत्तर',
    securityAnswerPlaceholder: 'उत्तर लिखें...',
    savePinButton: 'PIN सेट करें और आगे बढ़ें',
    pinMismatchError: 'दोनों PIN मेल नहीं खाते। कृपया पुनः प्रयास करें।',
    pinIncompleteError: 'कृपया पूरा PIN दर्ज करें।',
    answerRequiredError: 'PIN रिकवरी के लिए सुरक्षा उत्तर आवश्यक है।',
    recoveryKeyTitle: 'अपनी रिकवरी कुंजी सुरक्षित रखें',
    recoveryKeyWarning: 'यदि आप कभी PIN भूल जाते हैं, तो इस रिकवरी कुंजी से PIN रीसेट कर सकते हैं। इसे सुरक्षित स्थान पर लिख लें।',
    recoveryKeyCopy: 'कुंजी कॉपी करें',
    recoveryKeyCopied: 'कॉपी हो गई',
    recoveryKeyContinue: 'हिसाब शुरू करें',
    unlockTitle: 'स्मार्ट दैनिक हिसाब अनलॉक करें',
    unlockSubtitle: 'आगे बढ़ने के लिए अपना सुरक्षा PIN दर्ज करें',
    wrongPinError: 'गलत PIN। कृपया सही PIN दर्ज करें।',
    forgotPin: 'PIN भूल गए?',
    lockNow: 'लॉक करें',
    recoverPinTitle: 'PIN रिकवरी',
    recoverByQuestion: 'सुरक्षा प्रश्न द्वारा',
    recoverByKey: 'रिकवरी कुंजी द्वारा',
    recoveryKeyInputLabel: '12 अक्षर की रिकवरी कुंजी दर्ज करें',
    verifyAndReset: 'सत्यापित करें और नया PIN सेट करें',
    recoveryMismatchError: 'उत्तर या रिकवरी कुंजी मेल नहीं खाती।',
    changePinTitle: 'PIN बदलें',
    currentPinLabel: 'वर्तमान PIN',
    wrongCurrentPin: 'वर्तमान PIN गलत है।',
    pinChangedSuccess: 'PIN सफलतापूर्वक बदल दिया गया।',
    availableBalance: 'उपलब्ध बैलेंस',
    totalIncome: 'कुल आय',
    totalExpenses: 'कुल खर्च',
    todayExpenses: 'आज का खर्च',
    monthExpenses: 'इस महीने का खर्च',
    openingBalance: 'शुरुआती बैलेंस',
    editOpeningBalance: 'बदलें',
    recentTransactions: 'हाल के लेन-देन',
    viewAll: 'सभी देखें',
    noTransactionsTitle: 'अभी तक कोई लेन-देन नहीं',
    noTransactionsDesc: 'अपनी पहली आय या खर्च जोड़कर दैनिक हिसाब शुरू करें।',
    addFirstTransaction: 'पहला लेन-देन जोड़ें',
    quickAddExpense: 'खर्च जोड़ें',
    quickAddIncome: 'आय जोड़ें',
    addTransactionTitle: 'नया लेन-देन जोड़ें',
    editTransactionTitle: 'लेन-देन संपादित करें',
    transactionType: 'लेन-देन का प्रकार',
    expense: 'खर्च',
    income: 'आय',
    amount: 'राशि',
    amountPlaceholder: '0',
    category: 'श्रेणी',
    date: 'तारीख',
    paymentMethod: 'भुगतान का तरीका',
    notes: 'विवरण / नोट्स',
    notesPlaceholder: 'संक्षिप्त नोट लिखें (वैकल्पिक)...',
    saveTransaction: 'लेन-देन सहेजें',
    updateTransaction: 'लेन-देन अपडेट करें',
    cancel: 'रद्द करें',
    invalidAmountError: 'कृपया 0 से अधिक सही राशि दर्ज करें।',
    selectCategoryError: 'कृपया श्रेणी चुनें।',
    transactionSaved: 'लेन-देन सफलतापूर्वक सहेजा गया।',
    transactionUpdated: 'लेन-देन अपडेट किया गया।',
    pmCash: 'नकद (Cash)',
    pmUpi: 'UPI',
    pmBankTransfer: 'बैंक ट्रांसफर',
    pmDebitCard: 'डेबिट कार्ड',
    pmCreditCard: 'क्रेडिट कार्ड',
    pmOther: 'अन्य',
    historyTitle: 'लेन-देन इतिहास',
    searchPlaceholder: 'नोट, श्रेणी या राशि खोजें...',
    filterType: 'प्रकार',
    filterAll: 'सभी',
    filterCategory: 'श्रेणी',
    allCategories: 'सभी श्रेणियां',
    filterDate: 'तारीख फ़िल्टर',
    dateAll: 'सभी तारीखें',
    dateToday: 'आज',
    dateThisWeek: 'इस सप्ताह',
    dateThisMonth: 'इस महीने',
    dateCustom: 'कस्टम तारीख',
    fromDate: 'से',
    toDate: 'तक',
    sortBy: 'क्रम',
    sortNewest: 'नया पहले',
    sortOldest: 'पुराना पहले',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    deleteConfirmTitle: 'लेन-देन हटाएं?',
    deleteConfirmMessage: 'यह लेन-देन स्थायी रूप से हटा दिया जाएगा और आपका बैलेंस स्वतः अपडेट हो जाएगा।',
    confirmDelete: 'हां, हटाएं',
    transactionDeleted: 'लेन-देन हटा दिया गया।',
    matchingCount: 'लेन-देन',
    reportsTitle: 'वित्तीय रिपोर्ट और चार्ट',
    dailyReport: 'दैनिक',
    monthlyReport: 'मासिक',
    yearlyReport: 'वार्षिक',
    todayIncome: 'आज की आय',
    todayNetBalance: 'आज का शुद्ध बैलेंस',
    dailyTransactions: 'दैनिक लेन-देन सूची',
    monthlyIncome: 'मासिक आय',
    monthlyExpenses: 'मासिक खर्च',
    monthlySavings: 'मासिक बचत',
    categoryExpenseAnalysis: 'श्रेणी के अनुसार खर्च विश्लेषण',
    annualIncome: 'वार्षिक आय',
    annualExpenses: 'वार्षिक खर्च',
    annualSavings: 'वार्षिक बचत',
    monthWiseComparison: 'महीने के अनुसार तुलना',
    chartIncomeVsExpense: 'आय बनाम खर्च',
    chartCategoryPie: 'श्रेणी अनुसार खर्च (पाई चार्ट)',
    chartMonthlyTrend: 'मासिक खर्च ग्राफ',
    chartYearlyOverview: 'वार्षिक वित्तीय अवलोकन',
    noDataForPeriod: 'चयनित अवधि के लिए कोई लेन-देन नहीं है।',
    monthCol: 'महीना',
    savingsCol: 'बचत',
    shareCol: 'हिस्सा',
    transactionsCount: 'लेन-देन',
    settingsTitle: 'सेटिंग्स',
    securitySection: 'सुरक्षा और PIN लॉक',
    changePin: 'PIN बदलें',
    autoLockBackground: 'बैकग्राउंड में जाने पर ऑटो-लॉक',
    autoLockDesc: 'जब ऐप बैकग्राउंड में जाए तो तुरंत लॉक करें',
    viewRecoveryInfo: 'रिकवरी कुंजी रीसेट करें',
    preferencesSection: 'भाषा, मुद्रा और थीम',
    languageLabel: 'भाषा चुनें',
    currencyLabel: 'मुद्रा (Currency)',
    themeLabel: 'थीम (Theme)',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    financialSection: 'श्रेणियां और बैलेंस',
    manageCategories: 'श्रेणियां प्रबंधित करें',
    addCategory: 'नई श्रेणी जोड़ें',
    editCategory: 'श्रेणी संपादित करें',
    categoryNameEn: 'नाम (English)',
    categoryNameGu: 'नाम (ગુજરાતી)',
    categoryNameHi: 'नाम (हिन्दी)',
    categoryColor: 'रंग',
    saveCategory: 'श्रेणी सहेजें',
    addCategoryShort: 'श्रेणी जोड़ें',
    removeCategoryShort: 'हटाएं',
    deleteCategoryModeHint: 'जिस श्रेणी को हटाना है उस पर टैप करें',
    categoryAdded: 'नई श्रेणी जोड़ी गई।',
    categoryDeleted: 'श्रेणी हटा दी गई।',
    keepAtLeastOneCategory: 'कम से कम एक श्रेणी रखना आवश्यक है।',
    quickCategoryNamePlaceholder: 'नई श्रेणी का नाम लिखें...',
    deleteCategoryConfirm: 'क्या इस श्रेणी को हटाना चाहते हैं?',
    categoryInUseNotice: 'कम से कम एक श्रेणी रखना आवश्यक है।',
    backupExportSection: 'डेटा बैकअप, रिस्टोर और निर्यात',
    backupData: 'डेटा बैकअप (JSON)',
    backupDesc: 'अपने सभी लेन-देन और श्रेणियों को डिवाइस स्टोरेज में सहेजें',
    restoreData: 'डेटा रिस्टोर करें',
    restoreDesc: 'पहले सहेजी गई JSON बैकअप फ़ाइल से डेटा वापस लाएं',
    restoreSuccess: 'बैकअप डेटा सफलतापूर्वक रिस्टोर हो गया!',
    restoreError: 'अमान्य बैकअप फ़ाइल। कृपया सही JSON बैकअप फ़ाइल चुनें।',
    exportPdf: 'PDF रिपोर्ट डाउनलोड',
    exportCsv: 'CSV (Excel) निर्यात',
    installApp: 'मोबाइल ऐप इंस्टॉल करें',
    installAppShort: 'इंस्टॉल',
    installAppDesc: 'ऑफ़लाइन उपयोग के लिए होम स्क्रीन पर जोड़ें',
    installModalTitle: 'स्मार्ट दैनिक हिसाब इंस्टॉल करें',
    installDirectPrompt: 'अभी इंस्टॉल करें',
    installAndroidStepsTitle: 'Android (Chrome) पर इंस्टॉल करने का तरीका:',
    installAndroidStep1: 'ब्राउज़र के ऊपर दाएं कोने में मेनू (⋮) पर टैप करें।',
    installAndroidStep2: '"Install app" या "Add to Home screen" चुनें।',
    installIosStepsTitle: 'iPhone / iPad (Safari) पर इंस्टॉल करने का तरीका:',
    installIosStep1: 'नीचे Share बटन पर टैप करें।',
    installIosStep2: 'नीचे स्क्रॉल करके "Add to Home Screen" चुनें।',
    openInBrowser: 'नए ब्राउज़र टैब में खोलें',
    copyAppLink: 'ऐप लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी हो गया',
    appInfoSection: 'ऐप जानकारी और Android स्रोत',
    appInfoTitle: 'स्मार्ट दैनिक हिसाब v1.0',
    appInfoDesc: '100% निजी, ऑफ़लाइन-फर्स्ट व्यक्तिगत खर्च प्रबंधक। आपका सभी वित्तीय डेटा केवल आपके डिवाइस पर सुरक्षित रहता है।',
    offlineReady: 'ऑफ़लाइन तैयार — स्थानीय संग्रहण सुरक्षित',
    androidSourceTitle: 'Android Studio Kotlin + Jetpack Compose प्रोजेक्ट',
    androidSourceDesc: 'Room Database, Material 3 और Android Keystore के साथ पूरा Android Studio स्रोत कोड ZIP डाउनलोड करें।',
    downloadAndroidZip: 'Android Studio प्रोजेक्ट (.zip) डाउनलोड करें',
    save: 'सहेजें',
    close: 'बंद करें',
    monthsShort: ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
    securityQuestions: [
      'आपके सबसे अच्छे दोस्त का नाम क्या है?',
      'आपका जन्मस्थान कौन सा है?',
      'आपके पहले स्कूल का नाम क्या था?',
      'आपके पसंदीदा शिक्षक का नाम क्या है?',
    ],
  },
  en: {
    appName: 'Smart Daily Hisab',
    appSubtitle: 'Personal Daily Income & Expense Manager',
    navHome: 'Home',
    navHistory: 'History',
    navAdd: 'Add',
    navReports: 'Reports',
    navSettings: 'Settings',
    setupPinTitle: 'Create Security PIN',
    setupPinSubtitle: 'Protect your personal financial records with a 4-digit or 6-digit PIN stored securely via salted cryptographic hashing.',
    choosePinLength: 'Select PIN Length',
    digits4: '4 Digits',
    digits6: '6 Digits',
    enterNewPin: 'Enter New PIN',
    confirmNewPin: 'Confirm PIN',
    securityQuestionLabel: 'Security Question (for Forgot PIN)',
    securityAnswerLabel: 'Your Answer',
    securityAnswerPlaceholder: 'Enter answer...',
    savePinButton: 'Set PIN & Continue',
    pinMismatchError: 'PINs do not match. Please try again.',
    pinIncompleteError: 'Please enter the complete PIN.',
    answerRequiredError: 'Security answer is required for PIN recovery.',
    recoveryKeyTitle: 'Save Your Recovery Key',
    recoveryKeyWarning: 'If you ever forget your PIN, you can reset it using this recovery key. Store it in a safe place.',
    recoveryKeyCopy: 'Copy Key',
    recoveryKeyCopied: 'Copied',
    recoveryKeyContinue: 'Open My Hisab',
    unlockTitle: 'Unlock Smart Daily Hisab',
    unlockSubtitle: 'Enter your security PIN to access your personal ledger',
    wrongPinError: 'Incorrect PIN. Please try again.',
    forgotPin: 'Forgot PIN?',
    lockNow: 'Lock App',
    recoverPinTitle: 'PIN Recovery',
    recoverByQuestion: 'Security Question',
    recoverByKey: 'Recovery Key',
    recoveryKeyInputLabel: 'Enter 12-character Recovery Key',
    verifyAndReset: 'Verify & Set New PIN',
    recoveryMismatchError: 'Security answer or recovery key did not match.',
    changePinTitle: 'Change PIN',
    currentPinLabel: 'Current PIN',
    wrongCurrentPin: 'Current PIN is incorrect.',
    pinChangedSuccess: 'PIN updated successfully.',
    availableBalance: 'Available Balance',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    todayExpenses: "Today's Expenses",
    monthExpenses: "This Month's Expenses",
    openingBalance: 'Opening Balance',
    editOpeningBalance: 'Edit',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    noTransactionsTitle: 'No Transactions Recorded Yet',
    noTransactionsDesc: 'Start tracking your personal daily income and expenses. All data stays private on your device.',
    addFirstTransaction: 'Add First Transaction',
    quickAddExpense: 'Add Expense',
    quickAddIncome: 'Add Income',
    addTransactionTitle: 'Add Transaction',
    editTransactionTitle: 'Edit Transaction',
    transactionType: 'Transaction Type',
    expense: 'Expense',
    income: 'Income',
    amount: 'Amount',
    amountPlaceholder: '0',
    category: 'Category',
    date: 'Date',
    paymentMethod: 'Payment Method',
    notes: 'Description / Notes',
    notesPlaceholder: 'Optional note...',
    saveTransaction: 'SAVE TRANSACTION',
    updateTransaction: 'UPDATE TRANSACTION',
    cancel: 'Cancel',
    invalidAmountError: 'Please enter a valid amount greater than zero.',
    selectCategoryError: 'Please select a category.',
    transactionSaved: 'Transaction saved locally.',
    transactionUpdated: 'Transaction updated.',
    pmCash: 'Cash',
    pmUpi: 'UPI',
    pmBankTransfer: 'Bank Transfer',
    pmDebitCard: 'Debit Card',
    pmCreditCard: 'Credit Card',
    pmOther: 'Other',
    historyTitle: 'Transaction History',
    searchPlaceholder: 'Search notes, category, payment, or amount...',
    filterType: 'Type',
    filterAll: 'All',
    filterCategory: 'Category',
    allCategories: 'All Categories',
    filterDate: 'Date Filter',
    dateAll: 'All Dates',
    dateToday: 'Today',
    dateThisWeek: 'This Week',
    dateThisMonth: 'This Month',
    dateCustom: 'Custom Range',
    fromDate: 'From',
    toDate: 'To',
    sortBy: 'Sort',
    sortNewest: 'Newest First',
    sortOldest: 'Oldest First',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirmTitle: 'Delete Transaction?',
    deleteConfirmMessage: 'This transaction will be permanently removed and your balance will recalculate automatically.',
    confirmDelete: 'Delete',
    transactionDeleted: 'Transaction deleted.',
    matchingCount: 'transactions',
    reportsTitle: 'Reports & Analytics',
    dailyReport: 'Daily',
    monthlyReport: 'Monthly',
    yearlyReport: 'Yearly',
    todayIncome: "Today's Income",
    todayNetBalance: "Today's Remaining Balance",
    dailyTransactions: 'Daily Transaction List',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    monthlySavings: 'Monthly Savings',
    categoryExpenseAnalysis: 'Category-wise Expense Analysis',
    annualIncome: 'Annual Income',
    annualExpenses: 'Annual Expenses',
    annualSavings: 'Annual Savings',
    monthWiseComparison: 'Month-wise Comparison',
    chartIncomeVsExpense: 'Income vs Expense',
    chartCategoryPie: 'Category-wise Expense Pie Chart',
    chartMonthlyTrend: 'Monthly Expense Graph',
    chartYearlyOverview: 'Yearly Financial Overview',
    noDataForPeriod: 'No transactions recorded for this period.',
    monthCol: 'Month',
    savingsCol: 'Savings',
    shareCol: 'Share',
    transactionsCount: 'txns',
    settingsTitle: 'Settings',
    securitySection: 'Security & PIN Lock',
    changePin: 'Change PIN',
    autoLockBackground: 'Auto-lock in Background',
    autoLockDesc: 'Automatically require PIN when returning from background',
    viewRecoveryInfo: 'Regenerate Recovery Key',
    preferencesSection: 'Language, Currency & Theme',
    languageLabel: 'Language',
    currencyLabel: 'Currency',
    themeLabel: 'Appearance',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    financialSection: 'Categories & Opening Balance',
    manageCategories: 'Manage Categories',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    categoryNameEn: 'Name (English)',
    categoryNameGu: 'Name (Gujarati)',
    categoryNameHi: 'Name (Hindi)',
    categoryColor: 'Color',
    saveCategory: 'Save Category',
    addCategoryShort: 'Add Category',
    removeCategoryShort: 'Delete',
    deleteCategoryModeHint: 'Tap any category below to remove it',
    categoryAdded: 'Category added.',
    categoryDeleted: 'Category deleted.',
    keepAtLeastOneCategory: 'At least one category must remain.',
    quickCategoryNamePlaceholder: 'Enter category name...',
    deleteCategoryConfirm: 'Delete this category?',
    categoryInUseNotice: 'At least one category must remain.',
    backupExportSection: 'Backup, Restore & Exports',
    backupData: 'Backup Data (JSON)',
    backupDesc: 'Save a complete local backup file to device storage',
    restoreData: 'Restore Data',
    restoreDesc: 'Restore transactions and categories from a JSON backup file',
    restoreSuccess: 'Backup restored successfully!',
    restoreError: 'Invalid backup file. Please choose a valid Smart Daily Hisab JSON backup.',
    exportPdf: 'Export PDF Report',
    exportCsv: 'Export CSV',
    installApp: 'Install Mobile App',
    installAppShort: 'Install',
    installAppDesc: 'Add to Home Screen for standalone offline access',
    installModalTitle: 'Install Smart Daily Hisab',
    installDirectPrompt: 'Install Now',
    installAndroidStepsTitle: 'Install on Android (Chrome):',
    installAndroidStep1: 'Tap the browser menu (⋮) in the top-right corner.',
    installAndroidStep2: 'Tap "Install app" or "Add to Home screen".',
    installIosStepsTitle: 'Install on iPhone / iPad (Safari):',
    installIosStep1: 'Tap the Share icon in the Safari toolbar.',
    installIosStep2: 'Scroll down and tap "Add to Home Screen".',
    openInBrowser: 'Open in New Browser Tab',
    copyAppLink: 'Copy App Link',
    linkCopied: 'Link Copied',
    appInfoSection: 'App Information & Android Studio Project',
    appInfoTitle: 'Smart Daily Hisab v1.0',
    appInfoDesc: '100% private, offline-first personal finance ledger. No cloud sync or third-party sharing—your data stays exclusively on your device.',
    offlineReady: 'Offline-Ready Local Persistence',
    androidSourceTitle: 'Android Studio Kotlin + Jetpack Compose Source',
    androidSourceDesc: 'Download the complete Android Studio project (Room DB, Material 3, Android Keystore PIN lock, Gujarati/Hindi/English strings).',
    downloadAndroidZip: 'Download Android Studio Project (.zip)',
    save: 'Save',
    close: 'Close',
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    securityQuestions: [
      'What is your closest friend’s name?',
      'What is your birthplace?',
      'What was the name of your first school?',
      'Who was your favorite teacher?',
    ],
  },
};

export function getPaymentMethodLabel(method: PaymentMethod, t: TranslationStrings): string {
  switch (method) {
    case 'cash':
      return t.pmCash;
    case 'upi':
      return t.pmUpi;
    case 'bank_transfer':
      return t.pmBankTransfer;
    case 'debit_card':
      return t.pmDebitCard;
    case 'credit_card':
      return t.pmCreditCard;
    default:
      return t.pmOther;
  }
}
