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

본 글은 알고리즘을 풀이하기 위해 정리한 자바스크립트의 문법 정리 글 입니다.

<!-- 1. const와 let의 차이가있을까?
2. 그래서 어떤걸 주로 쓰지?
3. answer.reduce??
4. sort할때 왜 a,b인자값을 넣어야하는가?
5. Number.MAX_SAFE_INTEGER 차이 ? -->

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

const value = "012345";

console.log(value.charAt(0)); // 0

// 2. substring(시작 index , 끝 index - 1) [문자열 자르기]

console.log(value.subString(3));  // "345"
console.log(value.subString(3,value.length); // "345"

```

## 4. 정렬

```javascript
// 1. sort( )
/*
- 파라메터가 없다면 "유니코드" 순으로 정렬합니다 (문자열 정렬의 경우 그냥 사용해도 O)
*/
const array = [
  {
    student: "people1",
    score: 100,
  },
  {
    student: "people2",
    score: 99,
  },
];

// 1.1 (오름차순)
array.sort(function (a, b) {
  //99 , 100
  return a.score - b.score;
});

// 1.2 (내림차순)
array.sort(function (a, b) {
  //100 , 99
  return b.score - a.score;
});
```

## 5. 배열

```

// 1. shift( )
/*
- shift() 메소드는 배열에서 첫 번째 요소를 제거하고 그 요소를 반환합니다
- 이 연산을 수행하면 배열의 크기가 줄어들게 됩니다.
*/

let arr = [1, 2, 3, 4, 5];
let firstElement = arr.shift(); // returns 1, arr is now [2, 3, 4, 5]

// 2. pop( )
/*
- pop() 메소드는 배열에서 마지막 요소를 제거하고 그 요소를 반환합니다.
- 이 연산을 수행하면 배열의 크기가 줄어들게 됩니다.
*/
let lastElement = arr.pop(); // returns 5, arr is now [1, 2, 3, 4]

// 3. push( )
/*
- push() 메소드는 배열의 끝에 하나 이상의 요소를 추가하고, 새로운 길이를 반환합니다.
*/
arr.push(6); // returns 5, arr is now [1, 2, 3, 4, 6]

// unshift( )
/*
- unshift() 메소드는 배열의 앞쪽에 하나 이상의 요소를 추가하고, 새로운 길이를 반환합니다.
*/
arr.unshift(0); // returns 6, arr is now [0, 1, 2, 3, 4, 6]

// Array(length)
/*
- Array() 생성자는 주어진 length 만큼의 길이를 가진 새로운 배열을 생성합니다.
- 생성된 배열의 각 요소는 undefined입니다.
*/
let newArr = Array(5); // newArr is [undefined, undefined, undefined, undefined, undefined]



```
