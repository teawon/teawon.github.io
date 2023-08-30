---
title: "프론트엔드 성능 최적화가이드 -1"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-07-20
last_modified_at: 2023-07-20
---

## 1장 블로그 서비스 최적화

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2b0f8d81-0d75-4afa-b9c0-3d58b406c037){: .center}

본 글은 "웹 개발 스킬을 한 단계 높여주는 프론트엔드 성능 최적화 가이드" 책의 공부내용으로 기억력이 좋지 않은 미래의 나를 위한 정리글입니다.

### 1.1 LightHouse

Lighthouse란 웹 페이지의 품질을 측정하는 데 사용되는 오픈 소스 도구

![image](https://github.com/teawon/Algorithm_js/assets/78795820/cfe11e76-948f-4de1-a7fc-f8401bb174fc)

- 여기서 기본값은 탐색

"Navigation" 모드: 이 모드는 웹페이지의 로딩 과정을 전체적으로 분석합니다. 사용자가 URL을 방문할 때부터 페이지에 있는 모든 리소스가 로드되고 모든 스크립트가 실행될 때까지의 전 과정을 살펴봅니다. 이를 통해 페이지의 로딩 성능, 프로그레시브 웹 앱(PWA)의 기능성, 웹 접근성, SEO 등을 평가하고 분석합니다.

"Snapshot" 모드: 이 모드는 이미 로드된 페이지의 현재 상태를 분석합니다. 실행 속도가 빠르며, 페이지의 접근성, SEO, 베스트 프랙티스 등에 초점을 맞춥니다. 하지만 이 모드는 "Navigation" 모드가 제공하는 페이지 로딩 성능이나 PWA 관련 분석을 제공하지 않습니다.

(즉 차이점은 초기렌더링 vs 렌더링 이후 내용을 확인하냐..)

### 1.2 CND

CDN은 전세계에 분산된 서버 네트워크를 사용하여 사용자에게 웹 콘텐츠를 더 빠르게 제공하는 서비스이다.

사용자는 가장 가까운 CDN 서버에서 콘텐츠를 다운로드 받기 때문에 콘텐츠 로딩 시간이 크게 줄어드는 효과가 있다.

그중 이미지 CDN(Content Delivery Network)은 이미지 콘텐츠를 효율적으로 전달하기 위해 설계된 특수한 종류의 CDN이며 아래의 특징을 가진다고한다

1. 성능 향상: 이미지 CDN은 사용자에게 가장 가까운 서버에서 이미지를 제공함으로써 지연 시간을 최소화하고, 웹사이트의 로딩 속도를 향상

2. 보안: 이미지 CDN은 DDoS 공격과 같은 보안 위협으로부터 웹사이트를 보호하는 추가적인 보안 계층을 제공

3. 이미지 최적화: 이미지 CDN은 브라우저, 디바이스, 네트워크 상태 등을 고려하여 이미지를 동적으로 최적화
   예를 들어, 모바일 사용자에게는 작은 크기의 이미지를, 데스크톱 사용자에게는 큰 크기의 이미지를 제공할 수 있다.

여기서 CDN의 가장 큰 특징은 바로 "최적화", 클라이언트의 요청에따라 동적으로 원하는 크기의 이미지를 받아올 수 있다.

<img width="730" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/6eb30a9f-4327-431c-8ec4-ec00699a0c0c">

[CDN적용전]

<img width="578" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/84d8c411-21f5-4bf4-a787-9b880b687444">

<img width="813" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/714c1ead-984b-4082-a087-3e8ce66031dd">

- 서버에서 보내주는 큰 이미지를 그대로 활용하고있다. 사실 특정 페이지에서 이 이미지는 그렇기 크지 않아도되는데 말이다.

- 나는 이 페이지에서는 더 작은 이미지를 활용하고 싶은데..?

- lighthouse에서도 이러한 문제점을 발견해서 알려주고있다.

[CDN적용후]

<img width="813" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/9826697e-3177-4c61-bbec-8a31f37ca5a8">

- 크기가 줄어들었고, lighthouse의 경고도 사라졌다.

- 즉 내가 원하는 이미지의 크기를 동적으로 받아서 사용해 성능을 최적화한것

[코드]

```javascript
function getParametersForUnsplash({ width, height, quality, format }) {
  return `?w=${width}&h=${height}&q=${quality}&fm=${format}&fit=crop`;
}

<img
  src={
    props.image +
    getParametersForUnsplash({
      // CDN을 사용해서 적절한 크기의 이미지를 받아온다. 120의 2배크기인 240px로 크기 지정(적절치)
      width: 240,
      height: 240,
      quality: 80,
      format: "jpg",
    })
  }
  alt="thumbnail"
/>;
```

서버에 원하는 width, height을 지정해 이미지 url을 요청하는 방식을 사용한다.

#### 1.2.1 CDN 적용방법

1. Lorem Picsum 등의 사이트 활용

   책에서 알려준방법 해당 사이트에 업로드된 이미지에 대해서만 정보 처리가 가능하다.

   근데 일반적으로 프로젝트에서는 S3에 직접 업로드하고, 백엔드에서 이 url을 주는데 이를 처리할 수 있는 방법이 없을까??

2. CloudFront + Lamda를 통한 이미지 CDN만들기

   프론트에서 받아온 이미지 url에 넓이, 높이에 대한 정보를 url에 추가로 할당해서 요청하면 해당하는 크기의 이미지를 받아올 수 있다. 이때 CloudFront와 Lamda를 활용한다.

   [출처](https://devhaks.github.io/2019/08/25/aws-lambda-image-resizing/)

### 1.3 반응형 이미지

CDN을 활용하면 이미지를 적절한 크기로 받아올 수 있다.

하지만 배경의 경우 뷰포트에 따라 동적으로 변경되는데 이 경우에는 어떻게 해야할까??

이때는 "반응형 이미지"를 활용하면 좋다

```javascript

import React from 'react';

function MyComponent({ imageUrl }) {
  // imageUrl는 API에서 받아온 원본 이미지 URL
  // CDN 설정에 따라, URL에 크기 파라미터를 추가하여 다양한 크기의 이미지 URL을 생성
  const small = `${imageUrl}?width=500`;
  const medium = `${imageUrl}?width=1000`;
  const large = `${imageUrl}?width=2000`;
550px
  return (
    <img
      srcSet={`${small} 500w,
               ${medium} 1000w,
               ${large} 2000w`}
      sizes="(max-width: 600px) 100%,
             (max-width: 1200px) 1000px,
             2000px"
      src={small}  // 기본 이미지로 가장 작은 이미지를 설정
      alt="My Image"
    />
  );
}

export default MyComponent;

```

위 방식처럼 뷰포트에 따라 각각 받아온 이미지를 적절하게 화면에 뿌려주면된다

### 1.4 병목코드

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2b74b6bd-af2e-41d8-9fb4-fbf6021bd3bd)

- Lighthouse + 성능탭 확인
- CPU의 빨간색 부분이 병목지점을 의미한다
- 그 중 “소요시간(Timings)” 섹션은 각 컴포넌트의 렌더링 시간을 의미

정규식을 활용해 특수문자를 지우도록 처리해서 병목코드를 찾아서 개선

핵심은 어떤부분에서 병목이 발생하는지 lighthosue를 통해 분석하고, 발생 위치를 찾는게 중요한듯 하다.

> 정규식 엔진의 경우 효과적인 알고리즘을 사용하므로 입력크기가 커져도 성능이 더 빠름

### 1.5 코드분할

![image](https://github.com/teawon/Algorithm_js/assets/78795820/285e0f16-e58c-47ea-863b-9523c3f171ee)

node_modules 내부의 refractor의 크기가 크다

코드가 하나로 합쳐져있어 당장 사용하지 않는 코드까지 함께 다운로드 받기때문에 로드가 느려지는 문제

```
// package-lock.json

"node_modules/react-syntax-highlighter": {
      "version": "12.2.1",
      "resolved": "https://registry.npmjs.org/react-syntax-highlighter/-/react-syntax-highlighter-12.2.1.tgz",
      "integrity": "sha512-CTsp0ZWijwKRYFg9xhkWD4DSpQqE4vb2NKVMdPAkomnILSmsNBHE0n5GuI5zB+PU3ySVvXvdt9jo+ViD9XibCA==",
      "dependencies": {
        "@babel/runtime": "^7.3.1",
        "highlight.js": "~9.15.1",
        "lowlight": "1.12.1",
        "prismjs": "^1.8.4",
        "refractor": "^2.4.1"
      }
    },


//node_modules/react-syntax-highlighter 에서 refractor를 참고하고있다.
// react-syntax-highlighter는 마크다운 코드 블록에 스타일을 입히는 라이브러리

```

react-syntax-highlighter 라이브러리는 실제 웹사이트에서 사용하고있지만,

“특정 페이지"에서만 사용되고 있다. (즉 그 밖의 페이지에서는 활용하고 있지 않음)

즉 이러한 문제를 해결하기 위해 "코드분할" 기법을 사용한다!!

코드분할 : 하나의 번들 파일을 여러 개의 파일로 쪼개는 기법 (= 지연로딩을 통해 필요한 곳에서만 로드)

### 1.5.1 지연로딩

- 일반적으로 빌드시에 함깨 번들링이되지만, 동적 import를 사용하면 런타임시에 해당 모듈을 로드

```javascript
import React from "react";
import { Switch, Route } from "react-router-dom";
import "./App.css";
// import ListPage from "./pages/ListPage/index";
// import ViewPage from "./pages/ViewPage/index";

const ListPage = lazy(() => import("./pages/ListPage/index")); // 동적 import
const ViewPage = lazy(() => import("./pages/ViewPage/index")); // 동적 import

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>로딩 중...</div>}>
        <Switch>
          <Route path="/" component={ListPage} exact />
          <Route path="/view/:id" component={ViewPage} exact />
        </Switch>
      </Suspense>
    </div>
  );
}

export default App;
```

![image](https://github.com/teawon/Algorithm_js/assets/78795820/4b9d1db7-c7bc-4aae-a97c-151791589e41)

(결과 - 실제 하나의 큰 chunk파일을 받아오던 기존구조에서, 필요한 시점에 쪼개진 chunk파일을 받아오도록 수정되었다)

![image](https://github.com/teawon/Algorithm_js/assets/78795820/03de6e30-9562-483e-b093-6389c8a2f798){: width="200"}

[전]

![image](https://github.com/teawon/Algorithm_js/assets/78795820/242fdd3f-9797-4dae-9ace-4dc4bc6c7dce){: width="200"}

[후]

- Chunk"란?
  웹팩(Webpack)과 같은 모듈 번들러에서 주로 사용되며, 애플리케이션의 코드를 여러 개의 더 작은 파일로 분할하는 프로세스를 설명하는데 사용. 이렇게 분할된 각 파일을 "chunk"라고 부른다

Q. 모든 페이지, 심지어 하나의 페이지 내의 여러 컴포넌트 각각에 대해서 lazy import를 사용해도 괜찮을까?

- 남용시에 부작용이 있다
  1. 네트워크 요청 증가 : 각 chunk는 별도의 네트워크 요청을 필요로 하기때문에 모든 컴포넌트를 개별적으로 로드하도록 설정하면 네트워크 요청이 많이 증가하게 되며, 이는 서버와 클라이언트 모두에게 추가적인 부담을 줄 수 있다
  2. 로딩 지연 : 사용자 입장에서 너무 많은 지연로딩은 오히려 부정적인 영향을 미칠 수 있다
  3. 코드 복잡성 증가 및 유지보수에 부정적

⇒ 따라서 크기가 크고, 초기 로드에 필요하지 않은 컴포넌트에 대해 적절하게 사용하는게 중요

⇒ 페이지 단위에서 코드 분할을 적용하는게 일반적으로 가장 효과적이다

### 1.6 텍스트 압축

텍스트 압축이란?

- HTML, CSS, Javscript등 텍스트 기반의 파일을 압축하는 것
  - 전송 시간 단축
  - 성능 향상 (로딩 속도 개선)
  - 용량 절약
  - 일반적으로 빌드도구 및 프레임워크가 자동으로 처리해주는경우가 많다!(개념정도만 알고가면 좋을듯)

![image](https://github.com/teawon/Algorithm_js/assets/78795820/7c04add3-304f-4620-986a-9900592ec212){: width="200"}

(텍스트 압축 전 - 156kB)

![image](https://github.com/teawon/Algorithm_js/assets/78795820/c241da14-119c-4759-bb98-981d09b597b0){: width="200"}

(텍스트 압축 후 - 49.6kB)

#### 1.6.1 Gzip

[Gzip]

- 텍스트 파일의 압축에 특히 효과적. (사이트를 구성하는 HTML, CSS, JS는 모두 텍스트)
- 웹 서버와 클라이언트 간의 통신에서 GZip 압축은 텍스트 기반의 HTTP 페이로드를 압축하는 데 널리 사용
- 대부분의 최신 웹 브라우저는 GZip 압축을 자동으로 처리

( HTTP/1.1 명세에서 'Content-Encoding'이라는 헤더를 지원하므로 인코딩 방식을 알린다)

[GZip 압축을 이용한 데이터 전송 과정]

1. 사용자가 웹 브라우저를 통해 특정 웹페이지를 요청
2. 웹 브라우저는 요청을 만들고, 이 요청에 'Accept-Encoding' 헤더를 포함. 이 헤더는 브라우저가 지원하는 인코딩 방식의 목록을 서버에 알려준다 ('Accept-Encoding: gzip, deflate' 등) - 사진참고
3. 웹 서버는 요청을 받고, 'Accept-Encoding' 헤더를 확인해 브라우저가 어떤 인코딩 방식을 지원하는지 확인
4. 서버는 브라우저가 GZip 인코딩을 지원한다는 것을 확인하면, 응답 데이터를 GZip으로 압축.
5. 서버는 압축된 응답을 브라우저로 보내고, 이때 'Content-Encoding: gzip' 헤더를 포함, 이 헤더는 브라우저에게 응답 데이터가 GZip으로 압축되었다는 것을 알려줌
6. 웹 브라우저는 응답을 받고, 'Content-Encoding' 헤더를 통해 응답이 GZip으로 압축되었다는 것을 인식
7. 브라우저는 받은 응답을 GZip 압축 해제하고, 웹페이지를 사용자에게 표시

서버는 동적으로 브라우저가 지원하는 압축 형식에 따라 응답을 압축할 수 있다. 이를 통해 서버는 최적의 압축 형식을 선택하고, 웹 브라우저와의 호환성 문제를 피할 수 있음

![image](https://github.com/teawon/Algorithm_js/assets/78795820/df638074-c1c9-455e-acf6-c5fcd0c6e9c1){: width="200"}

Q. 텍스트 압축의 단점?

1. **서버 부하 :** 압축 프로세스는 CPU 리소스를 사용
2. **시간 지연**: 압축과 해제 과정은 약간의 시간 지연

   (사실상 아주 작은파일이 아니라면 압축을 수행하고 해제하는데 걸리는 시간이 압축된 내용을 보냈을때의 시간보다 미미)

3. 호환성
   HTML , JS , CSS 는 반복적인 문자열과 공백이 많이 포함되어 있는데, 이는 압축 알고리즘이 잘 작동하는 형태의 데이터이므로 거의 사용해도 문제는 없는듯하다 ( gZip은 대부분의 브라우저에서 지원 )

Q. Gzip vs Deflate vs Brotli

1. **Gzip**: Gzip은 널리 사용되는 압축 알고리즘 중 하나
2. **Deflate**: Gzip와 함께 가장 널리 사용하며 이 알고리즘은 Gzip와 비슷한 압축 효율을 제공하지만, 약간 더 빠른 압축과 압축 해제 시간을 제공한다. 그러나 호환성이 Gzip보다 떨어짐
3. **Brotli**: Brotli는 Google에 의해 개발된 상대적으로 새로운 압축 알고리즘이며 특히 HTTP 콘텐츠 압축에 사용되도록 설계되었음.

   Brotli는 Gzip보다 약 20-30% 더 효율적인 압축률을 제공하지만 마찬가지로 호환성문제가 있다.

(압축률이 높으면 그만큼 복잡한 압축알고리즘을 사용하기때문에 CPU사용량은 증가한다)

⇒ 최신브라우저라면 **Brotli**를 , 그렇지 않다면 **Gzip**을 사용하는게 일반적이다.

Q. 빌드시 일어나는 일 (왜 chunk파일 크기가 줄어들었는가?)

- 경량화(**Minification)** : 짧은 변수명으로 수정, 줄바꿈, 주석같은 요소를 다 지우고 코드를 최소화
- 트리 쉐이킹
- 난독화 : 변수와 함수이름을 무의미한 문자열로 변환하고 흐름을 변경 → 파일 크기와 직접적인 관련은 없지만 보안과 관련된 작업을 수행

React의 경우 Build과정에서 Webpack, Babel, Terser등의 도구등에 의해 위 작업들을 수행한다.

위 작업은 개발자가 직접하기보다는 자동화된 도구들에 의해 진행된다!

---
