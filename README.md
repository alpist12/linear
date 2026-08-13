# 🍸 칵테일 레시피 앱

칵테일 레시피를 모아 보여주는 모바일 앱입니다. 순수 HTML/CSS/JS 웹앱을
[Capacitor](https://capacitorjs.com)로 감싸서 안드로이드 APK로 빌드합니다.

## 기능

- 30가지 칵테일 레시피 (재료, 분량, 만드는 법, 잔 종류, 도수, 가니시)
- 이름/재료 검색
- 베이스 술(진, 보드카, 럼, 위스키, 데킬라 등)별 필터
- 즐겨찾기 (기기에 저장)

## 프로젝트 구조

```
www/                  실제 앱 화면 (정적 웹앱)
  index.html
  css/style.css
  js/app.js
  data/cocktails.json  칵테일 레시피 데이터
android/               Capacitor가 생성한 안드로이드 네이티브 프로젝트
capacitor.config.json  앱 ID, 이름 등 Capacitor 설정
.github/workflows/build-apk.yml  GitHub Actions에서 자동으로 APK 빌드
```

## APK 만드는 방법

### 방법 1. GitHub Actions로 자동 빌드 (추천)

이 저장소에 push 하면 `.github/workflows/build-apk.yml` 워크플로우가 자동으로
실행되어 디버그 APK를 빌드합니다.

1. GitHub 저장소의 **Actions** 탭 → `Build Android APK` 워크플로우 실행 확인
2. 완료되면 해당 실행(run) 페이지 하단의 **Artifacts** 에서
   `cocktail-recipes-debug-apk` 를 다운로드
3. 압축을 풀면 `app-debug.apk` 파일이 있습니다. 안드로이드 기기에 설치하세요
   (출처를 알 수 없는 앱 설치 허용 필요).

> 이 개발 환경(샌드박스)은 보안 정책상 안드로이드 SDK를 내려받는 `dl.google.com`
> 접근이 막혀 있어 로컬에서 바로 APK를 컴파일할 수 없습니다. 그래서 실제 컴파일은
> 위 GitHub Actions에서 이루어지도록 구성했습니다.

### 방법 2. 로컬(내 PC)에서 빌드

Android Studio 또는 Android SDK + JDK 17이 설치되어 있어야 합니다.

```bash
npm install
npx cap sync android

# Android Studio로 열어서 빌드하려면
npx cap open android

# 또는 커맨드라인으로 디버그 APK 빌드
cd android
./gradlew assembleDebug
# 결과물: android/app/build/outputs/apk/debug/app-debug.apk
```

### 릴리스(서명) APK

배포용 서명 APK가 필요하면 키스토어를 만들고 `android/app/build.gradle`의
`signingConfigs`에 등록한 뒤 `./gradlew assembleRelease`를 실행하세요.
자세한 방법은 [공식 문서](https://developer.android.com/studio/publish/app-signing)를
참고하세요.

## 웹에서 미리보기

브라우저에서 UI만 빠르게 확인하고 싶다면:

```bash
npx http-server www -p 8080
```

이후 `http://localhost:8080` 접속.

## 레시피 추가/수정하기

`www/data/cocktails.json` 파일에 항목을 추가하면 앱에 바로 반영됩니다. 각 항목은
`id, name, nameEn, category, base, glass, abv, difficulty, emoji, color, tags,
ingredients, instructions, garnish` 필드를 가집니다.
