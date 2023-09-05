---
title: "프론트엔드 성능 최적화가이드-4"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-09-05
last_modified_at: 2023-09-05
---

# 4장 이미지 갤러리 최적화

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2b0f8d81-0d75-4afa-b9c0-3d58b406c037){: .center}

본 글은 "웹 개발 스킬을 한 단계 높여주는 프론트엔드 성능 최적화 가이드" 책의 공부내용으로 기억력이 좋지 않은 미래의 나를 위한 정리글입니다.

## 4.1 레이아웃 이동

![per-4-1](https://github.com/Meet-the-past/docker/assets/78795820/ca523163-7384-4138-a48d-1696f129977b)

- 문제 상황 : 이미지가 뚝뚝 끊기고, 밀어내는 현상이 보이고있다 , CLS(Cumulative Layout Shift)점수가 0.43로 매우 낮다. (권장은 0.1이하)
- 목표 : 이미지의 크기를 미리 지정하고, 공간을 잡아내서 밀어내는 현상을 방지하자

[동적 크기의 이미지에 대한 고려]

고정된 크기가 아니라 동적으로 크기가 바뀌는 이미지의 경우에는, 이미지 크기를 비율로 설정해 미리 공간을 확보할 수 있다

### 4.1.1 이미지 크기 설정

1. 넓이 고정 + 비율에 맞게 padding을주기

```javascript

return (
    <ImageWrap>
      <Image src={urls.small + '&t=' + new Date().getTime()} alt={alt} onClick={openModal} />
    </ImageWrap>
  );
}

const ImageWrap = styled.div`
  width: 100%;
  padding-bottom: 56.25%; // 16:9 비율
  position: relative;
`;

const Image = styled.img`
  cursor: pointer;
  width: 100%;
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
`;

```

2. asept-ration 사용하기

```
//  단 asept-ration은 호환성문제가 있다.
 .wrapper {
   width: 100%;
   asept-ratio: 16 /9;
 }

 .image {
   width: 100%;
   height: 100%;
 }

```

![per-4-2](https://github.com/Meet-the-past/docker/assets/78795820/c6813598-b2ca-40c2-96d5-b2aa3cbcc045)

> 이미지 크기를 지정했기때문에 로딩에 의해 높이가 변하지 않고 레이아웃 이동도 일어나지 않게 되었다 (CLS:0)

## 4.2 이미지 지연로딩

이번에는 Intersection Observer API가 아닌, react-lazyload를 사용한 이미지 지연로딩을 사용해보자

```javascript
import React from "react";
import LazyLoad from "react-lazyload";

function PhotoItem({ photo: { urls, alt } }) {
  return (
    <ImageWrap>
      <LazyLoad offset={1000}>
        <Image
          src={urls.small + "&t=" + new Date().getTime()}
          alt={alt}
          onClick={openModal}
        />
      </LazyLoad>
    </ImageWrap>
  );
}
```

LazyLoad를 사용하면 화면에 들어오는 순간 로드되며,

이때 offset 옵션을 사용하면 화면에 들어오기전에 이미지를 로드할 수 있다.

<hr>

Q. LazyLoad라이브러리와 기존의 Intersetion Objserver API의 차이점이 있나?

**[LazyLoad 라이브러리]**

장점

1.  **호환성**: 오래된 브라우저와의 호환성이 높음. Intersection Observer가 지원되지 않는 브라우저에서도 작동

2.  **기능 풍부**: 이미지 외에도 배경 이미지, 비디오 등 다양한 콘텐츠 타입에 대한 지연 로딩을 지원

단점

1. **추가 의존성**: 외부 라이브러리를 사용하므로 프로젝트의 종속성이 증가

<br>

**[Intersection Observer API]**

장점

1. **네이티브 지원**: 브라우저에서 기본적으로 지원하는 API이므로 추가적인 라이브러리를 사용 X
2. **유연성**: 다양한 옵션을 제공하여 원하는 대로 동작을 정의

단점

1. **호환성**: 오래된 브라우저에서 지원되지 않을 수 있음

<br>

Q. 이정도면 다른 라이브러리가 더있을거 같은데..?

https://www.cssscript.com/top-10-lazy-loading-javascript-libraries/

> 실제 다른 라이브러리들이 많이 있다. 필요에따라 적절한 라이브러리를 고르고 사용해도 괜찮을 듯

## 4.3 Redux 최적화

<img src="https://github.com/Meet-the-past/docker/assets/78795820/81b3e104-e816-41d0-9b30-3acdfea86a33" alt="Redux 최적화" width="400" />

> React Developer Tools 의 렌더링 옵션을 체크해서 리렌더링 문제를 확인해보자.

![per-4-3](https://github.com/Meet-the-past/docker/assets/78795820/0ca771f2-9790-4d2f-adbe-eb1497540b5a)

- 문제 상황 : 어라..? 모달창을 껐다키면 관련없는 이미지 요소들이 다시 렌더링되고있다. 모달을 띄우고, 배경색이 바뀌고, 닫는 3가지 순간에 렌더링이 발생하고 있는 것..!

[원인]

리덕스 상태를 구독하고있는 컴포넌트가 불필요한 리렌더링을 발생시키고 있다.

```javascript
const { photos, loading } = useSelector((state) => ({
  photos:
    state.category.category === "all"
      ? state.photos.data
      : state.photos.data.filter(
          (photo) => photo.category === state.category.category
        ),
  loading: state.photos.loading,
}));
```

코드를보면 useSelector에서 변경을 감지하고있는 대상은 바로 “객체”이다.

**만약 객체를 사용하면 내부 속성이 같더라도, 새로운 객체를 만들어 참조값이 바뀌므로** 계속 구독한 값이 바뀌었다고 인지하는 문제점이 발생하는것이다.

> 객체를 다르게 인식하는 이유
>
> 자바스크립트에서 객체의 "동일성"을 판단하는 방식 때문이다. 자바스크립트에서 두 객체를 비교할 때, 그 객체들의 "참조"를 비교하는데. 즉, 두 객체가 메모리의 같은 위치를 가리키고 있는지를 확인하는것 따라서 객체의 내용물이 같더라도, 이들이 다른 메모리 위치에 저장되어 있다면 자바스크립트는 이들을 다르다고 판단한다.
>
> ex) 객체, 배열, "===" 비교도 참조를 비교한다

[해결방법]

1. useSelector를 여러 번 사용해서 단일 값만 가져오기

```javascript
const modalVisible = useSelector((state) => state.imageModal.modalVisible);
const bgColor = useSelector((state) => state.imageModal.bgColor);
```

2. Equality function 사용

```javascript

import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import ImageModal from '../components/ImageModal';

function ImageModalContainer() {
  const { modalVisible, bgColor, src, alt } = useSelector(
    state => ({
      modalVisible: state.imageModal.modalVisible,
      bgColor: state.imageModal.bgColor,
      src: state.imageModal.src,
      alt: state.imageModal.alt,
    }),
    shallowEqual
  );
// 함수 or 직접 비교함수를 사용해 객체를 얕게 비교하고 내부의 값을 확인한다.

```

그러나 한가지 더 수정사항이 남아있다.

현재 useSelector의 반환값으로 필터링된 배열자체를 return하고있는데 배열자체도 새롭게 만들어져 참조값이 달라 항상 렌더링이 발생하므로 필터연산을 컴포넌트 자체로 분리해야한다.

```javascript
const { photos, loading } = useSelector(
  (state) => ({
    photos:
      state.category.category === "all"
        ? state.photos.data
        : state.photos.data.filter(
            (photo) => photo.category === state.category.category
          ),
    loading: state.photos.loading,
  }),
  shallowEqual
);

//전

const { category, allPhotos, loading } = useSelector(
  (state) => ({
    category: state.category.category,
    allPhotos: state.photos.data,
    loading: state.photos.loading,
  }),
  shallowEqual
);

const photos =
  category === "all"
    ? allPhotos
    : allPhotos.filter((photo) => photo.category === category);
//후
```

<hr>
Q. Redux 말고 다른 상태관리라이브러리의 경우에도 위 문제점이 있나?

Zustand / Recoil: 이 라이브러리들도 상태 변경을 감지하기 위해 React의 상태 관리 메커니즘을 내부적으로 사용하므로 새로운 객체를 반환하면 이러한 문제가 발생할 수 있다.

```javascript
import React, { createContext, useContext, useState } from "react";

const CounterContext = createContext();

const CounterProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  // 새로운 객체를 항상 반환하기 때문에 리렌더링 발생 가능성 있음
  const value = { count, setCount };

  return (
    <CounterContext.Provider value={value}>{children}</CounterContext.Provider>
  );
};
```

<hr>

## 4.4 메모리제이션

<img src="https://github.com/Meet-the-past/docker/assets/78795820/dbd095c2-aba2-4d0c-93df-dc76aa6d3363" alt="메모리제이션" width="700" />

> Perfomence탭을 사용하면 다음과 같이 모달창 → 배경색이 적용되기까지의 구간에서 느린 함수를 분석할 수 있다. (실제 화면에서도 매우 느린게 가시적으로도 보이고, 그때 getAverageColor..함수가 실행됨)

[원인]

`getAverageColorOfImage`함수는 평균 픽셀값을 계산하기 위해 모든 픽셀정보를 하나씩 가져와 연산을 수행한다. 이때 많은 시간이 소요되고있는 것

> 위 예제에서는 모달창을 누르면 해당 이미지와 유사한 배경색이 화면상에 표현되고있었다. 이때 표현할 색상을 계산하는 함수가 위의 함수

[메모리제이션]

메모리제이션은 프로그래밍에서 속도의 향상을 위해 연산의 결과를 메모리에 저장하여, 동일한 연산을 반복할 때 다시 계산하지 않고 메모리에서 가져오는 기술.
(마치 캐시같다고 생각하면 될거같다)

```javascript
// 이미지 URL에 따른 평균 색상을 저장할 객체
const averageColorCache = {};

// 이미지의 평균 색상을 계산하는 함수
export const getAverageColorOfImage = (imgUrl) => {
  // 캐시에서 값을 가져오는 경우
  if (averageColorCache[imgUrl]) {
    return averageColorCache[imgUrl];
  }

  // 평균 색상을 계산하는 로직 (비용이 많이 드는 연산)
  const averageColor = calculateAverageColor(imgUrl);

  // 캐시에 저장
  averageColorCache[imgUrl] = averageColor;

  return averageColor;
};
```

단, 메모리제이션의 경우 동일한 조건에서 로직이 반복적으로 수행되는 경우에 사용하는게 적합하다.

어처피 처음에 느린건 마찬가지이고, 변수에 값을 저장한다는것은 메모리를 점유하기때문에 불필요한 리소스가 낭비될 수 있기 때문이다.

<hr>

Q. 보통 어떤경우에 메모리제이션 기법을 사용될 수 있을까?

- 사실 useMemo , useCallback에서 이미 메모리제이션 기법이 활용되고 있다고 할 수 있다.
  - 계산 비용이 높은 함수의 결과를 저장해두고, 의존성 배열에 값이 안바뀌면 저장된 값을 사용하니까
