---
title: "CSS-in-JS vs CSS"

categories:
  - CS
tags:
  - css

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-03-25
last_modified_at: 2023-03-25
---

## 개요

웹사이트는 점점 복잡해지고 있으며 기존의 CSS작업 방식에서 발생하는 문제점을 해결하기 위해 다양한 CSS 방법론이 등장하였습니다.

그럼 여기서 잠깐, **CSS-in-Js** , **CSS (CSS-in-CSS)** 에 대해 들어보셨나요?

혹시 처음 듣는다면 CSS를 정의할 때 `.css ` , `.scss` 등의 css파일을 따로 만들거나 `Styled-compoent` 를 사용해본경험은 있으신가요?

저는 이 글을 통해 여러가지 CSS를 정의하는 방법을 크게 2가지 맥락으로 분류하고 두 방법의 특징과 장단점을 명확히 이해하고자 합니다.

## 정의

### 1. CSS-in-CSS

CSS-in-CSS 방식은 CSS 파일 내부에서 CSS 스타일을 작성하는 방식입니다. 가장 전통적인 웹 개발 방식으로 사용하려는 CSS내용을 파일로 분리하고 특정 HTML파일에서 import하여 스타일을 적용하는 방식이죠.

(이전글에서 다루었던 [BEM 방법론](https://teawon.github.io/react/bem-method/) 또한 CSS-in-CSS에서 사용하는 대표적인 방법론중 하나입니다!)

예를 들어보자면 아래와 같이 두 페이지 A와 B가 있고 각 페이지에서 하나의 버튼을 표현해준다고 가정해봅시다.

<img alt="image1" src="https://user-images.githubusercontent.com/78795820/227718808-c6c2e77c-9cda-4ddb-b0f3-3b1ff30441eb.png" />
<img alt="image2" src="https://user-images.githubusercontent.com/78795820/227719407-a4c7321d-fbd5-4385-a48b-f831e432f83c.png">

두 페이지에서는 "빨강"과 "파랑" 버튼에 대한 CSS요소를 아래와 같이 사용하게 될 것입니다. 각 페이지에서 분리된 CSS파일의 내용을 가져와 적용시키는 방식입니다.

```
// Test1.tsx
import React from "react";
import "./Test1.css"; // scss 임포트

function Test1() {
  return (
    <div>
      <h1>test 페이지</h1>
      <p> Content ...</p>
      <button className="button">button</button>
    </div>
  );
}
export default Test1;


// Test1.css
.button {
  display: inline-flex;
  color: red;  // 빨간 버튼!
  font-weight: bold;
  outline: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

```

그러나 Test2 Page에서도 마찬가지로 `.button` className을 가지는 css를 정의하고 사용하려했지만 여기서 문제가 발생합니다.

.button이라는 이름은 이미 Page1에서도 사용중이기 때문에 같은 이름을 다시 선언할 수 없는거죠.

<U>React에서 CSS 파일을 import하여 사용할 때, 해당 CSS 파일에 작성된 스타일은 해당 파일을 import한 모든 React 컴포넌트에 적용됩니다. 이는 CSS 파일이 전역 스코프에서 동작하기 때문입니다.</U>

그렇기 때문에 CSS-in-CSS 방식에서는 **CSS Module** 방법을 사용해 이러한 문제점을 해결하려고 했습니다.

#### 1.1 CSS Moduel

CSS Module은 CSS 클래스 이름 충돌 문제를 해결하기 위한 방법 중 하나로, 각각의 모듈에서 로컬 스코프를 가지며, 클래스 이름은 자동으로 고유한 이름으로 변경됩니다. 이를 통해, 위의 CSS 클래스 이름 충돌 문제를 방지할 수 있습니다.

CSS Module을 사용하기 위해서는, .module.css 확장자를 사용하여 CSS 파일을 작성해야 합니다. 예를 들어 위 페이지의 경우 아래와 같이 코드를 수정하면 두 페이지에서 모두 같은 클래스 이름을 사용할 수 있습니다.

```
import React from "react";
import styles from "./Test1.module.css"; // CSS Module로 변경된 css 사용

function Test1() {
  return (
    <div>
      <h1>test 페이지</h1>
      <p> Content ...</p>
      <button className={styles.button}>button</button> // className을 이용해 style을 적용시킨다
    </div>
  );
}

export default Test1;
```

CSS Module은 React에서 매우 유용하게 사용되는 CSS 방법론 중 하나이며 이를 통해, CSS 클래스 이름 충돌 문제를 방지하고, 코드 일관성을 유지하며, 스타일 코드를 보다 쉽게 관리할 수 있다는 장점을 가지고 있습니다.

#### 1.2 SASS

CSS in CSS 방법을 사용한다면 CSS 전처리기를 사용할때 보다 효과적인 코드 작성이 가능합니다.

CSS 전처리기란 CSS 코드를 기계가 이해할 수 있는 일반적인 CSS 코드로 컴파일(Compile)해주는 역할을 합니다. 이 컴파일된 CSS 코드는 브라우저에서 직접 실행되며, 웹 페이지를 렌더링하는 데 사용됩니다.

대표적 사례로 SASS가 있으며 SASS를 사용하면, CSS 코드를 변수, 믹스인, 확장 등의 기능을 사용하여 보다 효율적으로 작성할 수 있습니다. 이를 통해, 코드의 재사용성과 일관성을 높일 수 있습니다.

위 예제에서 사용한 버튼은 단순한 css파일이라 특별하게 활용하기 적합하지는 않지만 마치 함수와 같이 파라메터를 넘겨 코드를 재사용하고 직관적인 표현이 가능합니다.

### 2. CSS-in-JS

CSS-in-JS는 웹 개발에서 사용되는 스타일링 기술로, JavaScript를 사용하여 CSS를 작성하고 관리하는 방법입니다.

위 방법과 같이 별도의 파일로 작성하는게 아니라, 스타일 정보를 JavaScript 컴포넌트에 직접 포함시켜 컴포넌트 별로 스타일을 관리할 수 있습니다.

**Styled-component** 가 바로 CSS-in-JS의 대표적인 예시 중 하나입니다.

위의 예시를 Styled-compoen로 표현하면 아래처럼 표현할 수 있습니다.

```
import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  color: red;
  font-weight: bold;
  outline: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`;

const Test1 = () => {
  return (
    <div>
      <h1>test 페이지</h1>
      <p> Content ...</p>
      <Button>button</Button>
    </div>
  );
};

export default Test1;
```

위 방식에서는 Button이라는 이름으로 스타일을 적용한 버튼 컴포넌트를 생성하고 사용합니다.

특히 컴포넌트 이름으로 스타일이 적용되기 때문에 위의 클래스이름 충돌문제를 해결할 수 있습니다.

## 장단점 비교

![image](https://user-images.githubusercontent.com/78795820/227728781-8930a251-7888-4658-a942-680ecd47442a.png)

[출처 - 2022 Jetbrain 설문조사](https://www.jetbrains.com/lp/devecosystem-2022/javascript/)

통계에 따르면 CSS의 사용비율이 높은건 사실이지만 최근에는 CSS-in-JS의 Styled-compoents의 사용비율도 증가하고 있다고 알고있습니다.

그래서 뭘 써야 할까요? 두 방법의 장단점과 특징이 있을까요?

CSS-in-CSS 방법의 경우 아래 특징을 가집니다

장점

- 분리된 관심사: HTML, CSS, JavaScript의 역할이 명확하게 구분되어 유지 관리가 쉽다
- 전역 관리: 전역 스타일을 쉽게 정의하고 관리할 수 있다
- <span style="color:red">속도: 별도의 CSS 파일을 사용하면 브라우저 캐싱이 가능하여 성능이 향상될 수 있다</span>
- 학습: 전통적인 CSS 작성 방식이기 때문에 대부분의 러닝 커브가 적다

단점

- 클래스명 충돌: 전역 범위로 인해 클래스명이 충돌할 가능성이 있다 (CSS Module을 사용해서 극복 가능)
- 동적 스타일링 제한: CSS만으로 상태에 따른 동적 스타일링이 어렵다. (JavaScript를 사용해 클래스를 조작하거나 인라인 스타일을 적용해야 함)
- 코드 재사용의 어려움: 스타일을 모듈화하거나 재사용하기가 어렵다. 전처리기(SCSS, LESS등을 사용해서 극복 가능)

CSS-in-JS 방법의 경우 아래 특징을 가집니다

장점

- 컴포넌트 기반 구조: 컴포넌트 기반 웹 개발과 잘 어울리며, 각 컴포넌트의 스타일을 독립적으로 관리할 수 있다
- 동적 스타일링: JavaScript를 사용하여 스타일을 생성하므로, 상태에 따라 스타일을 쉽게 변경할 수 있다 (상호작용에 따른 동적인 스타일 변경 쉽게 가능)
- 코드 재사용 및 모듈화: 공통 스타일을 쉽게 공유하고 재사용할 수 있다. 즉 스타일을 모듈화하여 관리할 수 있어 코드의 유지보수가 용이하다
- 벤더 프리픽스 자동화: CSS-in-JS 라이브러리는 일반적으로 벤더 프리픽스를 자동으로 추가해기때문에 브라우저 호환성 유지에 용이하다

> 벤더 프리픽스란? : 브라우저 호환성을 위해 필요한 접두사(prefix)를 의미합니다. 예를 들어, transform 속성의 경우, Chrome, Safari, Firefox 등의 브라우저에서 각각 -webkit-transform, -moz-transform, -ms-transform과 같은 접두사를 붙여야 하나 CSS-in-JS에서는 이를 자동으로 추가하는 기능이 있다

단점

- 학습 : CSS-in-CSS에 비해 러닝커브가 있다
- 속도 : <span style="color:red">웹 브라우저에서 CSS 파일을 캐시할 수 없기 때문에, 초기 렌더링 속도가 느릴 수 있다</span>

여기서 속도 차이가 나는 가장 큰 이유는 CSS-in-CSS방식을 사용하면 CSS 파일을 사용하여 스타일을 작성하고, 웹 브라우저가 CSS 파일을 캐시하기때문에 웹 브라우저는 새로고침할 때마다 서버에서 CSS 파일을 가져오지 않고, 캐시된 파일을 사용하기때문입니다.

일빈적으로 규모가 클 수록 CSS-in-JS 방법론이 용이하며 초기 로딩속도에 민감할 경우 CSS-in-CSS 방법론이 적합하기 때문에 프로젝트 규모에 따라 사용하는 것이 좋을 것 같네요

## 참고자료

[[CSS] CSS를 대체할 ...](https://seizemymoment.tistory.com/145)

[CSS : CSS-in-CSS vs CSS-in-JS](https://velog.io/@daymoon_/CSS-CSS-in-JS-vs-CSS-in-CSS#-css-%EC%A0%84%EC%B2%98%EB%A6%AC%EA%B8%B0preprocessor)
