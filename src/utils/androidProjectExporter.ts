import JSZip from 'jszip';

import settingsGradle from '../../android-app/settings.gradle.kts?raw';
import rootBuildGradle from '../../android-app/build.gradle.kts?raw';
import libsVersions from '../../android-app/gradle/libs.versions.toml?raw';
import appBuildGradle from '../../android-app/app/build.gradle.kts?raw';
import androidManifest from '../../android-app/app/src/main/AndroidManifest.xml?raw';
import stringsEn from '../../android-app/app/src/main/res/values/strings.xml?raw';
import stringsGu from '../../android-app/app/src/main/res/values-gu/strings.xml?raw';
import stringsHi from '../../android-app/app/src/main/res/values-hi/strings.xml?raw';
import entitiesKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/data/local/entity/HisabEntities.kt?raw';
import daoKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/data/local/dao/HisabDao.kt?raw';
import databaseKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/data/local/HisabDatabase.kt?raw';
import securityKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/security/PinSecurityManager.kt?raw';
import themeKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/ui/theme/Theme.kt?raw';
import viewModelKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/ui/viewmodel/HisabViewModel.kt?raw';
import screensKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/ui/screens/HisabScreens.kt?raw';
import mainActivityKt from '../../android-app/app/src/main/java/com/smartdailyhisab/app/MainActivity.kt?raw';
import readmeMd from '../../android-app/README.md?raw';
import testingReportMd from '../../android-app/TESTING_REPORT.md?raw';

export async function downloadAndroidStudioProjectZip(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('SmartDailyHisab-AndroidStudio');
  if (!root) return;

  root.file('settings.gradle.kts', settingsGradle);
  root.file('build.gradle.kts', rootBuildGradle);
  root.file('gradle/libs.versions.toml', libsVersions);
  root.file('app/build.gradle.kts', appBuildGradle);
  root.file('app/src/main/AndroidManifest.xml', androidManifest);
  root.file('app/src/main/res/values/strings.xml', stringsEn);
  root.file('app/src/main/res/values-gu/strings.xml', stringsGu);
  root.file('app/src/main/res/values-hi/strings.xml', stringsHi);
  root.file('app/src/main/java/com/smartdailyhisab/app/data/local/entity/HisabEntities.kt', entitiesKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/data/local/dao/HisabDao.kt', daoKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/data/local/HisabDatabase.kt', databaseKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/security/PinSecurityManager.kt', securityKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/ui/theme/Theme.kt', themeKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/ui/viewmodel/HisabViewModel.kt', viewModelKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/ui/screens/HisabScreens.kt', screensKt);
  root.file('app/src/main/java/com/smartdailyhisab/app/MainActivity.kt', mainActivityKt);
  root.file('README.md', readmeMd);
  root.file('TESTING_REPORT.md', testingReportMd);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SmartDailyHisab-AndroidStudio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
