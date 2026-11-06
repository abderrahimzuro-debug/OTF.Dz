# OTF.Dz

**Open Timeframe Algeria** — مشروع بداية لتطبيق سطح مكتب Windows باستخدام **Tauri 2** و**Vite** و**TypeScript**، مع واجهة عربية ومسار تكامل مستمر يبني المثبتات ويلتقط صور الواجهة تلقائيًا.

> المستودع لم يحتوي على تطبيق سابق؛ أُضيف هنا هيكل بداية صغير، وليس تنفيذًا لوظائف تجارية مفترضة. عدّل الواجهة في `src/` وأوامر سطح المكتب في `src-tauri/src/` لتطوير تطبيقك.

## ماذا يفعل المسار؟

ملف الإعداد: [`.github/workflows/windows-desktop.yml`](.github/workflows/windows-desktop.yml).

| المهمة | بيئة التشغيل | النتيجة |
| --- | --- | --- |
| بناء سطح المكتب | `windows-latest`، مع Rust وMSVC وNode.js | مثبت NSIS بصيغة `.exe`، وحزمة WiX بصيغة `.msi`، وملف تدقيق `SHA256SUMS.txt` |
| معاينة الواجهة | `ubuntu-latest`، مع Chromium headless | أربع صور PNG وتقرير Playwright قابل للتصفح |

المهمتان مستقلّتان ومتوازيتان: فشل بناء Windows لا يمنع التقاط صور الواجهة. يعمل المسار عند **الدفع إلى أي فرع أو وسم**، وعند فتح طلب دمج أو تحديثه، ويمكن تشغيله يدويًا من تبويب الإجراءات. لا يوجد مرشح ملفات يعطّل البناء عند تغيير الواجهة أو Rust أو إعدادات المسار.

## إعداد التطوير على Windows

1. ثبّت **Git** و**Node.js 24**، ثم Rust باستخدام `rustup` بالهدف `x86_64-pc-windows-msvc`.
2. ثبّت **Visual Studio Build Tools 2022** مع حمل عمل **Desktop development with C++**، وأداة Windows SDK ضمن المكونات. لا يكفي وجود محرر Visual Studio Code وحده.
3. تأكد من وجود **Microsoft Edge WebView2 Runtime**؛ يأتي عادةً مع أنظمة Windows الحديثة.
4. من جذر المستودع، نفّذ:

```powershell
node --version
rustc --version
cargo --version
npm ci
npm run desktop:dev
```

5. لتشغيل الواجهة وحدها في المتصفح أثناء التصميم:

```powershell
npm run dev
```

يفتح خادم التطوير المنفذ `1420`. أمر `desktop:dev` يشغّل هذا الخادم ثم نافذة Tauri. أوقف العملية السابقة قبل إعادة تشغيل المنفذ نفسه؛ إعداد المنفذ صارم لتجنب الانتقال إلى منفذ آخر دون انتباه.

## بناء نسخة Windows محليًا

```powershell
npm ci
npm run desktop:build -- --target x86_64-pc-windows-msvc --bundles nsis,msi
```

تظهر الحزم في:

```text
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/
```

ينفّذ Tauri أمر `npm run build` قبل تجميع Rust، بما في ذلك فحص TypeScript. الحزم الحالية **غير موقعة بشهادة نشر**؛ توقيع Windows خطوة منفصلة قبل التوزيع العام. لا تحتاج هذه المرحلة إلى مفتاح تحديث أو أسرار إضافية.

مثبت التطبيق يستخدم `currentUser` ولا يتطلب تثبيتًا لجميع المستخدمين. إعداد WebView2 هو `downloadBootstrapper`، لذلك قد يحتاج جهاز المستخدم إلى الإنترنت لتثبيت وقت تشغيل WebView2 إذا لم يكن موجودًا.

## المعاينة الآلية والصور

الاختبارات في `tests/ui.spec.ts`، والإعداد في `playwright.config.ts`.

- تُبنى الواجهة أولًا، ثم تُقدّم ملفات `dist/` باستخدام `vite preview`، لا باستخدام ملفات HTML مفتوحة مباشرة.
- يدير Playwright تشغيل الخادم وإيقافه؛ في CI لا يعيد استخدام خادم قديم.
- يعمل الخادم داخل جهاز Ubuntu نفسه. عنوان الاختبار `127.0.0.1:4173` عنوان داخلي لجهاز الاختبار، وليس عنوانًا يستخدمه زائر خارجي.
- تُلتقط الواجهة قبل التفاعل وبعد فتح لوحة التفاصيل، في مشروعي `desktop` و`mobile`.
- يفحص الاختبار جاهزية التطبيق، ووضع المتصفح، وظهور التفاصيل، وعدم وجود تجاوز أفقي أو أخطاء JavaScript.
- الخط العربي مضمّن محليًا، والحركة مخفّضة، والصور ثابتة لتقليل اختلاف اللقطات. هذه لقطات **للمراجعة البصرية** وليست مقارنة بكسلية مع صور مرجعية.

