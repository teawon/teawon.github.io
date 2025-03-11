---
title: "Nuxt(Legacy) 프로젝트에 React 모듈 연결하기"

categories:
  - React
tags:
  - React
  - Nuxt
  - MFA

toc: true
toc_sticky: true
toc_label: "목차"

date: 2025-03-09
last_modified_at: 2025-03-11

header:
  teaser: https://github.com/user-attachments/assets/19c500f7-84a8-4e3b-9e46-e16416acd372
---

## 1. 개요

프레임워크는 개발을 용이하게 해주지만, 때로는 확장이나 새로운 기능 추가에 제약을 불러오기도 합니다.

특히, 특정 프레임워크나 환경에서만 실행 가능한 라이브러리는 제한된 선택지를 제공하며, 이로 인해 적합한 솔루션을 찾기 어렵게 만들 수 있습니다. 이러한 점은 아래의 프로젝트에서 직면한 문제와도 맞물렸습니다.

회사의 레거시 시스템은 `Nuxt1`을 기반으로 운영되고 있었고, 이 환경에서 PDF 생성 모듈을 새롭게 개발해야 했습니다. 그러나 PDF 생성 로직이 이미 `React` 기반의 라이브러리로 구현되기로 정해진 상황이었기 때문에, 이 두 가지 기술을 조화롭게 결합하는 것이 과제가 되었습니다.

> Nuxt1은 2018년에 출시되었으며, 현재는 deprecated 되어있다.

결국 핵심 문제는 `Nuxt1`의 레거시 환경에서 요구되는 기능을 구현할 수 있도록 두 상이한 프레임워크를 성공적으로 통합하는 것이었습니다. 이 과정에서 시스템의 기능성을 확장하면서도 기존 시스템의 안정성을 유지하는 솔루션을 마련되어야 했습니다.

이 글에서는 이와 같은 문제를 해결하기 위해 고려했던 접근 방안과 그 과정에서 마주한 고민들을 정리해보고자 합니다.

