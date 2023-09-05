---
title: "프론트엔드 성능 최적화가이드-3"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-09-01
last_modified_at: 2023-09-04
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

- 상세한 시점 제어 불가
  세부적인 지연 로딩의 시점을 지정할 수 없다. 즉, 뷰포트가 얼마나 가까워져야 이미지를 로드할 것인지 같은 상세한 설정이 불가능.

- 브라우저 지원성
  모든 웹 브라우저에서 이 기능을 지원하지는 않아 호환성을 고려해야 한다.

- SEO 관련 주의점
  Native Lazy Loading을 사용하면, 일부 검색 엔진이 지연 로딩된 콘텐츠를 정확하게 크롤링하지 못할 수 있어 이는 웹 페이지의 검색 엔진 순위에 영향을 미칠 수 있다. (특히, 중요한 이미지나 콘텐츠에 대해서 더욱 주의필요)

## 3.2 이미지 최적화

Squoosh 웹사이트를 통한 이미지 변환 (구글 제공) -> 불필요하게 큰 이미지를 WebP포멧으로 압축하자!

<img width="714" alt="image" src="https://github.com/teawon/teawon.github.io/assets/78795820/267d1c75-398b-451c-a599-18a72c822400">

> 기존 이미지 vs WebP확장자로 압축한 이미지 크기 비교

단, 호환성 문제를 위해 picture태그를 사용해야한다.

- picture태그는 다양한 타입의 이미지 렌더링에 사용되는 컨테이너로 지원되는 타입의 이미지를 위에서부터 확인 후 렌더링한다.
- picture의 경우 sreset에 이미지 주소가 들어가면 이미지가 로딩된다 (img의 경우 src)

```javascript

useEffect(() => {

    const options = {
    const callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const previousSibling = target.previousSibling;

// previousSibling 은 DOM에서 이전 형제 요소를 참조하는 속성
// ref자체가 img태그를 가리키기 때문에 상위의 source에 접근하기 위해 사용한다


          target.src = target.dataset.src;
          previousSibling.srcset = previousSibling.dataset.srcset;
          observer.unobserve(entry.target);
        }
      });
    };

return (
    <div className="Card text-center">
      <picture>
        <source data-srcset={props.webp} type="image/webp" />
        <img data-src={props.image} ref={imgRef} />
      </picture>
      <div className="p-5 font-semibold text-gray-700 text-xl md:text-lg lg:text-xl keep-all">
        {props.children}
      </div>
    </div>
  );

```

- 위 코드에서 가장 상위의 WebP이미지를 우선으로 로드한다
- 지원하지 않으면 다음 sourece , 그리고 마지막에는 Img를 로드한다

<hr>

Q. previousSibling을 통해 상위 source태그에 접근했는데 만약 이미지가 여러개라면?
⇒ 아래처럼 previousSibling을 여러 번 사용하면된다.

```javascript
<picture>
  <source data-srcset={main_styles_webp} type="image/webp" />
  <source data-srcset={main_styles_png} type="image/png" />
  <img data-src={main_styles} ref={imgEl3} />,
</picture>;

const callback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const pngSourceEl = entry.target.previousSibling; // for png
      const webpSourceEl = pngSourceEl.previousSibling; // for webp

      webpSourceEl.srcset = webpSourceEl.dataset.srcset;
      pngSourceEl.srcset = pngSourceEl.dataset.srcset;

      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
};
```

또는 아래처럼 클래스를 할당해서 접근하면 DOM구조의 변경에 보다 안정적이고 명확하게 특정 요소를 참조할 수 있다

```javascript

const webpSourceEl = entry.target.parentElement.querySelector('.webp-source');
const pngSourceEl = entry.target.parentElement.querySelector('.png-source');

{..}

<picture>
    <source class="webp-source" data-srcset={main_styles_webp} type="image/webp" />
    <source class="png-source" data-srcset={main_styles_png} type="image/png" />
    <img data-src={main_styles} ref={imgEl3} />,
</picture>


```

