# Turn-Over

A flashcard app that lets you save words instantly with a global shortcut — wherever you are.

**Note:** The Intel version download link has been updated to:

```
https://github.com/mxx-kor/turn-over/releases/download/intel/Turn-Over-0.1.0.dmg
```

Update the macOS (Intel) row in the Download table accordingly.

## Download

| Platform                         | File                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| macOS (Apple Silicon · M1/M2/M3) | [Turn-Over-0.1.0-arm64.dmg](https://github.com/mxx-kor/turn-over/releases/download/release/Turn-Over-0.1.0-arm64.dmg) |
| macOS (Intel)                    | [Turn-Over-0.1.0.dmg](https://github.com/mxx-kor/turn-over/releases/download/release/Turn-Over-0.1.0.dmg)             |

---

## ⚠️ macOS Security Warning

Turn-Over is **not signed with an Apple Developer certificate**. This is intentional — not because it's unsafe, but as a stance against Apple's mandatory $99/year fee required to distribute software without Gatekeeper warnings.

The app is fully open source. You can review every line of code in this repository.

### How to open the app

**Option 1 — Right-click method (easiest)**

1. Right-click (or Control+click) `Turn-Over.app`
2. Select **Open**
3. Click **Open** in the dialog that appears

**Option 2 — System Settings**

1. Try to open the app normally — macOS will block it
2. Go to **System Settings → Privacy & Security**
3. Scroll down and click **Open Anyway**

**Option 3 — Terminal**

```bash
xattr -cr /Applications/Turn-Over.app
```

Then open the app normally.

---

## Features

- **Global shortcut** (⌥⇧A) — save any word as a flashcard from anywhere
- **Auto-detect selected text** — highlights are captured automatically
- **Auto-translate** — the Back field is filled in automatically based on your system language
- **Folder management** — organize cards into folders
- **Study mode** — flip through your cards

---

## Web Version

No download needed — use it directly at [your deployed URL].

---

---

## ⚠️ macOS 보안 경고 (한국어)

Turn-Over는 **Apple Developer 인증서로 서명되지 않았습니다.** 앱이 안전하지 않아서가 아니라, 소프트웨어 배포에 연 $99를 요구하는 Apple 정책에 대한 소극적 시위의 의미입니다.

이 앱은 완전한 오픈소스입니다. 모든 코드를 이 저장소에서 확인할 수 있습니다.

### 앱 여는 방법

**방법 1 — 우클릭 (가장 쉬움)**

1. `Turn-Over.app`을 우클릭 (또는 Control+클릭)
2. **열기** 선택
3. 팝업에서 **열기** 클릭

**방법 2 — 시스템 설정**

1. 앱을 일반적으로 열기 시도 — macOS가 차단함
2. **시스템 설정 → 개인 정보 보호 및 보안** 이동
3. 하단에서 **확인 없이 열기** 클릭

**방법 3 — 터미널**

```bash
xattr -cr /Applications/Turn-Over.app
```

이후 앱을 정상적으로 열기

---

## 주요 기능

- **글로벌 단축키** (⌥⇧A) — 어디서든 단어를 플래시카드로 저장
- **선택 텍스트 자동 감지** — 드래그한 텍스트 자동 입력
- **자동 번역** — 시스템 언어 기반으로 Back 필드 자동 완성
- **폴더 관리** — 카드를 폴더별로 분류
- **스터디 모드** — 카드 플립 학습
