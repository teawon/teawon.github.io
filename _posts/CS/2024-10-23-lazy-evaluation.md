---
title: "지연평가(Lazy Evaluaion)"
categories:
  - CS
tags:
  - javascript
  - Generator
  - Lazy Evaluation
toc: true
toc_sticky: true
toc_label: "목차"

date: 2024-10-23
last_modified_at: 2023-10-29

header:
  teaser: https://github.com/user-attachments/assets/076f8efb-516a-4e26-b273-e4bfd8527351
---

## 1. 개념

지연 평가(lazy evaluation)는 계산이 실제로 필요할 때까지 평가를 미루는 프로그래밍 기법입니다.

이 개념은 성능 최적화와 자원 관리에 주요한 역할을 하며, 특히 대량의 데이터를 처리하거나 복잡한 계산 작업을 다룰 때 유용하게 사용됩니다.

자바의 `Iterator` 와 `Stream` 에서도 이러한 개념이 사용되고 있으며 자주 사용되곤 하는 자바스크립트의 유틸리티 라이브러리 `Lodash`에서도 지연평가를 위한 메서드를 제공하고 있습니다.

이러한 지연 평가 기능은 얼마나 유의미한 효과를 가지고 있을까요? 단점은 없을까요? 이 글에서는 지연평가의 개념과 사례, 그리고 성능 비교를 통해 효과성을 분석해보고자 합니다.

## 2. 사례

자, 지금부터 아래의 요구사항을 만족하는 코드를 구현해야한다고 가정해봅시다.

<div class="notice">
 <p>1부터 10까지의 숫자에 대해 모든 숫자를 두 배로 만든 후, 3의 배수인 숫자 찾기</p>
</div>

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const transformed = numbers.map((num) => {
  console.log(`${num} -> ${num * 2}`);
  return num * 2;
});

const firstNonMultipleOfThree = transformed.find((num) => {
  console.log(`${num}`);
  return num % 3 === 0;
});

console.log(`result: ${firstNonMultipleOfThree}`);
```

<div class="notice--success notice--base">
<h4>실행 결과</h4>
   <p>1 -> 2</p>
   <p>2 -> 4</p>
   <p>3 -> 6</p>
   <p>4 -> 8</p>
   <p>5 -> 10</p>
   <p>6 -> 12</p>
   <p>7 -> 14</p>
   <p>8 -> 16</p>
   <p>9 -> 18</p>
   <p>10 -> 20</p>
   <p>2</p>
   <p>4</p>
   <p>6</p>
   <p>result: 6</p>
</div>

`map`과 `find`메서드를 통해 계산을 수행했으며, 10개의 숫자에 대해 각각의 연산 **10**번과 탐색의 과정에서 **3번** 총 **13번**의 연산을 수행했습니다. 이렇게 모든 요소에 대해 즉각적으로 수행하는 연산을 **엄격한 평가** 라고 합니다.

<br>

그럼 지연평가의 사례를 확인해볼까요?

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function* mapGenerator(arr, transform) {
  for (const item of arr) {
    console.log(`${item} -> ${transform(item)}`);
    yield transform(item);
  }
}

function* findGenerator(arr, predicate) {
  for (const item of arr) {.

    console.log(`${item}`);
    if (predicate(item)) {
      yield item;
      break;
    }
  }
}

const mappedNumbers = mapGenerator(numbers, (num) => num * 2);
const firstNonMultipleOfThreeLazyGen = findGenerator(
  mappedNumbers,
  (num) => num % 3 === 0
);

console.log(`result: ${firstNonMultipleOfThreeLazyGen.next().value}`);
```

<div class="notice--success notice--base">
<h4>실행 결과</h4>
   <p>1 -> 2</p>
   <p>2</p>
   <p>2 -> 4</p>
   <p>4</p>
   <p>3 -> 6</p>
   <p>result: 6</p>
</div>

지연평가의 경우 숫자 1,2,3에 대한 연산 **3번**과 탐색의 과정에서 **3번** 총 **6번**의 연산을 수행했습니다.

