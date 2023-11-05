---
title: "프론트엔드 성능 최적화가이드-2"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-08-16
last_modified_at: 2023-08-30
---

# 2장 올림픽 통계 서비스 최적화

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2b0f8d81-0d75-4afa-b9c0-3d58b406c037){: .center}

본 글은 "웹 개발 스킬을 한 단계 높여주는 프론트엔드 성능 최적화 가이드" 책의 공부내용으로 기억력이 좋지 않은 미래의 나를 위한 정리글입니다.

[git](https://github.com/teawon/performance-lecture-study)

## 2.1 CSS 애니메이션 최적화

### 브라우저의 렌더링과정

DOM+CSSOM → 렌더트리 → 레이아웃 → 페인트 → 컴포지트

https://teawon.github.io/cs/init-browser-render/

- 리플로우의 경우 렌더링경로의 모든 단계를 재실행하므로 리소스를 많이 사용한다.

- 리페인트의 경우 CSSOM을 새로 생성하지만 레이아웃 단계는 실행하지 않아 비교적 괜찮다.

### 하드웨어 가속(GPU 가속)

![blog-2-1](https://github.com/teawon/Algorithm_js/assets/78795820/0dca276f-1637-4d3e-bd93-5917d28e87cf)

> 책에서 사용한 애니메이션 효과가 적용된 막대 그래프 컴포넌트
>
> 기존에는 쟁크 현상(살짝 끊김)이 발생했지만, 하드웨어 가속 기법을 통해 문제를 해결

하드웨어 가속이란? : 하드웨어 가속은 특정 작업을 CPU가 아닌 GPU에 위임함으로써 성능을 향상시키는 기술

- “transform, opacity” 같은 속성을 사용해 해당 요소를 별도의 레이아웃으로 분리하고 이 작업을 GPU에게 위임하여 레이아웃 및 페인트 단계를 건너뛸수있다.

- 요소의 실제 크기나 위치가 변경되는 것이 아니라, 화면에 표시되는 방식만 변경되기 때문에 브라우저는 **`transform(translate, scale, rotate)`** 속성을 변경할 때 다른 요소들에 대한 레이아웃 계산을 다시 할 필요가 없기때문

- Transform: translate, scale, rotate와 같은 변형 속성은 요소의 레이아웃에 영향을 주지 않으며, 오직 시각적 표현만 변경. 따라서 이러한 변형을 적용할 때 다른 요소의 레이아웃을 다시 계산할 필요가 없다.

- Opacity: 불투명도 변경 역시 레이아웃에 영향을 주지 않고, 별도의 레이어를 생성하여 GPU에서 처리

이러한 방식은 렌더트리 생성, 레이아웃 계산, 페인트 등의 복잡한 과정을 건너뛰게 해 성능을 크게 향상시킬 수 있다!

```jsx
// 기존
const BarGraph = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: ${({ width }) => width}%;
  transition: width 1.5s ease;
  height: 100%;
  background: ${({ isSelected }) =>
    isSelected ? "rgba(126, 198, 81, 0.7)" : "rgb(198, 198, 198)"};
  z-index: 1;
`;
```

```jsx
// 수정
const BarGraph = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  transform: scaleX(
    ${({ width }) => width / 100}
  ); // 여기서 직접 width를 쓰는게아니라, scalX함수를 통해 화면에 표현되는 비율을 수정
  transform-origin: center left;
  transition: transform 1.5s ease;
  height: 100%;
  background: ${({ isSelected }) =>
    isSelected ? "rgba(126, 198, 81, 0.7)" : "rgb(198, 198, 198)"};
  z-index: 1;
`;
```

Q. transform은 그럼 만능인가?

**애니메이션에 적용:** **`transform`**은 주로 애니메이션이나 전환 효과에 사용되며, 이 경우에는 레이아웃 단계와 페인팅 단계를 건너뛸 수 있어 성능 이점이 있음.

그러나 정적인 요소의 너비를 설정하는 데 **`transform`**을 사용하는 것은 불필요할 수 있으며, 코드의 가독성을 저하시킬 수 있다.

**레이아웃에 영향:** **`transform`** 속성은 요소의 시각적인 모양만 바꾸며, 실제 레이아웃에는 영향을 주지 않기때문에 . 이는 레이아웃을 예상한 대로 조절하기 어렵게 만들 수 있다.

위 Bar컴포넌트처럼 정해진 크기 + 애니메이션처리에 대해서는 직접 width를 조절하기보다 transform을 사용하자.

## 2.2 컴포넌트 사전로딩

### 지연 로딩의 문제점

이전과 마찬가지로 cra-bundle-analyzer 설치

```jsx
npm install --save-dev cra-bundle-analyzer //설치
npx cra-bundle-analyzer // 실행
```

<img width="1496" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/c5bb45cf-fd23-490b-893c-91b684582109">

여기서 Image-gallery.js 라이브러리는 첫 화면부터 필요하지 않다.

(모달창이 띄워질때만 필요하기때문)

```jsx
import ImageModal from './components/ImageModal'

function App() {
    const [showModal, setShowModal] = useState(false)

    return (
        <div className="App">
            <Header />
            <InfoTable />
            <ButtonModal onClick={() => { setShowModal(true) }}>올림픽 사진 보기</ButtonModal>
            <SurveyChart />
            <Footer />
            {showModal ? <ImageModal closeModal={() => { setShowModal(false) }} /> : null}
        </div>
    )
}

// 기존코드 : ImageModal을 App.js에서 바로 import해서 사용
-> Image-gallery.js 라이브러리를 처음부터 가져옴
```

```jsx
const LazyImageModal = lazy(() => import("./components/ImageModal"));

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="App">
      <Header />
      <InfoTable />
      <ButtonModal
        onClick={() => {
          setShowModal(true);
        }}
      >
        올림픽 사진 보기
      </ButtonModal>
      <SurveyChart />
      <Footer />
      <Suspense fallback={null}>
        {showModal ? (
          <LazyImageModal
            closeModal={() => {
              setShowModal(false);
            }}
          />
        ) : null}
      </Suspense>
    </div>
  );
}
```

<img width="1496" alt="image" src="https://github.com/teawon/Algorithm_js/assets/78795820/4ee9572f-3496-458f-a4a3-ea3c7d57158e">

> 번들을 분석해보아도 실제 기존과 다르게 분리되어있음을 확인가능

즉 showModal이 true가 되는 시점에 동적으로 라이브러리를 호출하도록 수정하게되었다.

(네트워크탭에서도 누른시점에 나옴)

![image](https://github.com/teawon/Algorithm_js/assets/78795820/0d4e8121-7d21-4657-ab48-30f33dc21cd8)

그러나 지연로딩을 사용하면, 분리했던 컴포넌트를 호출하는 시점에 데이터를 받아오기때문에 약간의 지연이 발생한다는 단점이 있다

순서대로 , 모달창을 클릭(1)한 시점에 네트워크를 통해 모듈을 받아오고(2) , 실제 화면에 렌더링되기까지의 지연시간이 발생하고있다.

이를 해결하는 방법으로 바로 “사전로딩을” 사용하자.

## 컴포넌트 사전로딩

그래서 언제 먼저 로딩할껀데??

1. 사용자가 누르기 직전 (마우스를 올려두었을때)
2. 최초에 페이지가 로드되고 컴포넌트 마운트가 끝났을때

```jsx
const handleMouseEnter = () => {
    import("./components/ImageModal").catch();
    // 네트워크 요청이 이미 완료되었다면, 같은 모듈을 다시 요청할 때 네트워크 요청을 다시 수행하지 않는다.
    // 따라서 여기서 이미 모듈을 가져오면 ,브라우저나 JavaScript 엔진은 이전에 불러온 모듈의 캐시된 본을 사용한다
  };

  return (
    <div className="App">
      <Header />
      <InfoTable />
      <ButtonModal
        onMouseEnter={handleMouseEnter} //hover시 미리 ImageModal 컴포넌트를 사전에 로딩한다.
        onClick={() => {
          setShowModal(true);
        }}
      >
        올림픽 사진 보기
      </ButtonModal>
      <SurveyChart />
      <Footer />
      <Suspense fallback={null}>
        {showModal ? (
          <LazyImageModal
            closeModal={() => {
              setShowModal(false);
            }}
          />
        ) : null}
      </Suspense>
```

```jsx
useEffect(() => {
  import("./components/ImageModal").catch();
  // Hover보다 더 빠르게, 모든 컴포넌트가 마운트 완료되면 추가로 로드
}, []);
```

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2363f1c1-2b0a-4cdf-8aeb-d30de84c24b1)

이제 사용자는, 모달창을 클릭 후 기다리지 않고 바로 데이터를 확인할 수 있다!

## 2.3 이미지 사전로딩

컴포넌트와 다르게 이미지는 “화면에 그려지는 시점”에 로드된다. (단순 import X)

```jsx
useEffect(() => {
  import("./components/ImageModal").catch();
  // Hover보다 더 빠르게, 모든 컴포넌트가 마운트 완료되면 추가로 로드

  const img = new Image();
  img.src =
    "https://stillmed.olympic.org/media/Photos/2016/08/20/part-1/20-08-2016-Football-Men-01.jpg?interpolation=lanczos-none&resize=*:800";
  //이미지의 경우 객체를 생성하고, src에 정보를 할당해 사전 로딩이 가능하다.
}, []);
```

Q. 이미지 사전로딩의 경우 이미 알고있는 이미지 url정보를 source에 할당하는거라고 이해했는데..

만약 서버로부터 특정 이미지를 받아오는거라면?? 미리 api를 보내고 이미지를 할당해도될까?

→ 이미지 사전 로딩은 이미지의 URL이 미리 알려져 있을 때 가장 잘 작동한다.

그러나 서버에서 동적으로 이미지 URL을 받아와야 하는 경우라면, 먼저 API를 호출하여 URL을 받아온 후에 그 URL로 이미지를 사전 로드할 수 있는데 이 경우 네트워크 요청이 두 번 발생하므로, API 응답 시간과 이미지 로드 시간 모두 고려해야 한다.

Q. 다른 사전로딩 기법에는 무엇이있을까? Hover, useEffect 말고?

[추후 추가 예정!](https:)
