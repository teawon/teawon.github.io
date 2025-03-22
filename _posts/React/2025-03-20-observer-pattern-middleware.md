---
title: "Observer Pattern 기반의 에러핸들링 로직 구현하기"
categories:
  - React
tags:
  - React
  - Observer Pattern

toc: true
toc_sticky: true
toc_label: "목차"

date: 2025-03-20
last_modified_at: 2025-03-22

header:
  teaser: https://github.com/user-attachments/assets/b223dd29-90df-4e0b-aff4-1f2cc37d3bf2
---

## 개요

혹시 개발을 진행하며 아래의 에러에 마주하신 경험이 있으신가요?

<div class="notice">
 <p>React Hooks must be called in a React function component or a custom React Hook function</p>
</div>

이 에러는 React Hooks 규칙을 위반할때 발생합니다. 대체로 이런 에러를 마주하면, React Hooks의 규칙을 준수하도록 코드를 수정하거나, 아예 Hooks를 사용하지 않는 방식으로 문제를 해결합니다.

하지만 Hooks을 꼭 사용해야만 하는 상황이 있다면 어떤식으로 우회해야할까요?

이 글에서는 React Hooks의 제약으로 인한 문제를 해결하기 위해 Observer Pattern을 활용한 사례를 소개합니다.

상태 변경을 관찰하고 이벤트를 중앙에서 관리하는 미들웨어 로직을 구현하는 방법과 그 과정에서 고려해야 했던 주요 사항들도 함께 다룹니다.

## 배경

React에서는 다양한 방법으로 에러를 전역적으로 핸들링하고 관리할 수 있습니다.

예를 들어, `axios`를 사용하는 경우 `interceptor`를 활용해 공통 에러 처리 로직을 정의할 수 있으며, React Query에서는 `queryClient`를 통해 에러 핸들링 로직을 전역적으로 관리할 수 있습니다.

그런데, 다음과 같은 요구사항을 구현해야한다면 어떻게 해야할까요?

<div class="notice">
 <p>1. 일부 API 요청이 실패했을 때, 사용자에게 Modal을 띄워 알린다. (=특정 에러 코드가 반환 되었을 때)</p>
 <p>2. Modal에서 특정 로직(예: 사용자 확인, 추가 입력 등)을 수행한 한다</p>
 <p>3. 기존에 실패했던 api 요청을 재시도 한다.</p>
</div>

