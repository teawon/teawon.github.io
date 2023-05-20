---
title: "react-query를 통한 프로젝트 개선기"

categories:
  - React
tags:
  - react-query
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-05-21
last_modified_at: 2023-05-21
---

## 1. 개요

현재 프로젝트에서는 컴포넌트에서 직접 api를 호출해서 데이터를 받아오거나 요청을 처리하고 있습니다.

다만 위 방식의 경우 중복된 요청과 캐싱 등의 성능 이슈가 발생하며, 코드의 복잡성과 유지 보수에 어려움을 겪는등의 문제점이 있었습니다.

이러한 성능적 이슈와 서버의 데이터관리를 보다 용이하게 처리하기 위해 react-query를 도입하고자 하였으며

이 글에서는 어떤식으로 기존 코드를 개선했고, react-query를 사용함으로써 어떤 장점을 가져올 수 있었는지 글을 정리하고자합니다.

## 2. React Query

React-Query는 서버의 비동기 데이터를 가져와 상태를 관리할 수 있게 도와주는 라이브러리입니다.

이 라이브러리는 애플리케이션의 서버 상태를 관리하며, 이는 클라이언트 상태 관리 도구인 Redux나 MobX와는 구분되는 점입니다. 그래서 React-Query는 서버 상태 관리 도구로 불리기도 합니다.

> 서버데이터 vs 클라이언트 데이터?
>
> > 만약 상태관리 라이브러리로 Redux를 사용하는 퀴즈 풀이 사이트가 있다고 가정합시다.
> >
> > 문제를 풀때마다 각 **스테이지** 가 올라가고, 일정 **점수** 를 계산해 클라이언트측에서 저장하다 게임이 종료되면 서버에 데이터를 전달합니다. 마지막에는 **랭킹점수** 를 볼 수 있다고 합시다.
> >
> > 이때 스테이지, 점수와 같은 요소는 클라이언트단에서 관리하는 데이터입니다. (서버와 관련이 없으며 외부에 의한 업데이트가 발생하지 않음) 그렇지만 랭킹과 같은 요소는 서버측의 데이터입니다.
> >
> > <span style="color:red">이런 서버 상태와 클라이언트 데이터를 Redux에서 한꺼번에 다루게되면 코드가 복잡해지고 불필요한 보일러코드가 발생하게 됩니다</span>

즉 React-Query는 서버의 상태를 효율적으로 관리하며, 자동 캐싱, 배경 업데이트, 중복 요청 병합 등을 통해 애플리케이션의 성능을 최적화하고, 코드의 복잡성을 줄여 개발 및 유지 보수를 용이하게 해줍니다. 이는 항상 최신 상태의 데이터를 보장하고 서버로부터 데이터를 가져오는 빈도를 줄여 애플리케이션의 성능을 향상시키는데 큰 장점을 가지고 있다고 정리할 수 있습니다.

## 3. 사용 배경

기존 프로젝트에서 사용중인 api중 로그인 관련된 부분을 크게 요약하면 아래와 같습니다.

1. 회원가입 요청[post]
2. 로그인 요청[post]
3. 사용자 닉네임 요청 [get]

이때 사용자 닉네임의 경우 아래 화면과 같이 Navbar에서 로그인되어있는 사용자를 소개하는데 사용중입니다.

<img width="1483" alt="image" src="https://github.com/techeer-sv/Mindspace_front/assets/78795820/22d9e493-a635-4499-ade0-57b10b8cc152">

(Navbar컴포넌트에서는 api를 통해 가져온 이름정보를 화면에 보여준다)

그러나 메인페이지에서 해당 페이지로 이동하면 같은 정보임에도 불필요하게 계속해서 api를 요청하도록 되어있습니다.

왜냐하면 useEffect를 통해 해당 컴포넌트가 마운트되는 순간 api를 요청해서 데이터를 가져오도록 설계되어있기 때문입니다.

```javascript

// src/compoent/Navbar

const [nickname, setNickname] = useState(null);

  { ... }

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn) {
        const userNickname = await getUserNickname(); // api호출
        setNickname(userNickname);
      }
    };

    fetchData();
  }, [isLoggedIn]);


```

<img width="321" alt="image" src="https://github.com/techeer-sv/Mindspace_front/assets/78795820/5024141b-4cfc-4620-ae13-5180ddfd7986">

이런 경우 어떤식으로 해결을 해야할까요??

우선 상태관리 라이브러리 (여기서는 recoil)을 사용해서, 처음 받아온 데이터를 저장 후 만약 초기값이 아니라면 api를 요청하지 않는 방식으로 처리한다면 불필요한 api를 호출을 줄일 수 있다고 생각했습니다.

하지만 앞서 말했지만 초기값과 if문을 사용한 로직을 추가해야하고 서버측의 데이터를 Recoil에서 관리하는게 적합한 구조는 아니라고 생각했습니다.

따라서 이런 불필요한 api호출을 줄이기 위해 react-query를 사용하고자 하였습니다.

## 4. react-query 사용

### 4.1 기본 설정