[이미지 확장자와 최적화](https://teawon.github.io/cs/image/)

## 3.3 동영상 최적화

![image](https://github.com/teawon/teawon.github.io/assets/78795820/8749a824-0c1d-4bcc-b28a-073748f98384)

일단 동영상의 경우 필요한 앞 부분을 먼저 다운로드한 뒤 순차적으로 나머지 내용을 다운로드하기때문에 Network패널에서 나누어서 다운받는다.

(라우저나 스트리밍 서비스가 알아서 처리해줌)

단 **압축 자체가 화질을 떨어뜨리기때문에** 영상의 화질이 중요한 서비스라면 압축에 대해 주의해야한다.

-> 동영상 최적화도 이미지와 마찬가지로 WebM확장자를 사용해 압축을 처리하자.

-> 이때도 마찬가지로 호환성을 고려해 video태그안에 source를 사용해야한다

```javascript
// 전
<video
    src={video}
    className="absolute translateX--1/2 h-screen max-w-none min-w-screen -z-1 bg-black min-w-full min-h-screen"
    autoPlay
    loop
    muted
/>

//후

<video
  className="absolute translateX--1/2 h-screen max-w-none min-w-screen -z-1 bg-black min-w-full min-h-screen"
  autoPlay
  loop
  muted
>
  <source src={video_webm} type="video/webm" />
  <source src={video} type="video/mp4" />
</video>

```

<hr>

압축으로 인한 화질 저하 문제를 완전히 해결할 수는 없지만, 사용자 경험을 손상시키지 않으면서 로딩 속도를 개선하는 데 아래의 방법이 활용되기도한다.

1. 블러 처리 : css의 Blur필터를 사용해 화질저하를 눈에 띄지 않도록 하기

2. 패턴 적용 : 영상위에 패턴을 씌우는 방법

![image](https://github.com/teawon/Algorithm_js/assets/78795820/0410bf96-f6c0-43c2-ad96-b7e47421cf24)
![image](https://github.com/teawon/Algorithm_js/assets/78795820/705447fa-d3aa-466e-b870-24d5a1b49c79)
![image](https://github.com/teawon/Algorithm_js/assets/78795820/b5ea85fd-bd67-4e9d-8927-aa6380ca0b2a)

> 원본 , blur , 패턴을 적용한 각각의 이미지들
>
> 눈속임(?) 같지만 화질이 낮다는 인식을 줄여주는 것 같다는 생각이 든다

```
// 패턴의 경우 아래 css를 사용
// blur의 경우 filter 옵션을 사용
.pattern-overlay {
    background-image: url('path/to/pattern.png');
    opacity: 0.5;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
```

<br>

## 3.3 폰트 최적화

![font-1](https://github.com/teawon/Algorithm_js/assets/78795820/91f687c7-71ce-414a-a48a-7fd0e1a930f0)

- 문제 상황 : 비디오에 표현되는 폰트가 늦게 적용되면서, 폰트가 변하는게 사용자 눈에 바로 들어온다.
- 목표 : 사용자에게 시각적으로 부정적인 영향을 줄이기 위해 폰트를 최적화해보자

### 3.3.1 FOUT vs FOIT

**[FOUT (Flash of Unstyled Text)]**

- 폰트의 다운로드 여부와 상관없이 먼저 텍스트를 보여줌 (위 예시 영상에서 사용중인 방식)

  - 장점: 페이지 내용을 바로 볼 수 있다.
  - 단점: 텍스트 스타일이 바뀌는 것이 사용자에게 어색하게 느껴질 수 있다.

**[FOIT]**

- 폰트가 로드되어야 텍스트를 표현

  - 장점: 시각적으로 어색한 변화가 없다.
  - 단점: 사용자가 페이지 내용을 확인하는 데 시간이 더 걸림.

> “늦게 보여줘도 되는 텍스트는 차라리 FOIT으로 표현하자!”

### 3.3.2 시점제어

폰트 적용의 시점을 제어해서 최적화를 수행

-> ‘CSS의 font-display 속성을 활용하자!”

**`font-display`** 속성의 주요 값

1. **auto**: 브라우저의 기본 로딩 동작 (대부분의 경우 FOIT)
2. **block**: FOIT
3. **swap**: FOUT
4. **fallback**: 3초동안 FOIT 후 FOUT
5. **optional**: FOIT 후 브라우저가 네트워크 상태를 기준으로 폰트 로딩을 포기

여기서는 CSS의 애니메이션 효과를 통해 사용자 경험을 개선시키자. (이때, **fontfaceobserver** 라이브러리를 활용)

```javascript

import FontFaceObserver from "fontfaceobserver";

const font = new FontFaceObserver("BMYEONSUNG");

function BannerVideo() {
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    // 20초 타임아웃시 Promise에서 에러 발생
    font.load(null, 20000).then(() => {
      console.log("폰트 로드");
      setIsFontLoaded(true);
    });
  }, []);

  return (
  { ... }
      <div
        className="w-full h-full flex justify-center items-center"
        style={{
          opacity: isFontLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
       { ..content }
    </div>
  );
}

export default BannerVideo;

//1. fontfaceobserver라이브러리를 통해 폰트 다운시점을 확인
//2. 로드 되는 시점에 fade-in 애니메이션을 적용시키자
```

![font-2](https://github.com/teawon/Algorithm_js/assets/78795820/abb9e3c9-03ca-46cd-9654-5fad2c52e476)

> 기존과 다르게 폰트가 로드되는 시점에 CSS효과를 넣어 자연스럽게 폰트가 표현된다

### 3.3.3 포멧 변경

웹 페이지에서 폰트를 사용할 때, 파일 포맷의 선택은 성능과 호환성에 큰 영향을 미치며 주로 TTF, OTF, WOFF, WOFF2 등의 다양한 포맷이 있음

1. TTF (TrueType Font) & OTF (OpenType Font)

   - 특징: 벡터 기반으로 만들어져 확대/축소가 자유로움.
   - 웹 최적화: 본래 데스크톱 환경을 위해 설계되었기 때문에 파일 크기가 상대적으로 크다.

2. WOFF (Web Open Font Format)
   - 특징: OTF와 TTF를 기반으로 하되, 웹 전송을 위해 압축되어 있다.
   - 웹 최적화: 파일 크기가 작아 로딩 시간이 빠르지만, 모든 브라우저가 지원하지 않을 수 있음.
3. WOFF2
   - 특징: WOFF1보다 약 30% 더 효율적으로 압축되어 있다.
   - 웹 최적화: 필요한 글리프만 포함하여 서브셋을 생성할 수 있다.
     - 예를들어 "Hello"라는 문자만 사용한다면 해당 문자열에 대한 폰트정보만 가져오는것

https://transfonter.org/ 사이트 이용해 폰트의 확장자를 줄여보자

![image](https://github.com/teawon/Algorithm_js/assets/78795820/41b7360c-2f39-4ace-abda-8c6707b55a20)

> 특히 서브셋 폰트를 사용하면 필요한 일부 문자정보만 가져올 수 있다.

![image](https://github.com/teawon/Algorithm_js/assets/78795820/d710a269-e5db-46d3-96a4-6fb864709011)

> (서브셋폰트와 기존폰트의 크기차이 비교)

그리고 마찬가지로 호환성문제를 고려해 아래와 같이 폰트를 적용시키자.

```javascript
@font-face {
  font-family: BMYEONSUNG;
  src: url("./assets/fonts/subset-BMYEONSUNG.ttf") format("woff2"),
		    url("./assets/fonts/subset-BMYEONSUNG.woff") format("woff"),
		    url("./assets/fonts/subset-BMYEONSUNG.ttf") format("truetype");
  font-display: block;
  /*  위에서부터 우선적으로 폰트를 다운로드 */
}
```

### 3.3.4 DATA-URL

Data-URL은 웹 리소스를 URL 문자열로 직접 내장하는 방식을 의미.

이를 통해 폰트 파일을 CSS 내부에 직접 삽입할 수 있으며 별도의 네트워크 없이 css파일에서 폰트 사용이 가능하다.

- 장점
  - HTTP 요청 감소: 별도의 파일 요청이 없기 때문에 네트워크 부하를 줄일 수 있다.
  - 로딩 속도 향상: 작은 이미지나 폰트의 경우, 별도의 네트워크 지연 없이 즉시 로딩이 가능.
  - 호환성 보장: URL 형식은 모든 웹 브라우저에서 지원되므로 호환성 문제가 없다.
- 단점
  - 파일 크기 증가: Base64 인코딩은 원래의 파일 크기를 약 33% 증가.
  - 캐싱 문제: Data-URL은 브라우저 캐시에 저장되지 않아, 재방문 시 다시 로드.
  - 유지 보수 어려움: 원본 파일의 수정이 필요할 경우, 다시 인코딩해야 하는 작업 복잡.

즉 폰트와 같이 작은 파일의 경우 data-url을 사용하면 리소스를 바로 로딩해 사용자에게 보여줄 수 있다!!

> 물론 그만큼 처음 로딩시간이 길어진다
>
> 파일이 길어지고 수정할때마다 다시 인코딩을 해야하는데 작은 파일에 대해 사용한다면 사용자 눈에 로딩이 직접적으로 드러날 것 같지는 않다
>
> 네트워크 속도가 빨라진 요즘에는 잘 안쓰일 것 같다고 생각🤔

```javascript

@font-face {
  /* dataURL방식의 base64인코딩된 정보를 넣으면 번들파일내에서 한꺼번에 데이터를 받아오기때문에 별도의 HTTP요청 반복 횟수를 줄일 수 있다.
  (기존에는 번들파일 외적으로 따로 각 이미지나 폰트정보를 HTTP로 받아와야함 */
  font-family: BMYEONSUNG;
  src: url("data:font/woff2;charset=utf-8;base64......format("woff2")
}
```

![image](https://github.com/teawon/Algorithm_js/assets/78795820/1bd82ad2-4bbd-476a-935a-d18547fcf0da)
![image](https://github.com/teawon/Algorithm_js/assets/78795820/b1abeb7d-d41b-4344-99d8-aefd739ed183)

> 실제 네트워크 트래픽으로 인식할 뿐 별도의 다운로드 시간이 걸리지 않는다

<br>
## 3.4 캐시 최적화

<img src="https://github.com/Meet-the-past/docker/assets/78795820/22f08fdf-5ea6-4bbb-83bf-58818a799017" alt="캐시 최적화" width="400" />

- 문제 상황 : lighthouse를 통해 분석한 결과, 캐시 적용이 필요하다는 경고가 발생하고있다.
- 목표 : 캐시의 개념을 이해하고, 적절한 캐시 설정을 적용하기 (노드서버에서)

**[캐시]**

- 메모리 캐시
  - RAM (랜덤 액세스 메모리)에 저장하는 캐시
  - RAM은 빠른 속도로 데이터에 접근할 수 있기 때문에, 자주 사용되는 자원들을 메모리 캐시에 저장
  - 브라우저를 종료하면 사라진다
- 디스크 캐시

  - 웹 페이지의 자원을 하드 드라이브나 SSD와 같은 영구 저장 매체에 저장하는 캐시
  - 브라우저를 종료해도 저장된 데이터는 유지

> 캐시는 브라우저가 알고리즘에 의해 자동으로 처리하며 캐시 적용 여부는 Cache-Control 응답 헤더를 통해 확인할 수 있다

**[cache-control 헤더의 주요 속성]**

- **`max-age`**
  - 캐시의 유효시간, 단위는 초
- **`no-cache`**
  - 캐시를 사용전에 서버에게 한번 검증을 받아야 함
- **`no-store`**
  - 캐시를 사용하지 않음 (민감한 정보 및 개인 데이터를 다룰때 쓰인다)
- **`private`**
  - 응답이 개별 사용자에게 특화되었음 (개인 프로필 정보 등등..)
    - “이 응답은 개인적”이므로, 오직 사용자의 브라우저에만 응답을 캐시해라!
    - “CDN과 같은 중간 서버들에서 캐시를 하지 말아라 (= 다른 사용자가 동일한 URL에 접근했을때 정보가 보여지지 않도록)
- **`public`**

  - 응답이 공용 캐시에 저장될 수 있음, 즉 모든 환경에서 캐시 O

<hr>

위 내용을 기반으로 노드 서버에서 적절한 캐시 헤더를 설정해보자!

```javascript
// 기존코드
const header = {
  setHeaders: (res, path) => {
    res.setHeader(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    res.setHeader("Expires", "-1");
    res.setHeader("Pragma", "no-cache");
  },
};

// 수정코드
const header = {
  setHeaders: (res, path) => {
    if (path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
    } else if (
      path.endsWith(".js") ||
      path.endsWith(".css") ||
      path.endsWith(".webp")
    ) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
  },
};
```

**[적절한 캐시 유효 시간]**

- **HTML 파일**:
  - HTML 파일은 애플리케이션의 동적 내용을 반영하는 중심적인 자원이기때문에 자주 **변경될 가능성이 높다. (게시물 내용, 이미지…등등 동적으로 가져오는 경우가 많으니까)**
  - **`no-cache`**를 사용하면 브라우저는 항상 원래 서버에 해당 리소스의 유효성을 확인하고, **변경되었을 경우 최진 버전을 제공**해주어야한다
- **JS, CSS, 이미지 파일**:
  - 이러한 정적 자원들은 자주 변경되지 않을 가능성이 높다.
  - **`public, max-age=31536000`**는 리소스가 공용 캐시에 저장될 수 있음을 나타낸다
- **기타 파일**:
  - **`no-store`**는 캐시에 어떠한 것도 저장되지 않도록 하는데 이는 매번 해당 자원을 서버에서 새로 가져와야 함을 의미한다.
  - 민감한 데이터나 자주 변경되는 데이터에 적합

<img src="https://github.com/Meet-the-past/docker/assets/78795820/4cd3b5b4-3e6e-4f21-bce6-95ab4d7ef208" alt="전" width="600" style="display:inline;" />
<img src="https://github.com/Meet-the-past/docker/assets/78795820/57593280-e49b-4282-a88d-577e71ce5e22" alt="후" width="600" style="display:inline;" />

> 캐시 적용 전/후 이미지
>
> 그런데 캐시설정은 사실상 서버쪽에서 다루는 듯 하다. 프론트쪽에서 일방적으로 설정하는건 어려운듯.. 개념을 이해하고있자!

## 3.5 CSS 최적화

![image](https://github.com/Meet-the-past/docker/assets/78795820/0ae84284-a385-41a3-834a-61d7654f6809)

- 문제 상황 : Lighthouse의 분석 결과, 불필요한 main.chunk.css 리소스에 의해 경고가 표시되고 있다.
- 목표 : 사용하지 않는 CSS를 제거하여 성능을 개선하자.
<hr>

Q. 왜 해당 경고는 배포서버에서만 표현될까?

→ 로컬에서는 모든 클래스(사용 여부와 상관없이)가 포함된 상태로 CSS가 빌드되므로 "사용하지 않는 CSS" 경고가 나타나지 않는다. 그러나 배포 환경에서는 그러한 경고가 나타날 수 있다.

(보통 실시간으로 코드 변경을 반영하기 위한 설정이 활성화되어 있고, 이 때문에 모든 가능한 CSS가 로드)

<hr>

### 3.5.1 PurgeCSS

**[PurgeCSS]**
PurgeCSS는 사용되지 않는 CSS를 자동으로 제거하여 최종 CSS 파일의 크기를 줄이는 도구이다

**[작동 원리]**

1. **HTML, JS, 템플릿 파일 분석**: PurgeCSS는 프로젝트 내의 파일들을 스캔하여 사용된 CSS 클래스와 선택자를 파악
2. **CSS 파일과 비교**: 그 다음, 스타일시트에 정의된 모든 클래스와 선택자를 검토하여 실제로 파일에서 사용되지 않는 클래스와 선택자를 확인
3. **불필요한 CSS 제거**: 실제로 사용되지 않는 클래스와 선택자를 CSS 파일에서 제거

```
npm install --save-dev purgecss // 설치


purgecss --css ./build/static/css/*.css --output ./build/static/css/ --content ./build/index.html ./build/static/js/*.js  --config ./purgecss.config.js

// 명령어 실행 시 빌드된 HTML 및 JS 텍스트 키워드를 추출하여, 최적화를 하게 된다.

```

> 여기서 lg:m-8과 같이 Tailwind CSS나 일부 다른 CSS 프레임워크를 사용하고 있다면, 콜론(:) 문자를 올바르게 처리하기 위한 별도의 설정이 필요하다.

```
module.exports = {
  defaultExtractor: (content) => content.match(/[\w\:\-]+/g) || [],
};

// 콜론 문자를 하나의 키워드로 인식하기 위한 정규식
```

![image](https://github.com/Meet-the-past/docker/assets/78795820/c049809c-cd81-4886-8420-287913cfc2f8)
![image](https://github.com/Meet-the-past/docker/assets/78795820/5d39f0f3-785f-4d69-8562-30a1fa657f6c)

> 전/후 이미지 비교
>
> 눈에 띄게 크기가 줄어들었다

<hr>

Q. Tailwind, Bootstrap 같은 CSS 프레임워크를 사용한다면 사용하지 않는 CSS를 줄이기 위해 PurgeCSS를 사용하는게 매우 의미있다고 생각한다.
그럼 보통 그 외에는 안쓰는편일까?

![image](https://github.com/Meet-the-past/docker/assets/78795820/6d94db73-5730-4a90-9791-eaa1003aa67a)
![image](https://github.com/Meet-the-past/docker/assets/78795820/e31e3eec-ca72-49d0-b276-0aa26a104696)

> mui를 활용한 프로젝트에 대해 purgeCSS를 써본 결과의 전/후 이미지 비교 (차이가 별로 없는데?)
>
> 생각해보면 실수로 지우지 않은 불필요한 CSS를 제거하는 데 유용할 듯 하다
>
> build 명령어 자체에 넣어버려서 자동화하는것도 괜찮지 않을까?

## 참고자료

[https://bongbongdang.tistory.com/142](https://bongbongdang.tistory.com/142)

[https://scarlett-dev.gitbook.io/all/it/lazy-loading](https://scarlett-dev.gitbook.io/all/it/lazy-loading)

[https://velog.io/@byeol4001/Base-64와-base64-img-사용하기](https://velog.io/@byeol4001/Base-64와-base64-img-사용하기)

[https://toss.tech/article/smart-web-service-cache](https://toss.tech/article/smart-web-service-cache)