لتكرار ذلك محليًا:

```sh
npm ci
npm run build
npx playwright install chromium
npm run screenshots
npm run screenshots:report
```

على Linux، إذا كانت مكتبات المتصفح النظامية ناقصة:

```sh
npx playwright install --with-deps chromium
```

الصور والتقرير محليًا:

```text
artifacts/test-results/ui-capture-initial-UI-desktop/desktop-initial.png
artifacts/test-results/ui-capture-details-UI-desktop/desktop-details.png
artifacts/test-results/ui-capture-initial-UI-mobile/mobile-initial.png
artifacts/test-results/ui-capture-details-UI-mobile/mobile-details.png
artifacts/playwright-report/index.html
```

مجلد `artifacts/` مستثنى من Git؛ تُرفع نتائجه من CI كملفات تنزيل، ولا تُضاف إلى كل دفعة في المستودع.

## تنزيل نتائج GitHub Actions

1. افتح المستودع على GitHub، ثم **Actions**.
2. اختر **Windows Desktop CI**، ثم التشغيل الموافق للدفعة المطلوبة.
3. انتظر انتهاء المهمتين، ثم انتقل إلى قسم **Artifacts** في صفحة ملخص التشغيل.
4. نزّل:
   - `otf-dz-windows-x64-<commit-sha>`: مثبتا Windows وملف التدقيق، بعد نجاح مهمة البناء.
   - `otf-dz-ui-preview-<commit-sha>`: صور PNG وتقرير Playwright، وتُحاول المهمة رفع المتاح حتى عند فشل الاختبار.
5. فك ضغط ملف الصور وافتح `playwright-report/index.html` لمراجعة الصور والنتائج. الصور موجودة أيضًا مباشرة داخل بنية `test-results/` في الأرشيف.

مدة الاحتفاظ المضبوطة في المسار **14 يومًا**، وقد تفرض سياسة المستودع حدًا أقصر. ملفات الرفع مضغوطة وليست رابط معاينة دائمًا أو نشرًا على الإنترنت. تشغيل Ubuntu مؤقت وينتهي مع المهمة.

للتحقق من سلامة مثبت بعد تنزيله، قارن قيمته بالمبلغ في `SHA256SUMS.txt`:

```powershell
Get-FileHash .\OTF.Dz_0.1.0_x64-setup.exe -Algorithm SHA256
```

اسم الملف الفعلي يعتمد على إعدادات Tauri والإصدار؛ استخدم اسم الملف الموجود في الأرشيف.

## أوامر التطوير والفحص

```sh
npm run check
npm run build
npm run screenshots
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

أمرَا Rust يحتاجان متطلبات سطح المكتب المناسبة لنظامك. يفحص المسار تنسيق Rust وينفّذ بناء إصدار كامل؛ يمكن إضافة اختبارات Rust وClippy إلى المسار عند توسيع منطق التطبيق.

توجد ملفات قفل لحزم npm واعتماديات Cargo. بعد تعديل اعتماديات Rust شغّل `cargo update` بوعي، وراجع التغيير في `src-tauri/Cargo.lock` واحفظه مع الاعتماديات. حدّث إصدار التطبيق في `package.json` و`src-tauri/Cargo.toml` و`src-tauri/tauri.conf.json` معًا.

إجراءات GitHub الخارجية مثبتة على أرقام تحقق كاملة، وصلاحيات المسار مقصورة على قراءة المحتوى. تُحفظ ذاكرة Cargo المؤقتة من الفرع الرئيسي، وتستفيد منها التشغيلات الأخرى عند إتاحة ذلك. الدفعات المتتابعة على المرجع نفسه قد تلغي التشغيل الأقدم لصالح الأحدث.

## حدود المعاينة المهمة

**صور Chromium على Ubuntu ليست صور نافذة Windows الأصلية.** إنها تشغّل واجهة الويب نفسها وتراجع تصميمها واستجابتها، لكنها لا تختبر WebView2 أو التثبيت أو تكامل نظام التشغيل. يكشف التطبيق وضع المتصفح بدل محاكاة اتصال أصلي وهمي؛ زر فحص Rust يعمل عند تشغيله داخل Tauri.

قبل إصدار نسخة للمستخدمين، اختبر المثبت والتطبيق على Windows فعلي، وأضف اختبارات تكامل أصلية عند الحاجة. إعدادات الإنتاج تمنع الموارد الخارجية افتراضيًا؛ راجع CSP والصلاحيات عند إضافة خدمات أو إمكانات جديدة. إعداد CSP الخاص بالتطوير أكثر سماحًا لتوافق Vite، ولا يُستخدم في حزمة الإنتاج.

لا ينشئ هذا المسار GitHub Release، ولا يوقّع الحزم، ولا ينشر تطبيقًا تجاريًا، ولا يفعّل التحديث التلقائي. هذه قرارات نشر منفصلة عن بناء كل دفعة والمراجعة البصرية.