1. react-query 사용을 위해 의존성을 추가합니다.

   ` yarn add react-query`

2. 전체 애플리케이션의 상태 관리를 위한 Client를 전역적으로 설정합니다.

   ```javascript
   // index.tsx

   import ReactDOM from "react-dom";
   import App from "./App";
   import { RecoilRoot } from "recoil";
   import { QueryClient, QueryClientProvider } from "react-query";

   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         retry: 0,
       },
     },
   });

   ReactDOM.render(
     <RecoilRoot>
       <QueryClientProvider client={queryClient}>
         <App />
       </QueryClientProvider>
     </RecoilRoot>,
     document.getElementById("root")
   );
   ```

- QueryClient

  React-Query의 핵심 인스턴스로, 캐시 및 알림을 관리합니다. 이는 전역 설정과 함께 생성되며, 쿼리와 상호작용하는 주요 수단입니다.

  queryClient에는 기본설정을 추가할 수 있습니다. 저는 여기서 쿼리 실패에 대한 재시도 횟수를 0으로 설정하여 기본적으로 재호출을 하지 않도록 설정하였습니다.

  [기타 옵션](https://tanstack.com/query/v4/docs/react/reference/QueryClient)

- QueryClientProvider

  QueryClientProvider는 client prop으로 QueryClient 인스턴스를 받아, 이를 애플리케이션의 다른 부분에서 사용할 수 있게 합니다. 즉 App컴포넌트와 하위에서 자유롭게 React-query를 사용할 수 있게 합니다.

### 4.2 useQuery

이어서 useQuery를 사용해 기존의 닉네임 호출 api를 연결해보겠습니다.

```javascript

import { useQuery } from 'react-query';
import { useQueryClient } from 'react-query';
import { getUserNickname } from 'api/Auth'; // axios를 통한 api호출 함수

const Navbar = () => {
  const [isLoggedIn, setLoggedIn] = useRecoilState(isLoggedInAtom);
  const queryClient = useQueryClient();

  const { data: userNickname } = useQuery(['userNickname'], getUserNickname, {
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });

  const logout = () => {
    setLoggedIn(false);
    alert('로그아웃 되었습니다');
    navigate('/');
    localStorage.clear();
  };

  useEffect(() => {
    if (!isLoggedIn) {
      queryClient.invalidateQueries('userNickname'); //로그아웃 시 캐시 초기화
    }
  }, [isLoggedIn, queryClient]);

```

useQuery Hook은 주로 HTTP GET 요청과 같은 "읽기" 작업에 사용됩니다. 이는 useQuery가 서버로부터 데이터를 가져와 캐싱하고 이를 효율적으로 관리하는 역할을 하기 때문입니다.

이 Hook를 사용하면 비동기 데이터를 가져와서 캐싱, 동기화, 업데이트 및 자동 리프레시를 쉽게 처리할 수 있습니다.

기본적으로 useQuery는 세 가지 인자를 받습니다: 쿼리 키, 비동기 함수, 그리고 옵션 객체입니다.

- 쿼리 키 (query key): 쿼리의 고유 식별자이며, 배열 또는 문자열로 표현될 수 있습니다. 이 쿼리 키를 사용하여 캐시에서 데이터를 검색하거나 무효화할 수 있습니다

  위 코드에서는 "userNickname"이 쿼리키로 사용되었습니다.

- 비동기 함수 (async function): 이 함수는 쿼리를 실행할 때 호출되며, 원격에서 데이터를 가져옵니다. 이 함수는 Promise를 반환해야 합니다.

  위 코드에서는 getUserNickname 함수가 사용되었습니다. (사용자 닉네임을 받아오는 get타입의 api함수)

- 옵션 객체 (options object): 이 객체에는 쿼리의 동작을 세부적으로 설정할 수 있는 다양한 속성들이 있습니다. 예를 들어, 재시도 횟수(retry), 스테일 시간(staleTime), 쿼리 활성화 여부(enabled) 등을 설정할 수 있습니다.

  위 코드에서는 로그인 일때(enabled)만 api를 호출하며 동시에 한번 데이터를 받아오면 staleTime시간 동안 새롭게 api를 요청하지 않도록 설계하였습니다.

추가로 로그아웃 후 다시 로그인을 했을때 닉네임을 읽어올 수 있도록 `queryClient.invalidateQueries('userNickname');` 코드를 실행해서 해당 쿼리에 대한 캐시를 초기화 하였습니다.

결과적으로 react-query의 캐시기능을 사용해 staleTime시간동안은 새롭게 api를 요청하지 않도록 하여 불필요한 api 호출을 줄일 수 있었습니다🙌

또한 기존의 useState hook으로 관리하던 nickname변수도 useQuery를 통해 가져온 data를 바로 사용할 수 있기때문에 코드도 간소화되었습니다

<img width="348" alt="image" src="https://github.com/techeer-sv/Mindspace_front/assets/78795820/a04306cc-712f-420c-aec4-a73124dac389">

### 4.3 useMutation

같은 맥락으로 useMuatation을 사용한 로그인 부분입니다. (회원가입도 비슷하므로 패스!)

```javascript

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from 'api/Auth';
import { useSetRecoilState } from 'recoil';
import { isLoggedInAtom } from 'recoil/state/authAtom';
import { useMutation } from 'react-query';

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const setLoggedIn = useSetRecoilState(isLoggedInAtom);

  const loginMutation = useMutation(getAccessToken, {
    onSuccess: (accessToken) => {
       // mutation이 성공하면 실행되는 콜백
      localStorage.setItem('accessToken', accessToken);
      setLoggedIn(true);
      navigate('/');
    },
    onError: (error: Error) => {
       // mutation이 실패하면 실행되는 콜백
      setErrorMessage('에러가 발생하였습니다');
    },
  });


  const submitForm = () => {
    loginMutation.mutate({ email, password });
  };

  return { ... }
```

useMutation Hook은 API나 함수를 호출하여 데이터를 변경("쓰기" 작업)하는 경우에 사용됩니다. (즉 post, delete, put)

이 Hook은 애플리케이션이 서버의 데이터를 변경하는데 필요한 모든 상태와 함수를 제공합니다.

이 예제에서 getAccessToken은 로그인 요청을 보내는 API를 호출하는 함수입니다. 이 함수는 useMutation Hook에 전달되어, 로그인 폼이 제출되면 호출됩니다.

onSuccess는 로그인 요청이 성공적으로 처리된 후 호출되는 콜백 함수이며 onError는 로그인 요청이 실패한 경우 호출되는 콜백 함수입니다.

loginMutation.mutate 메서드는 사용자가 로그인 폼을 제출할 때 호출되는 함수입니다. 이 함수는 getAccessToken API를 호출하여 로그인 요청을 보냅니다.

위 사례에는 표현되지 않았지만 useMutaion을 사용한다면 특정 쿼리를 무효화하거나, 실패에 대한 재시도 및 다른 쿼리를 업데이트해서 항상 최신의 데이터를 보여주고 관리하는데 도움이 된다고 합니다.

(특정 api를 보냈을때 관련해서 새롭게 다른 api를 받아와야 하는 경우 해당하는 쿼리키를 날려 다시 조회가능)

즉 비동기 API호출과 관련된 복잡성을 크게 줄일 수 있는 것이죠!

### 4.4 폴더 구조

각 컴포넌트에서 react-query 코드를 바로 호출해도 크게 상관은 없지만 하나의 폴더에서 관리하는게 보다 용이하다고 생각이 들어 별도의 파일을 만들고 관리하도록 수정을 진행하였습니다.

```javascript
// src/hooks/queries/user
import { useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { getUserNickname, createUser, getAccessToken } from "api/Auth";
import { KEY } from "utils/constants";

export const useUserNicknameQuery = (isLoggedIn: boolean) => {
  return useQuery([KEY.USER_NICKNAME], getUserNickname, {
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
};

export const useClearUserNicknameCache = (isLoggedIn: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn) {
      queryClient.invalidateQueries(KEY.USER_NICKNAME);
    }
  }, [isLoggedIn, queryClient]);
};

export const useSignUpMutation = (
  successAction: () => void,
  errorAction: (message: string) => void
) => {
  return useMutation(createUser, {
    onSuccess: () => {
      successAction();
    },
    onError: (error) => {
      errorAction("에러가 발생하였습니다");
      console.log(error);
    },
  });
};

export const useSignInMutation = (
  successAction: (token: string) => void,
  errorAction: (message: string) => void
) => {
  return useMutation(getAccessToken, {
    onSuccess: (accessToken) => {
      successAction(accessToken);
    },
    onError: (error) => {
      errorAction("에러가 발생하였습니다");
      console.log(error);
    },
  });
};
```

이때 queryKey의 경우 바로 문자열로 사용해도 상관은 없지만 컨벤션을 통일하기 위해 하나의 쿼리키를 사용할때에도 배열로 표현해였고 동시에 상수로 분리하여 관리하도록 설계하였습니다.

(<span style="color:red">중복을 방지하고 key입력의 실수 방지와 재사용성을 위해서</span>)

폴더위치의 경우 도메인별로 `src/hooks/queries/{도메인}` 으로 분리하였는데 하나의 도메인에서 코드량이 길어진다면 각 페이지별로 분리하는 방법도 좋다고 합니다. (지금 프로젝트는 아직 때가 아니네요ㅎ)

## 참고자료

[https://velog.io/@alsghk9701/...](https://velog.io/@alsghk9701/QueryClient%EC%9D%98-Default-Options-%EC%A0%81%EC%9A%A9)

[https://tech.kakao.com/2022/06/13/react-query/](https://tech.kakao.com/2022/06/13/react-query/)

[https://velog.io/@restarea/react-query-%EB%A6%AC%EC%95%A1](https://velog.io/@restarea/react-query-%EB%A6%AC%EC%95%A1%ED%8A%B8-%EC%BF%BC%EB%A6%AC%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-server-state-%EA%B4%80%EB%A6%AC-%EA%B5%AC%EC%A1%B0)
