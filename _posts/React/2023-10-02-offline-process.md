---
title: "사용자 경험을 위한 네트워크 에러 관리 전략"

categories:
  - React
tags:
  - 이미지 사전로딩
  - WebSocket

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-10-02
last_modified_at: 2023-10-03
---

## 1. 개요

저희 회사의 서비스는 "실시간 데이터"를 중심으로 작동합니다. 특히 사비스의 특성상 실시간 통신이 굉장히 중요하고 화면상에 최근 장비 통신 시간을 비롯해, 소켓과 파이어베이스를 통해 실시간으로 들어오는 데이터들을 보여주어야하기 때문입니다.

따라서 장비의 연결 상태, 센서 데이터, 제어 결과 등이 사용자의 네트워크 환경 문제로 인해 업데이트되지 않는 상황인지, 아니면 장비 자체의 문제로 인한 것인지를 사용자에게 명확하게 표현하는 것이 중요했습니다.

즉 <u>네트워크 연결이 끊겼을 때</u>, 화면 상에서 적절한 안내 메시지를 제공하여 현재 상황을 명확히 사용자에게 전달해 줄 필요가 있었던거죠.

그럼에도 불구하고 때때로 화면이 절전모드에 들어갔을때 소켓연결이 끊겨버려서 장비의 연결상태가 모두 끊김으로 표현되는 문제가 발생했습니다.
모니터링 서비스의 특성상 화면을 계속 켜두는 경우가 많을 수 있다고 생각했는데 이런 문제점이 꽤나 심각한 사항으로 이어질 수도 있었죠.

그렇다면 프론트엔드에서 사용자에게 별도의 안내 페이지를 제시하려면 어떻게 해야 할까요?

## 2. 네트워크 끊김 처리

우선 네트워크의 연결 상태를 실시간으로 확인하는 로직이 필요했습니다. 이미 웹소켓을 사용하고 있었기에, 네트워크 연결 문제를 웹소켓을 통해 감지하도록 결정했습니다.

웹소켓의 disconnect와 connect 이벤트 리스너를 등록함으로써, 네트워크의 연결 및 끊김 상태를 실시간으로 감지하고 적절히 대응하도록 말이죠.

disconnect 이벤트는 주로 다음 세 가지 상황에서 발생합니다:

1. 사용자 환경의 네트워크 연결이 끊어졌을 때.

2. 웹소켓 서버 자체에 문제가 발생하여 연결이 끊어졌을 때.

3. 사용자 환경이 절전모드로 전환되었을 때. (1번 내용에 포함됩니다. 절전모드에 들어가면 네트워크가 끊기니까요)

우선 기존에 소켓이 끊겼다면 재연결하도록 코드는 구현되어있었기 때문에 여기서 필요한건 각 이벤트를 구독하고 적절한 함수처리를 하는 작업이 필요했습니다.

> 소켓 객체 자체에서 connect_error이벤트가 발생하면 재 연결하도록 처리

```javascript
// 별도의 WrapperComponent

const [requestedLocation, setRequestedLocation] = useState(null); // 재 연결이 되었을때 기존 페이지로 이동
const [socketState, setSocketState] = useState(socket.connected); // 소켓 연결 상태를 저장

const handleNetworkError = () => {
  // 모달창의 상호작용을 통해 상태값을 업데이트
  setSocketState(false);
};

useEffect(() => {
  socket.on("disconnect", () => {
    const message = navigator.onLine
      ? "서버에 연결할 수 없습니다"
      : "네트워크 연결이 원활하지 않습니다.\n인터넷 연결을 확인해주세요.";

    setModalOpen("error", message, {
      // 모달창을 띄우도록 상태값 업데이트
      mode: "modal",
      closeFunc: handleNetworkError,
    });
  });
  socket.on("connect", () => {
    setModalClose();
    setSocketState(true);
  });
}, []);
```

위의 코드는 소켓이벤트를 감지하고 적절한 로직을 수행합니다.

기존에 로그인 상태에 따라 보여주는 페이지를 다루기 위해 router쪽에서 별도의 Wrapper컴포넌트를 사용하고있었는데 로그인과 마찬가지로 상위 단계에서 이루어져야하는 렌더링작업이기때문에 해당 컴포넌트에서 코드를 추가했습니다.

이때 <u>네트워크 문제와 서버상의 문제를 구분</u>하기 위해 `navigator.onLine` 웹 API를 사용해 사용자의 네트워크 상태를 확인하도록 처리했습니다.

그 후 적절한 모달메세지를 띄우고 창을 닫았을 때 네트워크 에러 페이지가 렌더링되도록 코드를 구현했습니다.

> navigator.onLine이란?
>
> 웹 API 중 하나로 사용자 시스템이 온라인이라면 true, 아니라면 false를 return한다
>
> 참고 : https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine

