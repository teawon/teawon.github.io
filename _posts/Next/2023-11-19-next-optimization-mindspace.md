---
title: "초기 로딩속도 및 사용자 경험 개선시키기"

categories:
  - Next
tags:
  - Next13
  - 지연 로딩
  - 이미지 최적화
  - 폰트 최적화
  - Lighthouse
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-11-19
last_modified_at: 2023-11-19
---

## 1. 개요

아래 영상은, 현재 진행중인 프로젝트의 메인페이지에 접근했을때 표현되는 UI입니다.

![before](https://github.com/teawon/teawon.github.io/assets/78795820/ec8a3441-0e3e-44ac-bfc3-dfdc93bb94ec)

> 실제 로딩시간을 표현하기 위한 "Click! & Loading 텍스트 삽입" (영상편집)

그런데, 너무 느립니다..

특히, 데이터를 가져오는 동안 시작 페이지가 정지해 있는 듯한 인상을 주어 사용자들이 혼란을 느낄 수 있으며 이러한 문제는 사용자 경험(UX)에 부정적인 영향을 미칠 수 있습니다.

핵심 페이지에서의 첫 인상은 사용자의 프로젝트 인식에 결정적인 역할을 합니다. 페이지가 로딩 중에 버벅이거나 멈춘 것처럼 보이는 것은 기술적인 문제가 있다는 인상을 줄 수 있고 이는 문제 해결의 필요성을이 강조되었습니다.

따라서 이 글에서는 문제를 파악하고 사용자 UI를 개선시키기 위해 적용한 방법들에 대해 정리해보려고 합니다.

## 2. 로딩 UI

프로젝트의 시작 페이지에서 메인 페이지로 이동하는 과정은 사용자에게 중요한 전환점입니다.

이때 데이터 로딩을 기다리는 동안 메인 페이지의 정지한 듯한 상태는 사용자에게 혼란과 불편함을 줄 수 있기때문에 적절한 로딩 UI를 띄워야 합니다.

적절한 로딩 스피너의 사용은 사용자에게 로딩 중임을 분명하게 전달함으로써, 백그라운드에서 진행되는 데이터 로딩 과정을 인지하게 하고, 이를 기다릴 수 있도록 안내합니다.

### 2.1 로딩 스피너 구현

Next에서는 `loading.js` 폴더를 사용해 쉽게 로딩상태에 대한 UI를 표현할 수 있습니다.

<img width="162" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/376d0944-ccae-46c0-9160-876503e42bf3">

> [참고자료](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

따라서 같은 방식으로 loading.tsx 파일을 구성합니다.

```javascript
import MoonLoadSpinner from "@/components/MoonLoadSpinner";

export default function Loading() {
  return <MoonLoadSpinner />;
}
```

또한 스피너 컴포넌트는 아래와 같이 Lottie를 사용해 구현했습니다.

```javascript
"use client";
import { getLottieOptions } from "@/utils/lottie";
import Lottie from "react-lottie";
import styles from "./MoonLoadSpinner.module.scss";

const MoonLoadSpinner = () => {
  return (
    <>
      <div className={styles.wrapper}>
        <Lottie
          options={getLottieOptions("/lotties/moon.json")}
          height={300}
          width={300}
        />
      </div>
    </>
  );
};

export default MoonLoadSpinner;
```

### 2.2 트러블 슈팅

사실 위 코드는 실제 의도한대로 돌아가지 않았습니다.

왜냐하면 메인페이지의 데이터는 SSR을 적용하고 있었으나 `MoonLoadSpinner`는 클라이언트 컴포넌트("use client")로 구현되어있었기 때문에
SSR 환경에서 서버는 데이터를 처리하고 페이지를 렌더링하는 동안 클라이언트 측 컴포넌트인 MoonLoadSpinner는 활성화되지 않았습니다.

즉, 서버에서 데이터를 로드하는 동안 클라이언트 기반의 로딩 UI는 전혀 표시되지 않는 문제가 발생한거죠.

**로딩에 사용되는 컴포넌트는, 서버 컴포넌트로 구현** 해야했습니다

그러나 Lottie를 사용했을 때 아래의 에러가 발생했으며 어쩔 수 없이 다른 방식으로 스피너를 구현하며 우회하는 방식으로 처리했습니다.🥲

```javascript
Unhandled Runtime Error
Error: useRef only works in Client Components. Add the "use client"

directive at the top of the file to use it. Read more ...

// 내부에서 useRef를 사용하고 있다🥲
```

## 3. 성능 개선

## 3.1 지연 로딩

성능 개선을 위한 첫 단계로, 웹사이트의 성능 분석이 필수적입니다. 이를 위해 저는 Google의 Lighthouse 도구를 사용하여 웹사이트의 성능을 평가하고, 주요 문제점들을 식별했습니다.

<br>

<img width="695" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/67793ca2-59d9-441e-9d65-6dfa2524b489">

> [Lighthouse - Performance]
>
> 메인 페이지에 접속했을때의 성능 측정 결과

메인 페이지의 로딩 성능을 측정한 결과, map과 modal 컴포넌트에서 데이터를 로드하는 데 상당한 시간이 소요되고 있음을 발견했습니다.

map(메인) 페이지에서는 노드 연결관계를 표현하기 위해 `react-force-graph` 라이브러리를 사용하고 있었고, modal은 사용자가 노드를 클릭했을 때 활성화되는 컴포넌트로, `ag-grid` 및 `toast-ui`가 사용중이였습니다.

사실 Modal은 사용자가 "클릭" 한 후에 표현되는 요소이기때문에 당장은 화면상에 표현하지 않는데, 불필요하게 첫 렌더링에 영향을 미치고 있던거죠.

<img width="592" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/576e2a6f-2100-43ce-9c0f-bcd6d40fd0b3">

> 특정 별자리 정보를 클릭했을때 글 작성 용도로 사용하던 `toast-ui`

<img width="644" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/7f8c107e-dfb3-4782-b3bc-bcfea77b972c">

> 특정 별자리 정보를 클릭 후 게시글 목록에 들어갔을 때 사용하던 `ag-grid`

<br>

따라서 모달 컴포넌트는 굳이 빠르게 로드될 필요가 없으며 초기 렌더링 성능에 부정적인 영향을 미쳤기때문에 맵 정보가 모두 로드되고 사용자의 설정이 완료된 이후에만 모달창 관련 요소를 로드하도록 코드를 재구성했습니다

```javascript
// 수정 전
import NodeModal from "./components/Modal";

// {...}

  return (
    <div>
    { ... }
      {nodeInfo && (
        <>
          <NodeModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            updateNodeInfo={handleNodeInfoUpdate}
          />
        </>
      )}
    </div>
```

> 데이터가 있다면 모달 컴포넌트도 함께 렌더링했다. (필요 이상의 리소스가 초기 로딩 시 사용)

```javascript
// 수정 후
const NodeModalLazy = lazy(() => import("./components/Modal"));

// {...}

 return (
    <div>
    {...}
      {nodeData && isInitialSetupDone && (
        <Suspense fallback={<Loading />}>
          <NodeModalLazy
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            updateNodeInfo={handleNodeInfoUpdate}
          />
        </Suspense>
      )}
    </div>
  );

  // isInitialSetupDone - 노드 관계에 대한 초기 설정 상태

```

> React.lazy와 Suspense를 활용하여 모달 컴포넌트를 지연 로딩
>
> 데이터를 받아오고, 노드간의 연결관계에 대한 설정과 렌더링이 끝나면 이어서 바로 Modal컴포넌트를 렌더링

<br>

그 결과 적절한 타이밍에 로드되도록 함으로써 초기 렌더링 속도를 개선시킬 수 있었습니다.

<img width="695" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/a53abe6a-f34f-461f-8c85-114e82c9cb60">

> 398ms에서 198ms로 LCP(Largest Contentful Paint)가 실질적으로 약 50% 향상

> 두 데이터 로드 시점이 분리되었다

## 3.2 정적 리소스 최적화

또한 Lighthouse의 페이지 기능을 통해 분석해본 결과 프로젝트에서 사용 중인 폰트와 배경 이미지의 네트워크 페이로드가 상당하다는 점을 확인했습니다.

<img width="691" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/69c3687f-4f22-4ac8-8f3c-a9c5346492a0">

따라서, 배경이미지 및 로고와 폰트의 확장자를 바꾸고 촤적화 작업을 진행했습니다.

이미지의 경우 [squoosh.app](squoosh.app) 사이트를 통해, webp확장자로 수정하였습니다.

<img width="603" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/619ed9a9-b0a9-498f-9a33-0336cd04a3f4">

> webp 확장자의 경우 높은 압축률과 품질유지 특징을 가진다(이전과 이후의 차이가 눈에 두드러지지 않음)
>
> 1.2MB에서, 26Kb로 약 95%가량 압축

<br>

폰트의 경우 woff2 확장자를 통해 최적화를 진행했습니다.

> WOFF2는 웹 폰트의 표준 포맷 중 하나로, 뛰어난 압축 효율을 제공
>
> 878KB에서, 388KB로 약 55%가량 압축

### 3.2.1 Next Image

사실 위의 번거로움 없이, Next에서는 이미지 최적화를 위한 Image 컴포넌트를 제공합니다.

실제 png기반의 커다란 이미지를 사용해도, 자동으로 WebP 및 AVIF와 같은 최신 이미지 형식으로 변환주기때문에 개발자가 번거롭게 각 이미지를 변환할 필요가 없어지는거죠.

```javascript
// example
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/profile.png"
      width={500}
      height={500}
      alt="Picture of the author"
    />
  );
}
```

<br>

```javascript
// global.scss
body {
  ....
  background-image: url("/images/BackGround.png");

}

```

> 기존의 배경 이미지 적용 코드

그러나 기존 배경이미지의 경우 css를 활용해 적용하고 있었습니다. 단순히 배경이미지의 포멧을 변경해도 괜찮지만

뷰포트에 따라 적절한 이미지를 자동으로 선택해주는 강력한 이점을 가진 Next의 Image를 활용하기로 결정했습니다.

```javascript
//layout.tsx

import styles from "./main.module.scss";

{...}

<html lang="en">
  <head>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body className={inter.className}>
    <Image
      className={styles.background}
      src="/images/background.png"
      alt="background"
      fill
    />
    {...}
  </body>
</html>


// main.module.scss

.background {
  z-index: -100;
}

```

<img width="498" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/cc71f620-6588-4a3a-b39c-2d604f2e1611">

<img width="498" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/4d4c70c9-8f2f-48e4-b2c0-f837aada637f">

> 데스크탑과 모바일 환경에서의 뷰포트에 따라 실제 다른 크기의 이미지를 받아온다
>
> png파일을 사용했음에도 자동으로 webp기반의 최적화된 이미지를 사용한다

### 3.2.2 Next Font

Next에서는 font에 대한 최적화 기능도 지원합니다.

`@next/font`은 아래의 특징을 가지고 있습니다.

1. 자동 자체 호스팅과 캐싱: 자동으로 폰트 파일을 자체 호스팅하며, 캐싱과 사전 로드를 지원합니다. 이는 폰트 로딩 속도를 개선합니다.
2. 폰트 자동 최적화: 다양한 최적화 기법을 통해 폰트의 로딩 시간을 최소화합니다.
3. 빌드시 다운로드: 특히 Google 폰트를 사용하는 경우, 빌드 시점에 폰트를 다운로드하여 별도의 외부 요청을 보내지 않습니다.
4. 레이아웃 이동 방지: 폰트 로딩으로 인한 페이지 레이아웃의 변동을 방지합니다.

이러한 기능을 활용하여 기존에 global CSS에서 적용하던 방식 대신 Google 폰트를 사용하여 폰트 로딩 방식을 개선했습니다.

```javascript
//layout.tsx

import { Akshar } from "next/font/google";

const akshar = Akshar({ preload: false }); // 한글의 경우 subset지원 안한다고합니다.
...


return (
    <html className={inter.className} lang="en">
        {...}
    </html>
  );

```

결과적으로 구글폰트로 변경하며 기본 사양에 차이는 있겠지만 54ms에서 8ms로 읽어오는데 많은 시간이 개선되었습니다

## 4. 결과

![before](https://github.com/teawon/teawon.github.io/assets/78795820/ec8a3441-0e3e-44ac-bfc3-dfdc93bb94ec){: width="300" height="400"}
![after](https://github.com/teawon/teawon.github.io/assets/78795820/ca72cf18-09a4-49e7-adb7-7e0a2349f85c){: width="300" height="400"}

> 이전 / 이후

## 5. 참고자료

[https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)

[https://nextjs.org/docs/app/building-your-application/optimizing/images](https://nextjs.org/docs/app/building-your-application/optimizing/images)

[https://nextjs.org/docs/pages/api-reference/components/image](https://nextjs.org/docs/pages/api-reference/components/image)

[https://nextjs.org/blog/next-13#nextimage](https://nextjs.org/blog/next-13#nextimage)

[https://nextjs.org/docs/pages/building-your-application/optimizing/fonts](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts)

[https://fe-developers.kakaoent.com/2022/220714-next-image/](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts)

[https://web.dev/articles/css-size-adjust?hl=ko](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts)
