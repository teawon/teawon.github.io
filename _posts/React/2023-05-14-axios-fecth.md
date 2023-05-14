---
title: "axios와 fetch"

categories:
  - React
tags:
  - axios
  - fetch
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-05-14
last_modified_at: 2023-05-14
---

## 1. 개요

React에서는 api를 요청할때 일반적으로 axios와 fecth방법을 사용합니다.

저같은 경우 큰 이유 없이 axios만 사용해왔지만 이 글에서는 axios와 fetch를 소개하고, 두 방법의 특징과 장단점을 비교하여 어떤 상황에서 어떤 것을 선택해야 하는지 정리해보고자 합니다

동시에 axios의 인스턴스를 관리해서 토큰관리를 어떤식으로 수행할 수 있는지 이야기해보겠습니다.

## 2. axios

"hello"를 응답값으로 주는 api를 axios를 통해 구현한 예시 코드는 아래와 같습니다.

```javascript
import axios from "axios";

axios
  .get("https://api.example.com/data")
  .then((response) => {
    const data = response.data;
    console.log(data); // "hello"
  })
  .catch((error) => {
    console.error(error);
  });
```

### 2.1 특징

[장점]

1. XMLHttpRequest 객체를 기반으로 하는 크로스 플랫폼 라이브러리이며 이는 브라우저와 Node.js 환경 모두에서 작동할 수 있다는 장점을 가지고 있습니다.

2. HTTP 요청이 실패했을 때 쉽게 에러를 처리할 수 있는 기능을 제공합니다. HTTP 상태 코드, 타임아웃 등을 설정하여 세밀한 에러 처리를 할 수 있습니다.

3. 요청과 응답을 가로채고 변형하는 인터셉터(interceptor)를 제공합니다. 이를 사용하면 요청과 응답을 중간에 가로채어 헤더 수정, 오류 처리, 요청/응답 로깅 등의 작업을 수행할 수 있습니다.

4. 자동으로 JSON 데이터 변환을 지원합니다

5. 타임아웃 설정이 가능합니다

[단점]

1. 별도의 패키지로 제공되기 때문에 의존성을 추가해야합니다.

   ( `yarn add axios` 또는 `npm install axios` )

2. 일부 구형 브라우저에서 지원되지 않을 수 있습니다.

   <img width="588" alt="image" src="https://github.com/teawon/2022-algorithm-study/assets/78795820/ffaeadc3-128b-40c9-8cd5-7ca80cc7f9b1">

   (23.05.14 기준 대부분의 브라우저에서 호환이 가능한 듯 합니다)

## 3. fetch

동일하게 "hello"를 응답값으로 주는 api를 fecth 통해 구현한 예시 코드는 아래와 같습니다.

```javascript
fetch("https://api.example.com/data")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log(data); // "hello"
  })
  .catch((error) => {
    console.error(error);
  });
```

### 3.1 특징

[장점]

1. 웹 브라우저의 내장 API로 별도의 설치가 필요 없습니다.

2. Promise 기반이므로 비동기 처리가 간편합니다.

3. 요청과 응답 스트림 처리가 가능합니다. (스트리밍 데이터 처리에 유용)

> 스트림 처리 : 스트림 처리는 데이터를 조각으로 나누어 순차적으로 처리하는 방식으로, 대용량 데이터나 지속적인 데이터 흐름이 필요한 경우에 유용합니다.

[단점]

1. 기본적으로 JSON 데이터 변환이 이루어지지 않아 별도의 처리가 필요합니다

   (서버로 JSON형식의 데이터를 전송하기 위해 JSON.stringify를 사용해야합니다.)

2. 에러처리가 상대적으로 더 복잡합니다

3. 지원하지 않는 브라우저가 존재합니다 (IE11)

## 4. 정리

사실 정리하다보니 axios를 사용하는 이유에 대한 장점을 정리한 느낌이 드네요

찾아보니 axios보다 fecth의 속도가 더 빠르다는 정보도 있었지만 성능 차이가 미미하며

<span style="color:red"> 에러처리, 요청 가로채기, 타임아웃 설정</span> 부분을 지원하는 부분의 편의성이 뛰어난 axios를 사용하는게 더 좋다고 생각합니다👍

## 5.(부록) axios로 인터셉터 처리하기

위 axios의 장점인 인터셉터 기능을 통해 토큰과 재발급 로직에 대한 처리를 간단하게 구현할 수 있습니다.

아래의 상황을 가정해봅시다.

> 1. 모든 api의 요청에는 헤더로 accessToken을 넣어 사용자 인증을 처리한다.
>
> 2. 만약 accessToken이 만료되면 401에러코드를 서버에서 반환한다.
>
> 3. 401에러 발생시 클라이언트는 refreshToken를 통해 accessToken의 재발급 요청을 수행한다.
>
> 4. accessToken 만료시 로그인 만료 메세지를 띄우고 메인페이지로 강제 이동시킨다.

위 로직을 처리하려면 모든 api를 요청할때 각각 헤더에 토큰정보를 넣도록 코드를 구현해야합니다.

마찬가지로 401에러가 나오면 토큰을 재발급하도록 처리해야만 합니다.

공통적인 부분은 한번에 묶어서 처리하고 싶지 않나요?? 바로 이 부분에서 인터셉터를 활용할 수 있습니다.

### 5.1 요청 인터셉터

```

import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: "https://api.example.com/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

```

첫번째는 axios의 요청 인터셉터를 설정하는 부분입니다.

인터셉터란 요청 또는 응답을 가로채고 원하는 처리를 할 수 있는 기능으로 api를 요청하기 전에 공통적으로 넣어야하는 토큰정보를 헤더에 넣어 요청하도록 처리합니다.

처음 프로젝트를 진행했을때에는 위 기능을 몰라

아래 코드처럼 각 api마다 하나하나 header에 데이터를 넣도록 처리했었습니다😥

```javascript

 axios({
        method: "post",
        url: `...`,
        headers: { Authorization: "Bearer " + localStorage.accessToken },
      })
        .then(function (response) {
           { ... }
        })

        // 각 api를 보낼때 헤더에 다 토큰을 하나하나 넣었다

```

### 5.2 응답 인터셉터

이어서 아래는 응답 인터셉터를 설정합니다. 말 그대로 서버로부터 응답을 처리하기 사전에 작업하는 내용으로 만약 토큰만료에 대한 401에러가 발생했다면 재발급요청을 진행하고 원래의 요청을 다시 보내는 로직으로 구현하였습니다.

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken != null) {
        const refreshedAccessToken = await updateAccessToken(refreshToken);
         // 토큰 갱신 api 요청

        if (refreshedAccessToken) {
           originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

          return axiosInstance(originalRequest);
      }
    }

    // 로그인 만료 예외처리 (refreshToken만료)

    return Promise.reject(error);
  },
);

```

위 방식으로 구현하면 사용자입장에서는 토큰을 재발급하고 해당 응답에 대한 요청을 다시 보내기때문에 끊김 없이 자연스럽게 서비스를 이용할 수 있습니다.

## 참고자료

[https://github.com/axios/axios](https://github.com/axios/axios)
