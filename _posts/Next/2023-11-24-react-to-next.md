---
title: React에서 Next.js로, 마이그레이션 경험기

categories:
  - Next
tags:
  - Next13
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-11-24
last_modified_at: 2023-11-24

header:
  teaser: https://github.com/teawon/teawon.github.io/assets/78795820/89a9b0d9-2008-4119-b51d-850552f7f459
---

## 1. 마이그레이션 배경

현재 진행 중인 프로젝트는 커뮤니티 기반의 서비스로, 사용자들이 다양한 정보와 지식을 공유하는 플랫폼입니다.

![map_page](https://github.com/teawon/teawon.github.io/assets/78795820/6e4a4268-7f11-4246-90f7-1d9fa7ae0fcf)

> 하나의 페이지에서 글 작성, 조회, 댓글 작성 등 핵심 상호작용 요소를 처리

이러한 특성상, 사용자의 참여와 콘텐츠의 가시성은 핵심 요소라고 생각했으며 SEO 성능의 향상은 프로젝트에 있어 매우 중요한 고려사항이 되었습니다. <u>검색 엔진을 통한 새로운 방문자의 유입과 콘텐츠의 더 넓은 확산을 위해서는 검색 엔진에 최적화</u>되어야 했습니다.

또한 프로젝트의 핵심이 되는 주요 페이지는 다양한 상호작용이 중심이 되는 곳입니다. 그러나 이 페이지의 <u>로딩 속도가 상대적으로 느려</u> 사용자 경험에 부정적인 영향을 미치고 있었습니다. 이는 우리 서비스의 핵심 가치인 빠르고 효율적인 사용자 경험을 제공하는 데 장애가 되었습니다.

이러한 문제들을 해결하기 위해, React에서 Next.js로의 전환을 결정했습니다. Next.js의 서버 사이드 렌더링(SSR) 기능은 초기 페이지 로딩 속도를 크게 향상시킬 뿐만 아니라, SEO 최적화에도 큰 이점을 제공합니다. 이러한 기술적 전환을 통해, 사용자 경험을 개선하고, 검색 엔진을 통한 콘텐츠의 더 넓은 확산을 기대하였습니다.

## 2. Next

Next.js는 React 기반의 전체 스택 웹 애플리케이션을 구축하기 위한 프레임워크입니다. 사용자 인터페이스 구축을 위해 React 컴포넌트를 사용하고, 추가적인 기능과 최적화를 위해 Next.js를 활용합니다.

핵심 특징으로는 아래 요소가 있습니다.

라우팅: 파일 시스템 기반 라우터로, 레이아웃, 중첩 라우팅, 로딩 상태, 오류 처리 등을 지원합니다.

렌더링: 클라이언트 사이드 및 서버 사이드 렌더링 지원. 서버에서 정적 및 동적 렌더링을 최적화합니다. Edge 및 Node.js 런타임에서 스트리밍 지원.

데이터 페칭: 서버 컴포넌트에서 async/await을 사용한 간소화된 데이터 페칭. 요청 메모이제이션, 데이터 캐싱 및 재검증을 위한 확장된 fetch API 지원.

스타일링: CSS 모듈, Tailwind CSS, CSS-in-JS를 포함한 선호하는 스타일링 방법 지원.

최적화: 이미지, 글꼴 및 스크립트 최적화를 통해 애플리케이션의 핵심 웹 바이탈과 사용자 경험 개선.

TypeScript: 더 나은 타입 체킹과 효율적인 컴파일 지원, 사용자 정의 TypeScript 플러그인 및 타입 체커 지원.

> [공식문서](https://nextjs.org/docs)

저는 Next.js의 13버전을 사용했습니다. (2023년 11월 24일 현재 최신 버전은 14)

## 3. 개선 결과

이 부분에서는 동일한 API 서버를 대상으로 React와 Next.js의 코드 내용을 비교하며 얻은 결과를 다룹니다. (배포 환경)

### 3.1 SEO

<img width="763" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/bb7794df-3edb-42d8-94a6-f5711b0bb3ed">

> React

<img width="763" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/a239a332-08f3-4db7-9858-c473bad69977">

> Next

위 이미지는, Google Lighthouse를 통해 측정한 메인페이지의 지표입니다.

실제 SEO지표가 80에서, 100으로 유의미한 상승을 가져왔습니다.

<br>

React의 경우 메타 데이터 작성을 위해서는 별도의 라이브러리를 사용하거나 `<head>` 태그 내에 직접적으로 설정해야합니다.

이와 대조적으로 Next.js에서는 서버 사이드에서 동적으로 메타 데이터를 생성하고 관리할 수 있는 기능과 더불어, 페이지별로 레이아웃 기반의 메타 데이터 설정이 가능합니다.

따라서 상대적으로 쉽고 상세한 메타데이터를 보다 직관적으로 관리할 수 있는 이점이 크게 느껴졌습니다.

```javascript
// layout.tsx
export const metadata: Metadata = {
  title: "Mindspace",
  description:
    "Mindspace는 개발에 관련된 각 키워드를 노드와 노드 사이의 연결 관계로 표현하여 사용자에게 학습 방향을 제공하는 사이트입니다.",
  keywords: "개발, 프로그래밍, 학습, 연결 관계, 노드, 키워드",
  metadataBase: new URL("http://localhost:3000"), //FIXME : 향후 실제 도메인으로 수정
  openGraph: {
    title: "Mindspace",
    description:
      "Mindspace는 개발에 관련된 각 키워드를 노드와 노드 사이의 연결 관계로 표현하여 사용자에게 학습 방향을 제공하는 사이트입니다.",
    images: [
      {
        url: "/images/logo.png",
      },
    ],
    type: "website",
  },
};
```

CSR을 사용하는 React 애플리케이션은 초기에 서버에서 빈 HTML을 불러온 후, 실제 콘텐츠를 클라이언트 측 JavaScript가 실행된 후에 화면에 표시합니다. 이 구조는 검색 엔진이 페이지의 핵심 콘텐츠를 제대로 인식하지 못하게 하여 SEO 순위에 부정적인 영향을 미칩니다.

반면, SSR을 사용하는 Next.js는 서버에서 페이지의 전체 HTML을 렌더링하고 필요한 콘텐츠와 데이터를 포함해 클라이언트에 전송합니다. 이 접근 방식은 검색 엔진이 페이지 콘텐츠를 즉시 인식하고 색인화할 수 있게 하여, SEO 성능을 크게 향상시키므로 이러한 부분도 점수 향상에 긍정적인 영향을 미쳤습니다.

[관련 블로그 글](https://teawon.github.io/cs/csr-ssr/)

### 3.2 초기 로딩 속도

<img width="763" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/1ac3e711-a2a7-447b-834d-9e2800c573d8">

> React

<img width="763" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/664fa8ca-49c9-4a45-8c06-f2f6a3414de1">

> Next

이어서, 핵심 페이지의 Lighthouse 측정 지표 결과입니다. 실제 Performance 점수에서 차이가 두드러졌는데 실질적인 내용을 분석해보았습니다.

1. api 요청 속도 비교

![image](https://github.com/teawon/teawon.github.io/assets/78795820/8004894a-1a3c-4587-8c95-26e4d81c436f)

> React에서의 "노드정보 반환 API" 응답 시간

![image](https://github.com/teawon/teawon.github.io/assets/78795820/21b63297-a864-4527-bd2a-68f0af7c8e15)

> Next.js에서의 "노드정보 반환 API" 응답 시간

React에서는 API의 응답 시간이 약 10ms로 나타났습니다. 이는 클라이언트 사이드 렌더링(CSR) 방식에서 데이터를 브라우저에서 직접 처리하기 때문에 발생하는 짧은 응답 시간을 나타냅니다.

반면, SSR을 적용한 Next.js에서는 동일한 API 요청에 더 많은 시간이 소요되었습니다. SSR 환경에서 서버가 콘텐츠 렌더링을 담당하고, 이를 클라이언트에 전송하면서 데이터 처리와 전달에 추가 시간이 필요합니다. 이는 서버가 데이터를 불러와 HTML을 생성하는 과정에서 발생하는 지연 때문입니다.

이러한 결과에도 불구하고, Next.js의 초기 페이지 로딩 속도는 React보다 빠르게 나타났습니다.

<br>

<img width="915" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/5a931af6-3678-4789-9a0f-9c22ce2afa00">
> React

<img width="915" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/07df4402-ff00-42e3-a63e-037c2290c2ec">

> Next

실제 타이밍 지표 정보는 아래와 같습니다.

| Metric | React (ms) | Next.js (ms) |
| ------ | ---------- | ------------ |
| FP     | 384        | 86           |
| FCP    | 384        | 86           |
| DCL    | 370        | 280          |
| LCP    | 404        | 131          |
| L      | 482        | 401          |

<img width="400" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/89a9b0d9-2008-4119-b51d-850552f7f459">

> FP(First Paint)는 웹 페이지 로딩 과정에서 사용자가 화면에 처음으로 어떤 시각적 변경을 볼 수 있는 시점
>
> FM (First Meaningful Paint): 페이지의 주요 콘텐츠가 화면에 표시되기 시작하는 시점
>
> FCP (First Contentful Paint): 페이지의 첫 번째 콘텐츠가 화면에 표시되기 시작하는 시점
>
> DCL (DOMContentLoaded): HTML 문서가 완전히 로드되고 파싱되었지만, 스타일시트, 이미지, 프레임 같은 하위 리소스는 로드 중일 수 있는 시점
>
> LCP (Largest Contentful Paint): 페이지의 가장 큰 콘텐츠가 화면에 표시된 시점
>
> L(Onload Event) (Load): 전체 페이지와 모든 관련된 리소스가 완전히 로드된 시점

<br>

이러한 결과는 두 프레임워크의 렌더링 방식 차이에서 비롯된다고 생각합니다.

React의 CSR(Client-Side Rendering)에서는 초기 콘텐츠 렌더링이 JavaScript 로드와 실행에 의존하기 때문에 상대적으로 늦게 나타났습니다.

> <img width="300" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/ee268099-aa4e-457b-8892-9150a18390d7">

반면, Next.js는 서버 사이드 렌더링(SSR)을 활용하여 초기에 서버로부터 받아온 HTML을 별도의 JavaScript 실행 없이 빠르게 화면에 표현합니다. 그러나 LCP와 전체 리소스 로드 시점간의 간격이 React에 비해 크게 나타났습니다. 이와 같은 간극은 사용자에게 혼란을 줄 수 있으며, 사용자 경험 측면에서는 주의 깊게 고려해야겠죠

아무튼 위의 결과는 Next.js의 최적화 로직이 어느 정도 반영되었다는 점을 감안할 때, 순수 SSR과 CSR 간의 속도 차이를 완전히 명확하게 평가하기는 어렵지만, 속도 측면에서의 이점은 분명하다고 생각합니다.

## 4. 트러블 슈팅

React에서 Next.js로의 마이그레이션을 시작할 때, 같은 React 기반 프레임워크라는 점에서 순조롭게 진행될 줄 알으나 실제 과정은 이러한 기대와는 달랐습니다😥

아래는 겪었던 이슈입니다.

- 라이브러리 호환성 문제

  - Lottie, React-force-graph , TOAST-UI와 같이 사용하던 라이브러리에서 SSR지원을 해주지 않아 라이브러리를 동적으로 import하는 방식으로 코드를 수정해야 했습니다.

  ```javascript
  export default async function HydratedNode() {
    const MapPage = dynamic(() => import("./map"), {
      ssr: false,
    });

  { ... }

  return (
      <HydrateOnClient state={dehydratedState}>
        <MapPage />
      </HydrateOnClient>
    );
  }
  ```

  - 특히 서버 컴포넌트에서 사용해야 했던 로딩 컴포넌트는 Lottie와의 호환성 문제로 인해 다른 이미지 확장자로 변경하는 등의 조치가 필요했습니다.

- 로그인 토큰 관리

  - SSR 환경에서는 기존에 로컬 스토리지에 저장되던 토큰 정보에 접근할 수 없었습니다. 이에 따라 토큰을 쿠키에 저장하는 방식으로 로직을 변경했습니다.

- 라우팅 관리

  - React의 react-router-dom을 사용하는 대신, Next.js에서는 폴더 구조 기반의 라우팅을 사용했습니다. 이에 따라 로그인 권한 체크 및 라우팅 관리를 위해 미들웨어를 도입했습니다.

  - [관련 블로그 링크](https://teawon.github.io/next/auth-router-handle/)

- Axios에서 Fetch로의 전환

  - 공식 문서에서는 Fetch 사용을 권장했습니다. 이에 따라 기존의 Axios 기반 코드를 Fetch로 전환했으며, SSR과 CSR 환경에서 쿠키 접근 방식의 차이로 인해 관련 로직 수정에도 문제를 겪었습니다.

## 5. 후기

Next.js로의 전환은 성능 개선과 SEO 향상이라는 명확한 이점을 가져왔지만, 이 과정을 돌이켜보면 "과한 전환"은 아니었을까 싶은 의문도 들었습니다.

React에서도 충분히 SEO를 개선하고 초기 로딩 속도를 높일 수 있는 방안이 있었음에도, 마이그레이션은 상당한 시간과 노력을 요구했습니다. 특히, 단일 페이지에서의 다양한 상호작용과 실시간 API 요청이 필요한 프로젝트 특성상, SSR의 이점은 초기 노드 정보를 불러올 때에만 제한적으로 활용되었습니다.

이 경험은 프레임워크 선택과 기술적 전환에 있어 근본적인 질문을 던지게 합니다: "이 기술이 정말 필요한가? 프로젝트의 성격과 비용에 부합하는가?" Next.js가 가진 이점은 분명하지만, 프로젝트의 요구 사항과 특성에 맞는 기술 선택이 결국 중요하다고 느꼈네요.

그럼에도 불구하고, 이번 경험을 통해 Next.js및 SSR의 장점을 이해하고 응용하는 데 큰 도움을 얻었습니다. 이는 앞으로의 프로젝트에서 기술 선택에 큰 도움이 될 것 같다고 생각합니다.

## 6. 참고자료

[https://nextjs.org/docs](https://nextjs.org/docs)

[https://velog.io/@iberis/%EC%9B%B9-%EC%B5%9C%EC%A0%81%ED%99%94-Lighthouse-CLI](https://velog.io/@iberis/%EC%9B%B9-%EC%B5%9C%EC%A0%81%ED%99%94-Lighthouse-CLI-%EC%84%B1%EB%8A%A5-%EC%A7%80%ED%91%9C)
