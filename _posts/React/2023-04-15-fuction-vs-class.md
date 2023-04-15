---
title: "함수 vs 클래스 컴포넌트"

categories:
  - React
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-04-15
last_modified_at: 2023-04-05
---

## 1. React 컴포넌트

React 컴포넌트란 UI를 구성하는 최소 단위이며, React에서는 컴포넌트를 통해 UI를 작성하고 조합하여 하나의 완성된 어플리케이션을 만들기 위해 사용합니다.

특정 페이지에서 표현되는 버튼들과 글, 이미지는 모두 이러한 컴포넌트들로 구성이 되어있겠죠.

이러한 컴포넌트의 작성방식은 크게 두 가지 방법있습니다.

```
import React, { Component } from 'react';

class Button extends Component {
  render() {
    return (
      <div>
        <button>{this.props.text}</button>
      </div>
    );
  }
}

export default App;
```

```
import React from 'react';

function Button(props) {
  return (
    <div>
      <button>{props.text}</button>
    </div>
  );
}

export default App;
```

혹시 React에서 사용되는 위의 두 코드방식이 익숙하신가요??

둘다 동일한 방식의 화면을 표현하고있지만 첫번째 사진은 **클래스 컴포넌트** 기반으로 작성한 코드이며 두번째 사진은 **함수형 컴포넌트** 기반으로 작성한 코드입니다.

저는 사실 두번째 방식이 훨씬 익숙하고 편하지만 조금 옛날에 작성된 코드를 찾아보면 클래스 기반의 코드방식도 쉽게 볼 수 있습니다.

이번 글에서는 이러한 두 작성방식의 차이점과 장단점 위주에 대해 이야기하려 합니다.

## 2 클래스형 컴포넌트

클래스형 컴포넌트는 ES6의 클래스 문법을 이용하여 작성합니다. 클래스형 컴포넌트는 extends 키워드를 이용하여 React.Component 클래스를 상속받으며, render() 메소드를 이용하여 UI를 정의합니다.

클래스형 컴포넌트에서는 state와 props를 이용하여 상태를 관리합니다. state는 컴포넌트 내부에서 관리되는 상태이며, setState() 메소드를 이용하여 업데이트할 수 있습니다. props는 부모 컴포넌트에서 전달되는 데이터를 의미합니다.

아래는 클래스형 컴포넌트의 예시입니다.

```
import React, { Component } from 'react';

class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increase Count</button>
      </div>
    );
  }
}
```

위 코드에서는 ClassComponent 클래스를 이용하여 컴포넌트를 정의하고, state를 이용하여 count 값을 관리하며, handleClick() 메소드를 이용하여 버튼 클릭 시 count 값을 업데이트합니다. render() 메소드에서는 UI를 정의합니다.

## 3. 함수형 컴포넌트

함수형 컴포넌트는 함수 문법을 이용하여 작성합니다. 함수형 컴포넌트는 return 문을 이용하여 UI를 정의합니다.

함수형 컴포넌트에서는 props를 이용하여 상태를 관리합니다. props는 부모 컴포넌트에서 전달되는 데이터를 의미합니다. 함수형 컴포넌트에서는 상태를 관리하기 위해 useState() Hook을 이용할 수 있습니다.

아래는 함수형 컴포넌트의 예시입니다.

```
import React, { useState } from 'react';

function FunctionComponent(props) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increase Count</button>
    </div>
  );
}



```

위 코드에서는 FunctionComponent 함수를 이용하여 컴포넌트를 정의하고, useState() Hook을 이용하여 count 값을 관리합니다. handleClick() 함수를 이용하여 버튼 클릭 시 count 값을 업데이트하고, return 문에서 UI를 정의합니다.

## 4. 차이점

두 코드 방식의 차이점이 명확히 보이시나요? 말 그대로 클래스형태로 선언된 방식과 함수형으로 작성이되어있지만 구체적인 차이점은 아래와 같이 정리할 수 있습니다.

1.  문법과 구조

    > - 클래스형 컴포넌트 : ES6의 클래스 문법을 사용하며 React.Component를 상속받아 구현
    > - 함수형 컴포넌트는 : 일반 함수로 작성되며, 별도의 클래스 상속 없이 구현

2.  상태 관리

    > - 클래스형 컴포넌트 : this.state와 this.setState를 사용하여 상태를 관리
    > - 함수형 컴포넌트 : useState Hook을 사용하여 상태를 관리

3.  라이프사이클 메서드

    > - 클래스형 컴포넌트 : 라이프사이클 메서드를 사용하여 컴포넌트의 생성, 업데이트, 제거에 대한 로직을 구현
    > - 함수형 컴포넌트 : useEffect Hook을 사용하여 라이프사이클 메서드와 유사한 기능을 구현

## 5. 장단점