수행 횟수를 기준으로 2배이상의 차이가 발생한 것이죠. 어떠한 원리에 의해 이러한 차이가 발생한걸까요?

우선 코드에 사용된 `*function 및 yield`에 대해 알아봅시다.

## 3. Generator

**제네레이터(Generator)**는 자바스크립트에서 특별한 유형의 함수로, 함수의 실행을 일시 중지하고 필요한 시점에 결과를 반환하는 방법을 제공합니다.

일반 함수와 구별되는 점은 `function*` 키워드를 사용해 정의하며, 호출 시 일반적인 함수처럼 모든 코드가 한 번에 실행되는 것이 아니라, 각 호출마다 실행이 조금씩 진행됩니다.

`yield` 키워드는 제너레이터 내에서 사용되며, 특정 값이나 표현식을 호출자에게 반환하면서 제너레이터의 실행을 일시 중지합니다. 제너레이터는 이후 호출 시 yield 다음 줄에서 실행을 이어갑니다.

이러한 특징을 통해 데이터의 연산 수행 시점을 "호출 시점"으로 분리할 수 있습니다.

```javascript
function* simpleGenerator() {
  console.log("first  yield");
  yield 1;

  console.log("second yield");
  yield 2;

  console.log("third yield");
  yield 3;
}

// 제너레이터 함수 호출
const generator = simpleGenerator();

console.log(generator.next().value); // first  yield , return 1
console.log(generator.next().value); // second yield , return 2
console.log(generator.next().value); // third yield  return 3
console.log(generator.next().value); // undefined
```

위에서 설명한 대로, 제너레이터와 yield를 사용하면 실행이 필요할 때에만 진행되므로, 모든 데이터가 즉시 변환되거나 탐색되지 않습니다.

즉 이를 통해 메모리 사용량을 줄이고 성능을 최적화 활용할 수 있습니다.

이를 바탕으로 위 사례의 지연평가 코드를 분석한다면 다음과 같이 표현할 수 있습니다.