![Image](https://github.com/user-attachments/assets/19c500f7-84a8-4e3b-9e46-e16416acd372)

## 2. 기술적 선택의 배경

PDF 모듈개발을 위해서는 다음과 같은 요구사항이 충족되어야 했습니다.

1. 다양한 차트를 그릴 수 있을 것

2. 확대된 PDF가 깨지지 않을 것 (텍스트가 비트맵 기반의 이미지로 처리되어선 안된다)

3. PDF 변환 작업은 프론트엔드에서 이루어져야 한다. (높은 결합도, 작업 의존성을 개선하기 위함)

즉 Canvas기반의 이미지를 사용하지 않아야 했고, 지속적으로 관리하고 확장할 수 있는 프로젝트를 구성하기 위한 조건이 필요했습니다.

가장 직관적인 방법은 Nuxt 프레임워크 내에서 직접 PDF 변환 모듈을 개발하는 것 이지만 Nuxt의 종속성에 의해 선택할 수 있는 차트 생성 및 PDF 변환 라이브러리에는 한계가 있었고, 이로 인해 높은 러닝 커브가 요구되었습니다. 더욱이, 이러한 방법은 지속적인 관리와 유지보수에도 명확한 제약이 따랐습니다.

따라서, 이러한 요구사항을 충족하면서 적정 시간 내 개발이 가능하도록, React와 호환 가능한 라이브러리를 사용하여 PDF 변환 모듈을 구현하기로 처리하게 되었습니다.

그럼에도 불구하고, 여전히 해결해야 할 과제가 있었습니다. 두 서로 다른 프레임워크 간의 통합을 어떻게 처리할 것인가 하는 문제였고, 이에 대해 두 가지 주요 접근 방안을 고려했습니다.

<div class="notice">
 <p>1. 별도의 도메인을 분리하여 특정 URL에 접근했을 때 React 앱을 제한적으로 띄우는 방법</p>
</div>

<div class="notice">
 <p>2. React 모듈을 배포한 후, 배포된 JavaScript 파일을 Nuxt 내부에서 동적으로 읽어들이는 방법</p>
</div>

첫 번째 방법은 별도의 도메인으로 관리하는 점에서, 개별 앱의 독립성을 보장하고 특정 기능을 분리하여 관리할 수 있다는 장점이 있었습니다.

그러나 이 방법은 별도의 도메인 관리 포인트가 늘어나고, URL에 종속되어 특정 페이지에서 모달을 띄우는 등의 사용처에 한계가 있었습니다. 또한, 분리된 두 도메인 간의 인증 처리(Auth)가 복잡해질 수 있다는 단점도 고려해야 했습니다.

<br>

두 번째 접근 방법은 React 모듈을 배포한 뒤, 그 배포된 JavaScript 파일을 Nuxt 내부에서 동적으로 읽어들이는 방식이었습니다.

이 방법은 별도의 도메인 관리를 피할 수 있고, Nuxt 환경 내에서 React 모듈을 유연하게 활용할 수 있다는 점에서 큰 장점이 있었습니다. 이렇게 하면 모듈이 특정 페이지나 구성 요소에 종속되지 않고 쉽게 통합될 수 있습니다.

또한, 클라이언트 측에서 자바스크립트를 호출하여 필요한 기능을 실행할 수 있으므로 페이지 전환이나 네비게이션에 제한이 없고, 통합된 UI 흐름을 유지할 수 있다는 이점도 있었습니다.

| **접근 방법**                            | **장점**                                              | **단점**                                                                      |
| ---------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| **1. 별도의 도메인으로 React 앱 띄우기** | - 개별 앱의 독립성 보장<br>- 특정 기능 분리 관리 가능 | - 도메인 관리 포인트 증가<br>- URL 종속으로 사용처 한계<br>- 복잡한 인증 처리 |
| **2. JS 파일을 Nuxt에서 동적 로드**      | - 도메인 관리 불필요<br>- Nuxt 내 유연한 활용 가능    | - CSS 오염문제                                                                |

따라서 위와 같은 이유를 고려해 두 번째 방법을 사용해 문제를 해결하고자 하였습니다.

## 3. 구현 세부 사항

서로 다른 프레임워크간의 이벤트를 처리하기 위해 이벤트 기반 접근 방식을 사용하여 두 프레임워크 간의 원활한 통신을 처리하도록 설계하였습니다.

이를 구현하기 위해 `CustomEvent`를 활용하여 이벤트를 생성하고, 이러한 이벤트를 통해 React와 Nuxt 간의 상호작용을 가능하게 했습니다.

> 왜 CustomEvent을 사용했나?
>
> 초기에는 `window.postMessage`를 사용했으나 다른 출처를 가진 페이지간의 통신을 위해 필요한 기능이 아니라고 생각하여 `CustomEvent`로 전환하였습니다.
>
> window객체는 전역에서 사용되므로 전역 네임스페이스 오염을 최소화하기위해 별도의 객체를 사용하여 데이터를 그룹화하고 응집도를 높이고자하였습니다.

### 3.1 React

#### 3.1.1 이벤트 설계

```ts
// index.html
<html lang="en">
  <head>
    { ... }
  </head>
  <body>
    <div id="react_pdf_module_id"></div>
    { ... }
  </body>
</html>
```

`index.html`은 기존 React 프로젝트에서 사용하는 구조와 동일합니다. 이때 id가 `react_pdf_module_id`인 div 요소는 React 앱이 마운트될 DOM 요소로 지정됩니다.

이를 기반으로 `ReactDOM.createRoot`를 통해 해당 DOM 요소에 React 컴포넌트를 렌더링할 수 있도록 준비합니다

<br>

```ts
// global.d.ts

declare global {
  interface Window {
    myMoudle: {
      mountApp: () => void;
      unMountApp: () => void;
      request: (param: { ... }) => void;
      close: () => void;
      { ... }
    };
  }
}

export {};
```

`global.d.ts` 파일에서는 전역 객체 window에 추가될 모듈의 인터페이스를 선언합니다.

이 인터페이스는 `CustomEvent`를 통해 주고받을 이벤트 메서드들을 정의합니다.

<br>

```tsx
// main.tsx

const mountApp = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (root) {
    root.unmount();
  }

  root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

window.pdfModule = {
  mountApp: () => {
    mountApp("react_pdf_module_id");
  },
  unMountApp: () => {
    if (root) {
      root.unmount();
    }
  },
  request: ( param : { ... }) => {
    const event = new CustomEvent("requestEvent", {
      detail: { action: "request", ...param },
    });
    window.dispatchEvent(event);
  },
  close: () => {
    const event = new CustomEvent("closeEvent", {
      detail: { action: "close" },
    });
    window.dispatchEvent(event);
  },
};
```

`main.tsx`에서는 `global.d.ts`에서 정의된 인터페이스에 대한 실제 구현을 작성합니다.

기존의 React 환경에서는 애플리케이션을 시작과 동시에 마운트하는 방식으로 동작했다면, 현재 구조에서는 Nuxt가 앱을 동적으로 제어하고 요청에 따라 특정 이벤트를 발생시켜야 하므로, 각 동작을 별도의 이벤트로 분리하여 처리합니다.

<br>

```tsx
const MainPage = () => {
  { ... }

  useEffect(() => {
    const handleAwsReportEvent = (event: CustomEvent<PdfRequestEvent>) => {
      const { action, ...param } = event.detail;

      switch (action) {
        case "request":
          { ... }
          break;
        case "close":
          { ... }
          break;
        default:
          { ... }
      }
    };

    window.addEventListener(
      "pdfModuleEvent",
      handlePdfModuleEvent
    );

    return () => {
      window.removeEventListener(
        "pdfModuleEvent",
        handlePdfModuleEvent
      );
    };
  }, []);

  return (
     <PdfPreviewPage { ... } />
  );
};

export default MainPage;
```

실제 PDF 변환 로직에서의 시작 및 종료를 핸들링하는 이벤트는 구현 페이지에서 다음과 같이 처리합니다.

위 예제는 React 컴포넌트 MainPage에서 이벤트 리스너를 설정하고 이벤트가 발생하면 적절한 함수가 호출되어 미리 정의한 이벤트 동작을 수행합니다.

#### 3.1.2 빌드 및 캐싱

앞서 구현한 React 모듈은 독립적인 웹사이트가 아니라 Nuxt에서 동적으로 로드되는 특성을 가지고 있습니다.

따라서, 빌드 후 생성된 파일을 Nuxt가 단순히 읽어들이기만 한다면, 브라우저 캐싱으로 인해 이전 버전의 파일을 계속 읽어오는 문제가 발생할 수 있습니다.

이 문제를 해결하기 위해, 빌드 시 파일 이름에 해시값을 추가하는 전처리 과정을 통해 캐싱 문제를 해결해야합니다.

<br>

```ts
// defaultCache.ts

// 스크립트 동적 로드를 위한 함수
const loadScript = (src: string, name: string, type: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`script[data-name="${name}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.type = type;
      script.async = true;
      script.dataset.name = name;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Error loading ${src}`));
      document.body.appendChild(script);
    } else {
      resolve();
    }
  });
};

// CSS 동적 로드
const loadCSS = (href: string, name: string) => {
  if (!document.querySelector(`link[data-name="${name}"]`)) {
    const link = document.createElement("link");
    link.href = href;
    link.rel = "stylesheet";
    link.dataset.name = name;
    document.head.appendChild(link);
  }
};

// 메인 리소스 로드 함수
const loadResources = async () => {
  await loadScript(
    import.meta.env.VITE_DEPLOY_URL + "assets/main.js",
    "main",
    "module"
  );
  loadCSS(import.meta.env.VITE_DEPLOY_URL + "assets/main.css", "style");
};

loadResources().catch(console.error);
```

애플리케이션에서 JavaScript와 CSS를 포함한 주요 리소스는 각 빌드 시마다 고유한 해시값이 포함된 파일명으로 생성되어 동적 로드가 필요합니다.

각각의 파일을 매번 직접적으로 웹에서 로드하기보다는, 한 곳에서 관리하는 방식은 리소스 로딩을 보다 체계적으로 조절할 수 있는 장점을 제공할 수 있기 때문에 이러한 역할을 수행하는 파일을 분리하였습니다.

<img width="586" alt="Image" src="https://github.com/user-attachments/assets/96917906-cf38-497c-a6bd-58ce65092ccb" />

<br>

```ts
// vite.config.ts

export default defineConfig({
  { ... }
   build: {
    rollupOptions: {
      input: {
        main: './src/main.tsx',
        cache: './src/defaultCache.ts',
      },
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: 'assets/[name].js',
      },
    },
  },
});
```

이어서 파일을 빌드하면 아래와 같은 파일들이 생성됩니다.

```
{ ... }
dist/assets/index-D7WsOEMb.js                108.60 kB
dist/assets/main-C4_uRKNb.css                  0.75 kB │ gzip:   0.35 kB
dist/assets/cache-Cngjqysx.js                  1.10 kB │ gzip:   0.48 kB
dist/assets/main-o7EPCvhK.js               1,710.15 kB │ gzip: 547.53 kB
```

이 과정에서 가장 중요한 점은 `cache.js` 파일이 항상 최신 버전의 스크립트를 참조하도록 보장해야한다는 부분 입니다.

매번 배포 시마다 변경되는 해시값을 모든 외부 프로젝트에서 직접 동기화시키는 것은 비효율적이므로, `cache.js`가 매번 최신의 해시값을 자체적으로 읽어들이고 이를 참조할 수 있도록 내부 처리가 필요합니다.

<br>

```ts
//innerBuildHash.cjs
const fs = require("fs");
const util = require("util");

const directoryPath = __dirname + "/dist/assets";

{ ... }

    // 해시 추출
    const mainHash = getHashByPath(/^main-(.*).js$/, files);
    const cssHash = getHashByPath(/^main-(.*).css$/, files);

    // 파일 경로와 대체 로직
    const cacheJsPath = `${directoryPath}/cache.js`;

    try {
      let content = fs.readFileSync(cacheJsPath, "utf-8");
      content = content.replace(/main\.js/g, `main-${mainHash}.js`);
      content = content.replace(/main\.css/g, `main-${cssHash}.css`);
      fs.writeFileSync(cacheJsPath, content, "utf-8");
    } catch (err) {
      console.error("Error processing files:", err);
    }
  })
  .catch((err) => {
    console.error("Error reading directory:", err);
  });
```

이러한 전처리는 빌드된 파일의 해시 값을 추출하고 이를 기반으로 `cache.js`의 참조를 업데이트하는 과정을 포함합니다.

결과적으로 사용하는 클라이언트에서는 오직 `cache.js` 파일만을 읽어들여 최신의 스크립트들을 참조할 수 있는 환경이 구성됩니다.

### 3.2 Nuxt

```js
<template>
  { .. }
      <div
        id="react_pdf_module_id"
        class="modal-pdf-area">
      </div>
</template>
```

Nuxt에서는 React 모듈이 DOM에 렌더링될 때 사용할 id 값을 지정하여 template을 구성합니다. 이 id 값은 React 앱이 마운트될 DOM 요소를 지정하는 데 사용됩니다.

> 해당 DOM요소에 Pdf모듈이 마운트되며 React앱이 동적으로 로드

<br>

```js
<script>
{ ... }
   loadReactApp() {
      const existingScript = document.querySelector(
        'script[data-name="react_pdf_module_id"]'
      )
      if (existingScript) {
        // 로드된 스크립트가 있다면 React 앱 마운트
        window.pdfModule.mountApp()
        this.$emit('scriptLoaded')
        return
      }

      // js read
      const script = document.createElement('script')
      const scriptSrc = `${process.env.REACT_PDF_MODULE_URL}?time=${new Date().getTime()}`
      script.type = 'module'
      script.src = scriptSrc
      script.async = true
      script.onload = () => this.$emit('scriptLoaded')
      script.onerror = () =>
        this.messageShow('pdf 모듈을 불러오는 중 오류가 발생했습니다.')
      document.body.appendChild(script)
    },
    requestPdfModule() {
      window.pdfModule.request({ ... })
    },
    closePdfModule() {
      window.pdfModule.close()
    },
  }
</script>

```

이어서, 스크립트를 동적으로 로드하고 이벤트를 발생시키는 로직을 작성합니다. `loadReactApp` 메서드는 로드된 스크립트 여부를 확인하고, 없는 경우 새로운 스크립트를 생성하여 DOM에 추가합니다.

이때 스크립트를 로드할 때 src URL 뒤에 **현재 시간을 쿼리 파라미터로 추가함**으로써 캐싱 문제를 해결합니다. 이렇게 하면 매번 새로고침할 때마다 브라우저가 항상 최신의 스크립트를 불러오게 됩니다.

또한, 이 과정에서 Pdf 모듈에서 전처리과정을 거친 `cache.js` 스크립트를 로드하면, 이 파일은 내부적으로 최신 리소스를 자동으로 참조합니다.

<img width="663" alt="Image" src="https://github.com/user-attachments/assets/4292336f-6bda-4fa7-be6c-f5cd35565b2e" />

> 상호작용 다이어그램

<img width="735" alt="Image" src="https://github.com/user-attachments/assets/ea58fd8b-4b0b-4e86-b074-5bedf73329f5" />

> 웹상에서 스크립트를 로드한다

## 4. 이슈 및 고려사항

위 프로젝트를 진행하며 구현 과정에서 겪었던 이슈가 있었습니다. 이러한 문제들과 고민했던 해결 방안들을 다루어보려고 합니다.

### 4.1 CSS 오염

위 구조에 따르면, 결국 React에서 사용된 CSS 파일은 스크립트 형태로 읽어오게 됩니다. 이로 인해, Nuxt 프로젝트와 React 모듈 간의 스타일이 오염되는 문제가 발생했습니다.

특히 PdfModule 개발에 사용된 `reset.css` 파일이 기존 `Nuxt` 프로젝트 css와 서로 간섭하여 예기치 않은 문제가 발생했습니다.

위 문제는 결국 `CSS Modules` 기반의 로컬 스코프로 CSS 적용 범위를 제한하는 방식으로 해결할 수 있었습니다.

그럼에도 불구하고, 의도하지 않은 곳에서 동일한 구조나 이름을 가진 선택자가 예상치 못한 영향을 미칠 수 있다는 점은 예측하기 어렵다는 부분을 고려해야하며 두 환경은 완전히 독립적으로 분리되어야 하므로, CSS 간의 상호 영향에 대한 지속적인 주의와 개선점이 필요하다고 생각했습니다.

### 4.2 테스트의 어려움

위에서 구현한 PDF 모듈은 결국 이벤트 기반으로 작동하기 때문에 실제 변환된 PDF 결과를 디버깅하거나 코드를 테스트하려면 반복적으로 이벤트를 발생시키고 처리해야 하는 번거로움이 있었습니다.

이 문제를 해결하기 위해 테스트 전용 페이지를 따로 분리했습니다.

해당 페이지에서는 직접적인 상호작용을 통해 이벤트를 발생시키고 처리할 수 있도록 처리하였으며 테스트 페이지는 배포 환경에서는 제외되도록 조건부 렌더링을 적용하여 환경을 구성했습니다.

```ts
// App.tsx

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 디버깅용 확인 페이지 */}
          {import.meta.env.MODE === "development" && (
            <Route path="/*" element={<DevPage />} />
          )}
          <Route path="/*" element={<MainPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
export default App;
```

<br>

또한, React 기반의 PDF 모듈은 Nuxt 환경에서 호출되므로, 정적 자산에 대한 경로는 Nuxt를 기준으로 설정해야 합니다.

이를 위해 환경 변수를 사용하여 전체 경로를 명시적으로 지정하고, 모든 환경에서 통일된 경로 참조가 가능하도록 다음과 같은 처리를 해야했습니다.

```tsx
<Image src={import.meta.env.VITE_DEPLOY_URL + "images/iconExample.png"}></Image>
```

> local 환경에서는 명시적으로 "/" 경로를 지정하여 개발 환경 내 테스트에 문제가 없도록 처리

### 4.3 스크립트 의존성

```ts
// defaultCache.ts
const loadResources = async () => {
  await loadScriptSequentially([
    {
      src: import.meta.env.VITE_DEPLOY_URL + "lib/a.js",
      name: "a",
      type: "text/javascript",
    },
    {
      src: import.meta.env.VITE_DEPLOY_URL + "lib/b.js",
      name: "b",
      type: "text/javascript",
    },
    {
      src: import.meta.env.VITE_DEPLOY_URL + "lib/c.js",
      name: "c",
      type: "text/javascript",
    },
    {
      src: import.meta.env.VITE_DEPLOY_URL + "lib/d.js",
      name: "d",
      type: "text/javascript",
    },
  ]);

  // main.js
  loadScript(
    import.meta.env.VITE_DEPLOY_URL + "assets/main.js",
    "main",
    "module"
  );
  // main.css
  loadCSS(import.meta.env.VITE_DEPLOY_URL + "assets/main.css", "style");
};

loadResources().catch((error) => console.error(error));
```

React PDF 모듈에서는 특정 라이브러리와의 호환을 위해 스크립트가 동적으로 로드되어야하는 문제가 존재했습니다.

단순히 스크립트를 읽어오는 로직을 넣었을때에는 스크립트의 의존관계가 고려되지 않아 문제가 발생했고,

스크립트를 관리하는 cache 파일에 다음과 같은 로직을 넣어 올바른 스크립트의 로드 순서를 보장할 필요가 있었습니다.

> React앱이 마운트되기전, 필요한 라이브러리의 스크립트가 로드되지 않으면 앱 자체가 띄워지지 않았다.

## 5. 결과 및 정리

이번 프로젝트를 통해 Nuxt 환경에서 React 기반 모듈을 유연하게 호출하고 사용할 수 있는 시스템을 구현할 수 있었습니다.

결과적으로 다음과 같은 장점이 있었습니다.

1. **독립적 모듈 관리**: 모듈을 개별적으로 관리할 수 있게 되면서, 수정 사항이 발생할 경우 React 프로젝트만 독립적으로 배포할 수 있게 되었습니다.

2. **프레임워크 제약 탈피**: 기존 Nuxt 프레임워크의 종속성에서 벗어나, 새로운 기능을 보다 자유롭게 통합할 수 있는 유연성을 확보할 수 있었습니다.

<br>

그럼에도 불구하고 몇 가지 한계와 아쉬운 점도 있었습니다.

1. **정보 관리의 복잡성**: React 앱이 마운트될 때의 DOM ID 값이나 이벤트 정보는 두 프로젝트에서 별도로 명시해야 하기에, 잘못된 정보 입력 시 처리 어려움과 이벤트 요청의 타입 추론이 자동화되지 않아 사용상 직관성과 안정성이 부족할 수 있습니다.

2. **추가적인 네트워크 및 복잡성**: 웹 상에서 별도의 스크립트를 다운로드하여 처리해야 하므로, 추가적인 네트워크 자원이 필요하며, 시스템의 복잡도가 증가할 수 있다는 단점도 존재합니다.

결론적으로, 이번 프로젝트를 통해 많은 것을 배울 수 있었고, 이러한 경험을 바탕으로 향후 유사 프로젝트에서 더 나은 해결책을 찾을 수 있기를 기대합니다.

> 모든 기술에는 정답이 없기 마련이지만, 이러한 아쉬운 점들을 보완해 나가는 것은 매우 중요하다고 생각합니다. 예를 들어, 웹컴포넌트에서는 `Shadow DOM` 개념을 사용해 위에서 언급했던 CSS오염문제를 해결했다고 하니 해당 방법을 사용하는 것도 좋은 접근방법이 되었을 것 같다는 생각이 드네요..!

## 참고자료

[CustomEvent](https://developer.mozilla.org/ko/docs/Web/API/CustomEvent/CustomEvent)

[CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)

[MFA](https://medium.com/twolinecode/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-mfa-chapter4-by-%EC%9D%B4%EB%8F%99%ED%98%95%EB%8B%98-fbc155b718c6)
