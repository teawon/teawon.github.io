---
title: "Javascript 문법 정리"

categories:
  - Java
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-03-13
last_modified_at: 2022-03-13
---

## 개요

코테 준비 언어를 자바스크립트로 변경하였습니다. 기업에 따라 자바스크립트 언어를 보는 곳이 늘어났다는 첫번째 이유와 실제 현업에서 사용하는 언어를 능숙하게 다루는게 더 효과적인 공부방식이라고 생각했기때문입니다.

...진작 바꿨어야했는데 ㅜㅜ..

본 글은 알고리즘을 풀이하기 위해 정리한 자바스크립트의 문법 정리 글 입니다.

1. const와 let의 차이가있을까?
2. 그래서 어떤걸 주로 쓰지?

## 1. 반복문

### 1.1배열 순회

```javascript

const array= ['a','b','c','d'];



//1. 기본

for(let i = 0; i< arrayStr.length; i++){  // a,b,c,d
  console.log(arrayStr.charAt(i));
}

//2. for of

for(const value of array) { // a,b,c,d
  console.log(value);
}


//3. foreach

array.forEach((value, index) => { // 0:a , 1:b, 2:c , 3:d
  console.log(index, ":" , value);
}

```

### 1.2 객체 순회

```javascript

const object = {
  name : "test",
  age : 10
  money : 10000
}


// 1. for in

for(const value in object){ // test, 10 , 10000
  console.log(value);
}

// 2. Object (객체를 배열로 바꿔줍니다)

Object.keys(object);   // ['name' , 'age' , 'money']
Object.values(object); // ['test' , 10 , 10000]
Object.entries(object) // [ ['name' , 'test'], ['age' , 10], ['money' , 10000] ]


```

## 2. 대문자, 소문자 변환

```javascript
// 1. toUpperCase (대문자)

console.log("abC".toUpperCase()); // ABC

// 2. toLowerCase (소문자)

console.log("ABc".toLowerCase()); // abc
```

## 3. 문자열 파싱 및 처리

```javascript

// 1. charAt()  [특정 요소에 접근]

console.log("abc".charAt(0)); // a

// 2. substring(시작 , 끝-1) [문자열 자르기]

console.log("012345".subString(3));  // "45"
console.log("012345".subString(3,6); // "45"

```
