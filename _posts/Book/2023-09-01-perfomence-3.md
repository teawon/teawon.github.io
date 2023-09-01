---
title: "프론트엔드 성능 최적화가이드-3"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-09-01
last_modified_at: 2023-09-01
---

# 3장 홈페이지 최적화

![image](https://github.com/teawon/Algorithm_js/assets/78795820/2b0f8d81-0d75-4afa-b9c0-3d58b406c037){: .center}

본 글은 "웹 개발 스킬을 한 단계 높여주는 프론트엔드 성능 최적화 가이드" 책의 공부내용으로 기억력이 좋지 않은 미래의 나를 위한 정리글입니다.

## 3.1 이미지 지연로딩

![image](https://github.com/teawon/teawon.github.io/assets/78795820/61409e70-96a3-4261-9a70-5da36549501f)
![image](https://github.com/teawon/teawon.github.io/assets/78795820/4ee4ce8b-07d5-41db-931f-a4de070fe6ff)

- 문제 상황 : 처음 페이지에 들어오면 비디오가 표현되는데, 스크롤을 내려야 표현되는 이미지정보가 먼저 로드되고 있어서 비디오정보를 받아오는데 지연이 발생하고있다.
- 목표 : 이미지는 조금 더 늦게 받아오고, 우선순위가 높은 비디오를 먼저 받아오자

그럼.. 이미지는 언제 받아오지??

→ 이미지가 필요하기 직전, 즉 **스크롤을 내리다가 이미지가 보이는 시점**에 이미지를 로드하자!

<br>

> 이미지 파일은 사용자가 스크롤을 내려 해당 이미지가 뷰포트에 들어오는 시점에 로드하게하면 페이지가 로드되었을 때 비디오 파일을 먼저 로드할 수 있고, 사용자 경험을 향상시킬 수 있다

![image](https://github.com/teawon/teawon.github.io/assets/78795820/1eac1885-d363-4f94-bf27-f60ddcdf5576)

> 자 그럼 이 3개의 이미지를 늦게 받아오도록 처리해봅시다

<hr>

### 3.1.1 throttle 기법

웹 페이지에서 스크롤 이벤트는 매우 빈번하게 발생한다.

(실제로 스크롤을 감지하고 콘솔에 로그를 출력해보면, 한 틱당 거의 하나씩 많은 이벤트가 발생함)

이런 상황에서 Throttle 기법을 고려해본다면??

<br>

**[throttle]**

- 이벤트가 과도하게 발생할 경우, 그 처리를 제한하는 기법
- 일정 시간 (예: 200ms) 동안 이벤트를 한 번만 처리하도록 제한할 수 있다.

**[문제점]**

- 정확성 문제: Throttle을 사용하면, 이미지가 뷰포트에 들어왔을 때 로딩되어야 하는 시점을 놓칠 수 있다.
  예를 들어, 200ms 동안 이벤트를 무시한다면, 사용자가 빠르게 스크롤을 움직여 이미지가 뷰포트에 짧은 시간 동안만 노출되었을 때, 로딩이 이루어지지 않을 수 있다는것...

책에서는 이에 대한 대한으로 **Intersection Observer** 방법을 소개한다.

<hr>

### 3.1.2 Intersection Observer

**[Intersection Observer]**

Intersection Observer는 웹 페이지의 특정 요소와 뷰포트가 교차하는 시점을 감지하는 데 사용되는 브라우저 API

즉, 어떤 요소가 화면에 보이는지 혹은 사라지는지를 실시간으로 판단할 수 있는데 이를 활용하면, 이미지나 다른 요소들이 실제로 사용자에게 보일 필요가 있을 때만 로딩을 시작하도록 할 수 있다.

> 브라우저 API가 뭐지??
>
> 브라우저 API는 별도의 설치나 다운로드 없이 웹 브라우저에서 기본적으로 제공하는 기능의 모음
> 이를 통해 웹 페이지에 다양한 기능(예: 위치 정보 얻기, 오디오 재생, 웹 페이지 요소 변경 등)을 JavaScript로 쉽게 추가할 수 있다)

<br>

자 그럼 바로 코드를 확인해보자 이미지 로딩은 img태그에 src가 할당되는 순간에 발생한다

→ 즉 적절한 시점에 src를 할당하여 이미지를 로딩하게해야한다.

```javascript

useEffect(() => {
    // 하나의 인스턴스만 생성하도록 useEffect를 사용

const options = {
      root: null
			// 뷰포트 요소 설정( null 이면 기본 브라우저)
      threshhold: 1,
			// 0~1 사이의 값으로, 이미지 노출 비율을 의미한다. 1이면 전부 보여야 실행
      rootMargin: 0,
			// 이미지가 미리 로딩되도록 여유분을 준다
    };


// 이때 이미지의 크기를 미리 지정하지않으면, threshold를 1로 하더라도, 이미지 높이가 0이라서 이미지 전체가 보이지 않아도 로딩된다.
    const callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { // true라면 로딩 시작
          entry.target.src = entry.target.dataset.src;
          observer.unobserve(entry.target); // observe해제
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    observer.observe(imgRef.current);

    return () => observer.disconnect(); // clean up 함수를 사용해 리소스 낭비를 줄인다
  }, []);

  return (
    <div className="Card text-center">
      <img data-src={props.image} ref={imgRef} />
      //data-src에 임시로 할당 후 특정 시점에 src로 값을 할당한다
      <div className="p-5 font-semibold text-gray-700 text-xl md:text-lg lg:text-xl keep-all">
        {props.children}
      </div>
    </div>
  );

```

<br>

![image](https://github.com/teawon/teawon.github.io/assets/78795820/155134d5-4709-48b6-95e7-0efcb8841eba)

이제 3개의 이미지(main1,2,3…jpg)는 스크롤을 내리다가 보이는 시점에 다운받게 되었다

<hr>

Q. data-src라는 명칭은 예약어인가?? 암묵적인 표현?

HTML5에서는 사용자가 임의로 데이터를 요소에 저장할 수 있도록 **`data-*`** 형식의 속성을 도입했다.

즉 아무 이름이나 사용 가능

**`data-*`** 속성의 이름은 **`data-`** 접두사를 제거하고, 나머지 부분은 카멜케이스(camelCase)로 변환하여 사용하므로 entry.target.dataset.src 형태로 값에 접근한것

<hr>

Q. 혹시 다른 기법의 이미지 지연로딩도 있나?

### 3.1.3 Native Lazy Loading

**[Native Lazy Loading]**

Native Lazy Loading은 웹 브라우저에서 내장된, 즉 "네이티브"로 제공하는 이미지 지연 로딩 기능.

이 기능을 활용하면 별도의 JavaScript 코드 없이도 이미지나 iframe을 지연 로딩할 수 있다

```javascript
<img src="image.jpg" alt="Description" loading="lazy">


// loading 속성
// - auto  : 브라우저가 결정
// - lazy  : 요소가 뷰포트에 가까워질때까지 지연
// - eager : 지연없이 바로 로딩

```

**[주의점]**

- 브라우저 지원성
  모든 웹 브라우저에서 이 기능을 지원하지는 않아 호환성을 고려해야 한다.

- SEO 관련 주의점
  Native Lazy Loading을 사용하면, 일부 검색 엔진이 지연 로딩된 콘텐츠를 정확하게 크롤링하지 못할 수 있어 이는 웹 페이지의 검색 엔진 순위에 영향을 미칠 수 있다. (특히, 중요한 이미지나 콘텐츠에 대해서 더욱 주의필요)

## 참고자료

[https://bongbongdang.tistory.com/142](https://bongbongdang.tistory.com/142)

[https://scarlett-dev.gitbook.io/all/it/lazy-loading](https://scarlett-dev.gitbook.io/all/it/lazy-loading)
