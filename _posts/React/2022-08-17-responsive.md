---
title: "React-responsive, 반응형 웹사이트 만들기"

categories:
  - React
tags:
  - react-responsive
toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-08-17
last_modified_at: 2022-08-17
---

## 개요

최근 과거 마무리된 프로젝트에서 아쉽게도 진행하지 못했던 반응형 웹사이트 구현을 위한 코드 리펙토링을 진행 중 입니다.

큰 화면에서는 상관이 없었지만 화면이 작아지니 이미지가 너무 작아지고 깨지는 문제가 발생했던 것이죠

현재는 전체 3개의 이미지를 하나의 리스트에서 보여주지만 모바일 및 화면이 작을 때는 적어도 2개 이하의 이미지를 보여주게 하고 싶었습니다. 하지만...

Tailwind CSS를 사용하고 있었기 때문에 제공되는 Grid 기능을 사용하려 했지만 문제는 단순히 CSS 부분만 수정해서는 해결할 수 없는 문제가 있었습니다.

<span style="color:gray">
`grid-cols-4` (tailwind에서 제공하는 CSS. 각 행에 4개의 요소만 띄워준다.)
</span>

최대 몇 개의 이미지 리스트를 보여줄 지, 개수를 의미하는 변수를 선언하고

해당 변수 값에 맞게 예외처리 (일정 개수에 도달하면 이동 버튼 생성)을 구현하고 있었기 때문입니다.
![react1 1](https://user-images.githubusercontent.com/78795820/184530364-140db86c-d603-4a2e-bc1d-2603e9b286f0.png)

즉 코드 자체를 수정해야했기 때문에 단순히 Media Query를 사용한 CSS 수정으로는 구현할 수 없었습니다.

## React-responsive

다행히도 react-responsive를 이용한다면 코드 자체가 바뀌어도 수정이 가능했습니다.

저는 이 모듈을 사용하여 반응형 웹사이트를 구현하였습니다.

### 1. 설치

`yarn add react-responsive`

`yarn add @types/react-responsive` (typescript의 경우 추가 설치)

### 2. 코드 작성

```typescript
 const isPc = useMediaQuery({ query: "(min-width: 768px)" });

 {isPc ? ("PC") : ("Mobile)"}

```

useMediaQuery를 이용해 컴포넌트로 사용할 수도 있지만 저는 간단하게 변수를 선언하고 true / false값에 따라 보여줄 코드를 다르게 작성하여 나타냈습니다.

현재 화면이 768px가 넘어가게되면 isPC의 값이 true가 되어서 각 리스트에서 3개의 값만 보여주고 그렇지 않다면 1개만 보여주도록 말이죠.

그러나 사실 조금 더 깊게 생각해보면 좋은 코드작성은 아니라고 생각했습니다.

실질적으로 변하는 부분은 "개수"에 대한 변수값과 CSS에 해당하는 부분이였기때문에 각 뷰에따라 특별하게 코드가 추가되는 것도 아니였기 때문입니다.

따라서 화면에 보여주는 개수에 대한 변수와 해당 변수를 인자로 함수에 추가하여 분리하였고 결과적으로 다음과 같이 코드를 수정하였습니다.

```typescript
  const isPc = useMediaQuery({ query: "(min-width: 1024px)" });
  const isLaptop = useMediaQuery({ query: "(min-width: 768px)" });

  const perPageSize = isPc ? 3 : isLaptop ? 2 : 1; #모바일, pc 중간에 하나의 값을 더 추가하였습니다.

  ...

 <div className="grid grid-cols-2 desktop:grid-cols-4 laptop:grid-cols-3 gap-8 items-center">
 # tailwind의 css를 사용

```

처음 코드와 다르게 모든 코드를 수정하지 않고, 바뀌는 부분에 대한 변수만 따로 분리하여 해당 변수 값만 바뀌게 수정하였습니다.

CSS의 경우 tailwind.config.js파일에서 desktop, laptop에 해당하는 값을 직접 넣어 표현했습니다.
([참고 링크](https://tailwindcss.com/docs/screens#using-custom-screen-names))

### 3.결과

![result](https://user-images.githubusercontent.com/78795820/184955315-3af5295a-9504-4253-9871-192892636bf4.gif)
정상적으로 각각 뷰에따라 3,2,1개의 이미지를 보여주고 다음 버튼또한 개수에 맞게 활성화 되는 결과물을 만들 수 있었습니다!

반응형웹에서 구현하려는 내용이 복잡하지 않았기 때문에 위와 같이 표현이 가능했지만

만약 새로운 내용이 추가된다거나 복잡한 요소가 들어간다면 컴포넌트 자체를 각 뷰에 따라 따로 만들어서 보여주는 방식으로 구현하지 않을까 싶습니다.

## 참고헸던 자료

[https://velog.io/@st2702/%EB%B0%98%EC%9D%91%ED%98%95-%EC%9B%B9-Media-Query](https://velog.io/@st2702/%EB%B0%98%EC%9D%91%ED%98%95-%EC%9B%B9-Media-Query)

[https://velog.io/@leehyunho2001/React-responsive](https://velog.io/@leehyunho2001/React-responsive)

[https://mytutorials.tistory.com/335](https://mytutorials.tistory.com/335)