```javascript
if (navigator.onLine) {
  if (socketState) {
    // 소켓이 연결되어있다면 기존 페이지 렌더링
    if (requestedLocation && location.pathname !== requestedLocation) {
      setRequestedLocation(null);
      return <Navigate to={requestedLocation} />;
    }
    return children;
  }

  // 소켓이 끊겨있다면 별도의 안내페이지 렌더링
  return <NetworkError />;
}
```

![modal](https://github.com/teawon/teawon.github.io/assets/78795820/d5b883ca-a536-4be9-a267-d98a7414c85a){: .center}{: width="600" height="400"}

> 네트워크가 끊기면 에러 모달창을 띄우고, 확인을 누르면 별도의 네트워크 에러페이지를 렌더링한다.
>
> 중간에 네트워크가 다시 연결되면 모달창은 닫힌다

<br>

## 3. 이미지 사전로딩

![image_not_load](https://github.com/teawon/teawon.github.io/assets/78795820/5858cbda-0cf8-4247-9ca1-6707035516ad){: .center}{: width="600" height="400"}

> 그러나.. 이미지가 표현되지 않는다

그러나 네트워크가 끊기고 표현되는 페이지에서 사용되는 이미지가 제대로 표현되고 있지 않습니다.

사실 당연합니다. 이미지는 일반적으로 웹 페이지가 로드될 때 서버로부터 요청됩니다.

이때, 네트워크 연결이 불안정하거나 끊어진 상태라면 이미지가 제대로 로드되지 않을 것입니다. 브라우저의 네트워크 요청 탭을 확인해보면, 이미지에 대한 요청은 보냈지만 응답 메세지에서는 실제 이미지 데이터가 도착하지 않는 것을 확인할 수 있습니다.

![image](https://github.com/teawon/teawon.github.io/assets/78795820/ddeac1bd-89af-4373-8452-a0c512cc948f){: .center}{: width="400" height="300"}

따라서 이미지 사전로딩을 통해 해당 페이지에 들어가기 이전에 미리 이미지를 받아오도록 처리해야했습니다.

<br>

**[이미지 사전로딩]**

이미지 사전로딩은 웹 페이지에서 사용될 이미지들을 미리 다운로드하는 과정을 말합니다.

[관련 자료](http://localhost:4000/book/perfomence-2/#23-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%82%AC%EC%A0%84%EB%A1%9C%EB%94%A9)

이 기술은 주로 사용자의 대기 시간을 줄이기 위해 사용되며, 특히 대용량의 이미지나 여러 개의 이미지를 포함한 웹페이지에서 유용하게 활용됩니다.

이미지 사전로딩에는 여러 방법이 있지만, 여기서는 SVG이미지를 React컴포넌트로 직접 사용하여 사전로딩하도록 처리했습니다.

별도로 이미지를 다운받아 props로 넘기거나, base64방식으로 인코딩하는 방식에 비해 코드가 깔끔하고 로고의 이미지 특징상 SVG이미지를 사용하기 적합하다고 생각했기 때문입니다.

(사실 처음에는 base64방식으로 이미지를 인코딩해서 코드에 넣었는데, 소스코드가 너무 길어지고 이미지를 변경할 때 마다 다시 인코딩해야한다는 단점이 너무 두드러져서 팀원분께서 SVG를 이용한 코드 방식을 사용해주셨습니다! 확실히 더 코드가 간결해지고 유지보수하기 용이했습니다👍)

<br>

**[React Component로서의 SVG]**

SVG (Scalable Vector Graphics)는 웹에서 벡터 이미지를 표현하는 XML 기반의 포맷이며 CRA와 같은 도구에서는 SVG를 React 컴포넌트로 바로 임포트하고 사용할 수 있게 지원합니다.

SVG이미지를 컴포넌트로 직접 사용한다면 JavaScript 번들에 직접 포함되게 되므로 별도의 네트워크 요청이 필요 없게 됩니다.

이는 이미지 사전로딩과 같은 효과를 가져다주며, 네트워크 연결 상태에 상관 없이 이미지를 제대로 표시할 수 있게 됩니다.

```javascript
// NetworkError/index.js

// 기존
<img alt="network_error_img" src="static/images/status/network-error.svg" />;

// 이후

import { ReactComponent as NetWorkErrorLogo } from "src/assets/images/network-error.svg";

// {...}

<MaintenanceLogo className="main_image network_error_img" />;
```

![result](https://github.com/teawon/teawon.github.io/assets/78795820/eda6ee4f-2799-4452-8f25-be4407b4f33e){: .center}{: width="600" height="400"}

> 이미지가 적절하게 표현된다🙌

## 참고자료

[https://socket.io/docs/v4](https://socket.io/docs/v4)