![Image](https://github.com/user-attachments/assets/e5f1a08b-b114-452c-8454-ab9d13ab0207)

> (이해를 돕기위한 예시 로직입니다.)
>
> 서버에서 너무 많은 요청을 보내면 에러를 발생시키고 사용자 확인을 통해 재시도 로직을 수행합니다.

Modal은 React의 상태(`useState` , `useContext`...)에 의해 의존해 관리되어야 합니다.

위에서 사례로 언급한 `interceptor` , `queryClient`은 React 컴포넌트 외부에서 동작하는 순수 함수의 성격을 가지고 있기때문에 모달을 띄우려면 React 컴포넌트 트리 내부에서 반드시 상태가 제어되어야합니다.

```tsx
// Axios Interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 여기서 React 상태를 사용해 모달을 열 수 없음 ❌
    if (shouldShowModal(error)) {
      // 모달을 띄우고 재시도 로직 실행 필요
    }
    return Promise.reject(error);
  }
);
```

```tsx
// React-query QueryClient
const queryClient = new QueryClient();
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => {
      // 여기서 React 상태를 사용해 모달을 열 수 없음 ❌
      if (shouldShowModal(error)) {
        // 모달을 띄우고 재시도 로직 실행 필요
      }
    },
  },
});
```

> React의 렌더링 사이클과 무관하게 실행되는 위 로직 내부에 React 상태나 컴포넌트 라이프사이클에 의존하는 로직을 직접 적용할 수 없다.

## 해결 방안 모색

결국 위와 같은 문제를 해결하기 위해 3가지 방법을 고려해볼 수 있었습니다.

1. 전역으로 핸들링하지않고 각 사용처에서 개별적인 에러 로직 처리

2. 전역 핸들링 로직을 React Hooks 형태로 변경

3. 중간 계층을 두고 외부 함수와 React 로직을 분리

<br>

### 1. 개별 처리

첫번째 방법은 각 API 호출하는 로직에서 직접 에러를 처리하고 모달을 제어하는 방식입니다.

```tsx
const MyComponent = () => {

  const { open } = useModal();

  const { mutate } = useMutation({
    mutationFn: () => {...}
    onError: (error) => {
      if (shouldShowModal(error)) {
        open();
      }
      { ... }
    },
  });

  return <Page />;
};
```

이 방법은 가장 직관적이며, 에러 발생 지점을 명확히 파악할 수 있다는 장점이 있습니다.

- 명확한 책임 분리 (사용범위가 명확함)

- 추후 복잡한 비즈니스 로직이 추가되더라도 각 로직에서 맞춤형 처리가 가능

<br>

그러나 이 방식은 에러가 발생할 수 있는 모든 API의 관계를 파악해야 하며, 코드량이 많아질수록 코드 중복과 유지보수의 어려움이 명확하게 드러납니다.

- 호출 지점에 대한 관리 포인트가 증가

- 코드 중복 및 유지보수 어려움

- 핸들링 로직을 별도의 함수로 분리해 공통으로 사용하더라도 결국에는 전역 처리의 단점을 가진 채 관리 비용만 증가

- 현 요구사항은 **반환되는 에러 코드** 값을 기준으로 처리하기때문에 복잡한 커스텀 기능이 요구되는 기능사항이 아님

### 2. hook으로 수정

모달을 제어하는 로직(Hooks)을 사용할 수 없다면, 전역 핸들링 로직을 커스텀 훅 형태로 확장하는 방법을 고려할 수 있습니다.

이 방식은 Axios Interceptor를 커스텀 훅으로 감싸 React 상태와 연동하여 공통 에러 처리 로직을 한 곳에서 관리하는 접근법입니다.

```tsx
export const useAxiosInterceptor = () => {

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (shouldShowModal(error)) {
          openModal();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

```

```tsx
// 최상단 Layout에 해당 요소 선언
function App() {
  useAxiosInterceptor();

  return {...}
}
```

이 방법의 장점은 공통 로직을 한 곳에서 관리할 수 있다는 점입니다.

동일한 에러 처리 로직이 전체 애플리케이션에 일관되게 적용되어 중복 코드를 제거하고 유지보수 효율성을 높일 수 있습니다.

<br>

하지만 이러한 접근법에는 다음과 같은 한계가 있었습니다

- React와의 강한 의존성

  - 훅이 마운트된 컴포넌트(예: App)에서만 인터셉터가 활성화됨
  - 이 로직을 재사용하려면 반드시 React 컴포넌트로 감싸져야 함

- 환경 격리
  - 테스트 코드를 작성하기 어려움

결국 어떠한 로직이 React Hooks에 강하게 결합된 구조를 가지게 된다면 추후 해당 로직은 결국 React 컴포넌트 내부에서만 동작할 수 있는 제한성을 가지며 이는 다른 라이브러리 도입 및 기능 확장 시 해당 로직을 분리하거나 재사용하기 어려운 문제에 직면하게 만듭니다.

더욱이 해당 구조를 사용한다면 기존 코드베이스의 형태를 Hooks형태로 수정하는 작업이 필연적으로 발생해 명확한 한계점이 있다고 생각했습니다.

<br>

---

> React와의 강한 의존성이 가지는 문제 예시

```tsx
export const Route = createFileRoute("SomePageRange")({
  beforeLoad: () => {
    // 에러 핸들링 로직을 여기에서 사용하고 싶음
    errorHandleLogic(); // ✅
    // errorHandleLogicWithHooks(); // ❌
  },
  component: () => {
    return <SubLayout />;
  },
});
```

`tanstack router` 라이브러리에서는 각 페이지 단위로 렌더링 이전에 특정 로직을 수행시킬 수 있는 `beforeLoad` 기능을 사용할 수 있습니다.

요구사항이 변경되어 페이지 단위로 이러한 로직을 적용하고 싶다면 어떻게 될까요?

만약 해당 로직이 Hooks 형태로 엮여 있다면, 그 로직을 분리하여 조건부로 적용하는 것이 어려워질 수 있습니다. 즉 특정 로직을 필요에 따라 유연하게 사용하거나 수정하기에 어려움이 발생할 수 있는거죠.

### 3. React 로직의 분리

해결 방안의 마지막으로, 중간 계층을 도입하여 외부 함수와 React 로직을 분리하는 방식을 고려하였습니다.

핵심 아이디어는 React 외부의 순수 함수 영역과 React 내부의 상태 관리 로직을 명확하게 분리하는 것입니다.

1. 순수 함수 영역

   - 에러 핸들링 로직을 React와 완전히 분리된 순수 함수로 구현합니다

2. 관찰자 컴포넌트

   - 상태 변경을 감지하는 별도의 컴포넌트를 두고 업데이트된 상태 값에 따라 모달 핸들링 및 재시도 로직을 수행합니다.

이러한 구조는 상태 변화에 따른 반응 로직을 감시자(observer)에게 위임함으로써, 전체 코드의 구조를 더욱 깔끔하게 만들고 역할과 책임의 분리를 명확히 할 수 있다는 장점이 있습니다.

그리고 이를 구현하기 위한 방법으로 `Observer Pattern`을 활용하였습니다.

## Observer Pattern

`Observer Pattern`은 객체의 상태 변화를 관찰하는 관찰자(옵저버)들이 주체(Subject)에 등록되고, 주체의 상태가 변경될 때 등록된 관찰자들에게 자동으로 알림을 전달하는 디자인 패턴입니다.

아래는 이를 활용해 애러 핸들링을 중앙에서 관리하는 구현 코드의 일부입니다.

### 1. **Subject**

```tsx
class MyErrorMiddleware {
  private listeners: MyErrorListener | null = null;
  private failedMutations: MyMutation[] = [];

  // 관찰자 등록 (단일 리스너 허용)
  public subscribe(listener: MyErrorListener) {
    if (this.listeners) {
      throw new Error("이미 구독되어있는 리스너가 있습니다.");
    }

    this.listeners = listener;
    return () => {
      this.listeners = null;
    };
  }

  // 상태 변경을 알리는 내부 메서드
  private notifyListeners() {
    this.listeners?.(this.failedMutations);
  }

  // 에러 상태 추가
  public publish(mutation: Mutation, variables: unknown) {
    this.failedMutations = [...this.failedMutations, { mutation, variables }];
    this.notifyListeners();
  }

  // 상태 초기화
  public clearMutations() {
    this.failedMutations = [];
    this.notifyListeners();
  }
}

// 중앙 관리 인스턴스 생성
export const myErrorMiddleware = new MyErrorMiddleware();
```

`MyErrorMiddleware` 클래스는 에러 정보를 저장하고, 등록된 옵저버에게 상태 변화를 알리는 역할을 담당합니다.

내부적으로는 `failedMutations` 배열을 활용해 에러가 발생한 `mutation` 정보를 별도로 관리하고 있습니다.
이는 하나의 요청 내에서 여러 개의 API 호출이 발생하거나, 실패한 요청을 추후 재시도해야 하는 상황에 대처하기 위해 내부 상태로 관리되어야하기 때문입니다.

또한, 이 로직은 전역에서 하나의 컴포넌트에게만 에러 상태를 전달하는 것을 의도하여 설계되었기 때문에, 리스너는 단일 컴포넌트만 등록 가능하도록 구현하였습니다.

<br>

### 2. **Error Publisher**

```tsx
// 최상위 Provider

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, variables, _, mutation) => {
      if (myErrorMiddleware.isMyError(error)) {
        myErrorMiddleware.publish(mutation, variables, error);
        throw error;
      }
    },
  }),
});
```

이어서 전역에서 발생하는 에러를 일관되게 관리하기 위해, 상위 `queryClient` 객체의 `mutationCache` 옵션에 에러 발생 시 처리할 로직을 등록합니다.

이를 통해 모든 `mutation` 요청에 대해 조건에 부합하는 에러가 발생한다면 일괄적인 핸들링 로직을 적용시킬 수 있습니다.

---

> queryClient의 mutationCache에서 에러를 처리한 이유?

첫번째 이유는 **Mutation 중심의 비즈니스 로직**에 명확하게 대응하기 위함입니다.

Axios를 사용하고 있었기 때문에 Interceptor를 활용해 에러를 처리 할 수 있었지만 Muation Context 내에서 실패한 요청 정보를 명확히 구분짓고자 하는 의도가 있었습니다.

두번째 이유는 **에러전파를 의도적으로 막기 위함**입니다.

조건에 부합하는 에러가 발생하면 각 컴포넌트에서 사용중인 에러 핸들링 로직이 발생시키는것을 막을 필요가 있었고 이를 막고자 에러를 의도적으로 `throw` 하여 에러 전파를 방지했습니다.

<br>

### 3. **Observer**

```tsx
// MyErrorModal
export const MyErrorModal = () => {
  const [failedMutations, setFailedMutations] = useState<MyMutation[]>([]);

  useEffect(() => {
    // 이벤트가 발생을 구독하고 상태값을 업데이트
    const unsubscribe = myErrorMiddleware.subscribe(failedMutations => {
      setFailedMutations(failedMutations);
    });

    // CleanUp시 구독을 해제
    return () => {
      unsubscribe();
    };
  }, []);
```

이어서, `Observer` 역할을 하는 컴포넌트에서는 `Subject`인 `myErrorMiddleware`를 구독하여 상태 변화를 감지하고, 에러 상태에 따라 필요한 UI 및 로직을 처리합니다.

`Subject`에서는 특정 비즈니스 로직에 의해 에러를 발생시킨 `Mutation` 정보를 내부 상태값으로 관리하며, 상태가 변경될 때마다 등록된 옵저버에게 해당 정보를 전달합니다.

```tsx
// MyErrorModal

{ ... }

const hasFailedMutations = failedMutations.length > 0;

const { mutate } = useMutation({
    mutationFn: async (mutations: MyMutation[]) => {
      const results = await Promise.allSettled(mutations.map(mutation => mutation.mutation.execute(mutation.variables)));
      const failedMutations = results.filter(result => result.status === 'rejected');

      if(failedMutations.length > 0) {
        throw new Error("retry failed mutations exist");
      }
      return results;
    },
    onError: () => {
     // error handle
     { ... }
    },
    onSettled: () => {
      myErrorMiddleware.clearMutations();
    },
  });



return (
  <MyModal open={hasFailedMutations}>
    { ... }
  </MyModal>
)
```

특히 주의해야 할 부분은, 에러가 발생한 `mutation`을 재요청할 때, 동일한 오류가 반복되지 않도록 예외 처리를 명확하게 구현해야 한다는 점입니다.

특정 이슈에 의해 동일한 에러코드가 반환되고 미들웨어에 저장되는 형태의 루프에 빠질 위험이 있기때문입니다.

![Image](https://github.com/user-attachments/assets/f2ef6fb3-efe4-4460-87ea-7e5bd2677d49)

> 플로우 정리

## 결론

이 글을 통해 React 개발자들이 다양한 에러 핸들링 전략을 이해하고, 자신의 프로젝트에 맞는 최적의 해결책을 선택할 수 있기를 바랍니다.
앞으로도 React 생태계에서 더 나은 에러 처리 방법을 모색하고, 이를 통해 사용자 경험을 개선하는 데 기여하기를 기대합니다.

## 참고자료

[Observer Pattern](https://www.patterns.dev/vanilla/observer-pattern/)

[React Hooks](https://ko.react.dev/reference/react/hooks)