이어서 위 차이점을 기반으로 장단점을 보다 명확히 정의한다면 아래처럼 나타낼 수 있습니다

## 5.1 클래스형

> 장점
>
> > - 라이프사이클 메서드: 클래스형 컴포넌트는 라이프사이클 메서드를 사용하여 컴포넌트의 생성, 업데이트, 제거에 대한 로직을 구현할 수 있습니다. 이를 통해 코드의 구조화가 쉽고 관리가 용이하다
> >
> > - this 키워드: 클래스형 컴포넌트에서는 this 키워드를 사용하여 인스턴스의 속성과 메서드에 접근할 수 있습니다. 이를 통해 개발자가 객체 지향 프로그래밍 패러다임에 익숙하다면 코드 작성이 편리하다

> 단점
>
> > - 코드의 복잡성: 클래스형 컴포넌트는 함수형 컴포넌트에 비해 코드가 상대적으로 길고 복잡합니다. 이로 인해 가독성이 떨어질 수 있다.
> >
> > - 성능: 클래스형 컴포넌트는 함수형 컴포넌트에 비해 성능이 떨어질 수 있다. 클래스형 컴포넌트는 인스턴스 생성 과정이 필요하며, 불필요한 메서드와 속성이 포함될 수 있기 때문이다.

## 5.2 함수형

> 장점
>
> > - 코드의 간결함: 함수형 컴포넌트는 클래스형 컴포넌트에 비해 코드가 간결하고 가독성이 높다. 함수형 프로그래밍 패러다임을 따르기 때문에 부수적인 효과(side effect)를 최소화하고, 로직이 명확해지는 특징이 있다.

> > - 성능: 인스턴스 생성 과정이 없기 때문에 메모리 사용량이 줄어들고, 렌더링 성능이 비교적 좋다.

> > - Hook 사용 가능: 함수형 컴포넌트에서는 React Hook을 사용할 수 있으며 이를 통해 라이프사이클 메서드와 같은 기능을 구현할 수 있고 상태 관리도 간편해집니다.

> 단점
>
> > - 라이프사이클 메서드: 함수형 컴포넌트에서는 기존 라이프사이클 메서드를 사용할 수 없으며 대신 useEffect Hook을 사용하여 라이프사이클 메서드와 유사한 기능을 구현해야 한다.

> > - Hook 학습 러닝커브: 함수형 컴포넌트에서는 상태 관리와 라이프사이클 메서드 등의 기능을 위해 Hook을 사용하지만 React Hook은 처음 사용하는 개발자에게는 새로운 개념일 수 있으며 다소 러닝커브가 존재한다

## 6. 그래서 어떤걸..?

사실 정해진 정답은 없지만 현재 개발추세에 따르면 많은 개발자들은 <span style="color:red">함수형 컴포넌트 + Hook</span> 기반의 작성방식을 주로 사용하고 있습니다.

실제 React 공식홈페이지에서도 16.8버전 이후 Hook기능이 추가됨에 따라 함수 컴포넌트를 권장하고 있으며 그 이유는 아래와 같습니다

1. React Hook에서는 독립적인 재사용으로 인해 클래스형 컴포넌트의 고차원 컴포넌트 패턴을 강제하지 않음

2. useEffect Hook은 연관된 동작을 기능단위로 묶고 함수형 컴포넌트의 중복코드를 줄일 수 있음

3. 가독성

그러나 위 내용이 클래스형 컴포넌트의 내용을 아예 몰라도 된다는 것은 아닙니다.

레거시 코드를 리펙토링할때 사용되기도 하며 지금 회사에서 사용중인 상태관리 라이브러리 Mobx는 클래스 기반으로 작성하고있기 때문입니다.

```
import React from "react"
import ReactDOM from "react-dom"
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react"

// Model the application state.
class Timer {
    secondsPassed = 0

    constructor() {
        makeAutoObservable(this)
    }

    increase() {
        this.secondsPassed += 1
    }

    reset() {
        this.secondsPassed = 0
    }
}


```

> 공식문서에 작성된 Mobx 활용예제.
>
> 함수형 기반의 작성도 가능하지만 일반적으로 클래스기반의 작성방식을 많이 사용한다고 함
> (https://mobx.js.org/README.html#a-quick-example)

따라서 굳이 클래스형 컴포넌트 기반의 내용을 공부할 필요까지는 없겠지만 사용방식과 생김새정도는 알아두어야 하지 않을까 하는 생각이듭니다.

(처음 React공부를 할때 찾았던 예제코드가 클래스기반의 코드내용이라 함수형으로 바꾸는데 애먹었던 기억이 나네요 😅)

## 참고자료

(https://born-dev.tistory.com/27)[https://born-dev.tistory.com/27]
(https://fromnowwon.tistory.com/entry/react-class-functional?category=1021171)[https://fromnowwon.tistory.com/entry/react-class-functional?category=1021171]