![example](https://github.com/user-attachments/assets/c4482835-8857-4d0d-81db-8fda59f81aad)

> 자바스크립트의 for...of 문은 이터러블한 객체를 자동으로 진행시켜 내부적으로 next()를 호출한다.

## 4. 성능 비교

제너레이터 기반의 지연 평가를 사용하면 복잡한 데이터를 더 효과적으로 처리하고 시스템 자원을 최적화할 수 있습니다. 그렇다면, 모든 연산이나 작업에 지연 평가를 적용하는 것이 항상 최선의 선택일까요?

지금부터 실제로 대량의 데이터를 처리하는 상황을 가정하여, 지연 평가와 즉시 평가의 성능 차이를 비교해 보겠습니다. 이를 통해 얼마나 실질적인 성능 차이가 있는지 살펴보고자 합니다.

<br>

![my-example](https://github.com/user-attachments/assets/076f8efb-516a-4e26-b273-e4bfd8527351)

<div class="notice">
 <p>서버에서는 100만 건의 사용자 데이터를 보내줍니다.</p>
 <p>사용자는 "나이", "활동량 지표" 값을 속성으로 가지고 있습니다.</p>
 <p>클라이언트에서는 활동량 지표의 최소 및 최대 값을 입력받아, 해당 기준에 부합하는 표본 50개를 랜덤하게 추출하여 그래프로 시각화합니다.</p>
</div>

이제 임의의 데이터 100만건에 대해 50개의 데이터를 추출하는 로직이 필요합니다.

다음의 두 코드는 각 추출 코드를 **지연평가 방식** 및 **엄격한 평가** 방식으로 구현한 코드입니다.

> lodash라이브러리의 지연평가 기능을 사용

```javascript
// 지연평가 기반의 표본 추출 코드
import _ from "lodash/fp";

function findTopUsersLazy(entries, maxCount, minLevel, maxLevel) {
  return _.pipe(
    _.filter(
      (entry) =>
        entry.activityLevel >= minLevel && entry.activityLevel <= maxLevel
    ),
    _.take(maxCount),
    _.map((entry) => ({
      userId: entry.userId,
      level: entry.activityLevel,
      age: entry.age,
    }))
  )(entries);
}
```

```javascript
// 엄격한(즉시)평가 기반의 표본 추출 코드

function findTopUsersEager(entries, maxCount, minLevel, maxLevel) {
  const filteredEntries = entries
    .filter(
      (entry) =>
        entry.activityLevel >= minLevel && entry.activityLevel <= maxLevel
    )
    .slice(0, maxCount);

  return filteredEntries.map((entry) => ({
    userId: entry.userId,
    level: entry.activityLevel,
    age: entry.age,
  }));
}
```

이어서 실행시간을 나타낸 비교 그래프 입니다. (단위 ms)

두 코드의 실행 시간을 비교한 결과, 어림잡아도 상당한 시간차이가 발생했습니다.

예시로 극단적인 사례를 들었지만, 이 차이는 다음과 같이 정리할 수 있습니다.

![image](https://github.com/user-attachments/assets/f687d30f-9ef3-49da-815b-9b1e38f36b73)

- 지연 평가 방식은 필요한 50개의 표본을 얻은 후, 즉시 처리를 중단

- 즉시 평가 방식은 입력된 최대, 최소 기준에 해당하는 모든 데이터를 한꺼번에 필터한 후, 그 중에서 50개를 선택

## 5. 정리

사실, 위와 같은 극단적인 상황은 프론트엔드 환경에서 자주 발생하지 않을 수 있습니다. 일반적으로 복잡한 데이터는 서버에서 미리 가공되어 클라이언트에게 제공되는 것이 일반적이기 때문입니다.

그렇지만, 지연 평가의 개념은 데이터 처리량이 많거나 성능 최적화가 필요한 상황에서 부분적으로 활용할 수 있는 효과적인 도구임은 분명합니다.

사실 좋은 이야기만 나누었는데 그렇다고 해서 무턱대고 지연 평가를 사용하기보다는, 이러한 기능이 꼭 필요한 상황인지 검토하는 것이 중요한 것 같다고 생각합니다.

지연 평가가 어떤 문제를 해결할 수 있는지, 그리고 이를 통해 어떤 이점을 얻을 수 있는지에 대한 명확한 이해와 논의를 바탕으로, 프로젝트 특성과 요구 사항에 맞추어 지연 평가를 적절히 활용해 필요에 따라 적절히 사용할 줄 아는 경험이 중요할 것 같습니다.

## 6. 기타

테스트 중 개인적인 궁금증이 생겼습니다.

지연평가의 이점을 활용할 수 없는 상황이라면 오히려 지연평가의 시간이 오래 걸릴까요?

위 예시에서 10,000개의 데이터에 대해 10,000개의 표본을 추출하도록 코드를 수정하고 결과를 비교한 결과입니다.

> (이 경우 지연평가와 엄격한 평가 모두 동일한 연산횟수를 가집니다.)

![image](https://github.com/user-attachments/assets/b2461c87-12e8-412e-bc3e-5a734356daee)

아쉽게도 측정 값이 브라우저 상태 및 시스템 리소스 등 여러 외부 요인에 의해 영향을 받을 수 있다는 것을 고려했을때, 유의미한 성능 차이를 도출하기에는 부족함이 있었습니다.

## 참고자료

[https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Generator](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Generator)

[https://ko.javascript.info/generators](https://ko.javascript.info/generators)

[tistory](https://inpa.tistory.com/entry/LODASH-%F0%9F%93%9A-%EC%A7%80%EC%97%B0-%ED%8F%89%EA%B0%80-%EC%9B%90%EB%A6%AC-lodash%EB%8A%94-%EC%98%A4%ED%9E%88%EB%A0%A4-%EC%84%B1%EB%8A%A5%EC%9D%B4-%EC%A2%8B%EC%9D%84-%EC%88%98-%EC%9E%88%EB%8B%A4)
