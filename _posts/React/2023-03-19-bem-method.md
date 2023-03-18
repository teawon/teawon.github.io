---
title: "BEM 방법론 - css이름 짓기"

categories:
  - React
tags:
  - css

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-03-19
last_modified_at: 2023-03-19
---

## 개요

변수명의 이름을 짓는 것처럼 css이름을 정의하는 방식도 상당한 고민거리가 아닐 수 없습니다.

특히 인턴생활을 경험하면서 처음 지적받았던 사항이 className과 관련된 내용이였고 이름을 짓는 일 때문에 시간을 많이 사용하기도 했던 것 같네요😢

이름을 정의하는데 정해진 규칙은 없지만 BEM방법론은 이런 className 명명에 대한 지침을 제공하고 보다 직관적이고 구조화 가능한 작성 방법에 대해 소개하고 있습니다.

이참에 새로 시작하는 프로젝트도 scss와 bem방법론을 사용해볼겸 내용을 정의하고 공부해야겠다고 생각했습니다.

## BEM

### 1. 정의

BEM은 Block, Element, Modifier의 약어로 웹 개발에서 사용되는 CSS 방법론 중 하나입니다. BEM 방법론은 CSS 클래스 이름의 작성 규칙을 정의하며, 이를 통해 CSS 코드를 더욱 구조화하고 유지 보수를 용이하게 할 수 있다고 합니다.

BEM 방법론은 **Block, Element, Modifier**의 세 가지 개념으로 이루어져 있습니다.

- Block : 웹 페이지에서 독립적으로 존재하는 구성 요소를 뜻합니다. 이 구성요소는 다른 Block과 상호작용 하지 않으며, 그 자체로도 완결된 기능을 갖춥니다. 예를 들어, 메뉴, 버튼, 헤더 등이 Block입니다.

  ```javascript

  <div class="menu">
    <!-- 메뉴 요소들 -->
  </div>
  ```

- Element : Block 내부에서 특정한 역할을 수행하는 하위 요소를 뜻합니다. Black의 일부로써 다른 Block과는 상호작용 하지 않습니다. 예를 들어, 메뉴의 각 항목, 버튼의 아이콘 등이 Element입니다.

  - (식별자로 `__`를 사용합니다.)

  ```javascript
  <div class="menu">
    <ul>
      <li class="menu__item">항목1</li> // Menu라는 "Block"내부의 하위요소
      <li class="menu__item">항목2</li>
    </ul>
  </div>
  ```

- Modifier : Block이나 Element의 상태나 외형을 변경하는 클래스를 뜻합니다. 예를 들어, 버튼이 클릭되었을 때의 상태, 메뉴가 활성화되었을 때의 상태 등이 Modifier입니다.

  - (식별자로 `--`를 사용합니다.)

  ```javascript
  <div class="menu">
    <ul>
      <li class="menu__item menu__item--selected">선택된 항목</li>
      <li class="menu__item">항목2</li>
    </ul>
  </div>
  ```

### 2. 예시

역시 글보다는 코드를 보는게 가장 편하겠죠?

![image](https://user-images.githubusercontent.com/78795820/226126623-a226f332-3c4e-4a8b-91c6-6ad27865fa86.png)

1. Block

   처음 보았을 때 저는 위 페이지를 크게 "상단" , "중앙의 3카드" , "버튼" 으로 요소를 나눌 수 있다고 저는 생각했습니다.

   따라서 큰 맥락을 다음과 같이 코드를 구성하였습니다.

   ```javascript

   .header {
     // 상단의 Wrapper
   }

   .content {

     // 내부의 카드 요소들
   }

   .button-wrapper {
     // 버튼 요소
   }

   ```

2. Element

   이후 차례차례 각 Black을 이루는 구성요소를 분석합니다.

   header의 경우 두 Text요소가 있으며 content의 경우 크게 3개의 카드요소가 있으며 button-wrapper 내부에는 버튼이 있네요.

   카드요소는 이미지와 텍스트로 구성이 되어있습니다. 이를 컴포넌트 관점에서 아래처럼 정의합니다

   ```javascript

   .header {
     // 상단의 Wrapper

       &__title {
     // 큰 제목
     }

     &__sub-title {
       // 작은 제목
     }

   }



   .content {
     // 내부의 카드 요소들

     &__card-wrapper {
       // 카드를 감싸는 요소

       &__image {
         // 이미지
       }

       &__label {
         // 각 단어
       }
     }
   }

   .button-wrapper {
     // 버튼 요소

     .button {
       // 버튼
     }
   }

   ```

3. Modifier

   각 카드컴포넌트의 경우 클릭했을 때 가장자리에 효과를 주는 등의 효과를 넣고자 합니다.

   ```javascript

   .content {
     // 내부의 카드 요소들

     &__card-wrapper {
       // 카드를 감싸는 요소


       &--selected {
           // 선택되었을 때 효과
       }

       &__image {
         // 이미지
       }

       &__label {
         // 각 단어
       }
     }
   }
   ```

4. 전체 코드

```javascript
// temp.scss

.header {
  background-color: gray;
  border-radius: 20px;
  opacity: 0.8;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  padding: 30px;
  margin: auto;
  width: 90%;

  &__title {
    text-align: center;
    font-size: 2rem;
  }

  &__sub-title {
      text-align: center;
      font-size: 1.2rem;
  }
}

.content {
  display: flex;
  justify-content: space-between;
  margin: 100px 20px 0 20px;

  &__card-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-basis: 30%;
    padding: 10px;
    background-color: #ebffdb;

    &--selected {
        border : 1px solid blak;
    }

    &__image {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    &__label {
      text-align: center;
      font-size: 1.5rem;
    }
  }

  &__button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 50px;

    &__button {

    }
  }
}


```

### 3. 장점과 단점

BEM 방법론을 장단점은 아래와 같습니다.

장점

1. 직관성 : 명확하게 모듈을 분리하여 표현하기때문에 한 눈에 봐도 체계적인 구조를 확인할 수 있습니다.

2. 유지보수성 : 모듈화가 용이하며 새로운 모듈추가 및 변경에 대해 일부 코드를 수정하여 유연한 대처가 가능합니다. 즉 확장성면에서도 유리합니다.

3. 협업에 용이 : 명확한 지침에 의거해 이름을 정의하기때문에 협업 규칙으로 사용할때 용이합니다.

단점

1. 길이 : 클래스 이름이 길어지며 과도하게 길어지면 오히려 가독성이 떨어질 수 있습니다. 즉 코드 작성의 시간과 HTML의 코드 양이 증가한다는 문제점이 있을 수 있습니다.

### 결론

항상 옳고 절대적인 규칙은 없다고 생각합니다. 팀 내의 프로젝트 규모와 상황에 따라 필요한 방법론을 사용하는게 좋다고 생각하며 이러한 방법론을 사용할때는 장단점을 명확하게 이해하고 사용해야할 것 같습니다. 일반적으로 BEM방법론의 경우 규모가 큰 프로젝트에서 유용하다고 하네요🙌

## 참고자료

[https://getbem.com/naming/](https://getbem.com/naming/)

[https://nykim.work/15](https://nykim.work/15)
