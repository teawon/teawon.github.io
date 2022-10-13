---
title: 코틀린 문법(1)

categories:
  - Kotlin
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-10-13
last_modified_at: 2022-10-13
---

## 변수와 상수

```kotlin
var temp = 5
var temp : Int = 5
```

(변수의 자료형은 “ : 자료형 “ 형태로 표현이 가능하나 생략도 가능하다. – 대입 값으로 자동인식)

(변수만 선언 후 향후 값을 받아올 때는 자료형까지 변수를 선언해주어야 한다.)

(한 번 정해지면 다른 자료형 값 넣을 수 없음)

- val : 상수

  ```kotlin
  val c = “Constant”
  (향후 변경 불가)
  ```

- Any

  ```kotlin
  var everything : Any = 1
  // (향후 다른 자료형 넣기 가능 , 어떤 값이든 가능 , == Java의 Object)

  ```

- [“, ‘ , “””]

  - “”” : \n을 쓸 필요없이 들어간 내용 그대로 대입
  - ‘ : 문자
  - “ : 문자열

- Null

```kotlin
var a : Int? = 5
//(기본적으로 NULL값은 허용하지 않는다. 허용하고 싶으면 자료형 뒤 “?” 붙어야 함!)

a?.let { println(“NULL값이 아닙니다 }  // - let함수를 이용

a?.length  // - ?.은 만약 NULL값이라면 바로 NULL을 반환

var stringVar = a ?: “값이 NULL입니다” // (왼쪽이 NULL이라면 오른쪽 값 대입)

var stringVar = a!!  // (변수!! : 절대 null이 아님을 보장하는 표현 , null이면 오류 발생)

// [타입 변환의 경우 실패했을 떄 null반환]
var wrong = “숫자아님”

var value:Int = wrong.toInt() // case1 : -> 오류 발생
var value:Int? = wrong.toIntOrNull()  // case 2:- > null값 대입
```

- 문자열의 템플릿 기능

  ```kotlin
   var temp= “안녕 $name아? “
   println(“두 수를 더한 값은 ${num1+num2}야”)
   var message = “error Code : ${greeting.trim( )}“

   //(문자열 안에 특정 값이나 계산 값을 그대로 삽입 – 마치 유닉스의 Today is `date` !
  ```

### 배열

```kotlin
var arr : Array<Int> = Array<Int>(3){0}
var arr = Array<Int>(3){“NULL”}
```

- 자료형은 생략이 가능하다.

- ( = Array<자료형> (크기) {초기값} )

- 초기값은 0번째가 아니라 모든 인덱스에 적용

- 배열 관련 메소드

      arrayof
      var arr2 = arrayof(10,5,6,7,9) = 초기값을 10,5,6,7,9로가지는 int형 배열 생성
      var intarr2 = arr2.toIntArray()
      // = 원시 타입의 배열로 변환
      // (자바에서 배열 타입을 인자로 요구할 때 arrayof로만 쓰면 안되는 듯!)

      ```

### 타입변환

```kotlin
var intTemp=1
var doubleTemp : Long = intTemp //오류 발생 코틀린에서는 자동형변환이 이루어지지 않는다.
var doubleTemp : Long = intTemp.toDouble //다음과 같은 형 변환이 필요하다.


doubleTemp = intTemp (x) // 다른 자료형의 값을 대입하는 것이 불가능하다. 자동형변환이 ㄴㄴ
```

### 연산자

```kotlin
var value=6/5 // 1

var value = 6/5.0 // 1.2
//(모두 정수타입이라면 소수점 날라감 – 타 언어와 같은 특징)
```

- 단항연산자 – “-“

  ```kotlin
  var temp=100

  var test = -temp //-100대입

  var test = -(-temp) //100대입

  // ( “-“ : 값의 부호 변경)
  ```

- 연산자 "=== / !== "

  - 값의 참조가 같은지 비교 – 두 객체가 같은 메모리 주소를 점유하고 있는가?)

- in 연산자

```kotlin
var arr = arrayOf(1,2,3,4,5)

println(5 in arr) // TRUE

var list = listOf(‘a’, ’b’, ’c’)

println(‘z’ in list) // FALSE

//(특정 값이 배열/리스트/집합 등에 포함이 되어있는지 확인)
```

- 연산자 ".."

```kotlin
println(1 in 1..10) //1 2 3 4 5 .. 10

println(‘a’ in ‘a’..’z’) // a b c d e ... z

//(범위 객체를 생성)

for(num in 1..5) { println(num) }  // -> 1,2,3,4,5 출력
var items = arrayOf(‘a’ , ‘b’ , ‘c’)
for((index, itemName) in items.withIndex( ) ) {
    println(“$index번째 값 : $itemName”)
}

//(for문의 값을 순회할 때 사용하기도 한다)
// (withIndex메소드와 함깨 위치정보 포함 2개의 변수를 순회할 수도 있다)
```

### 제어문

```kotlin
if(temp.startsWith(“Hello”)) println(“Hello로 시작합니다.)
(startsWith메서드 : 문자열의 시작이 “~~”인지 확인)

```

- 범위 객체의 생성

```kotlin
if(I in 0 until array.size() ) // until : a~b-1 – 배열에서 자주 쓰입니다.

for( i in 100 downTo 1) // 100부터 1까지 순회(역순)

for( i in 1 .. 100 step 2) //1 , 3, 5, 7 , 9 ….

var arrangeValue = ‘가’ until ‘나’ // 가,각,갂,갃. …. 낗 까지 범위 객체를 변수에 저장

```

- if표현식과 삼항자

```kotlin
var bigger = if(num1>num2) num1 else num2

var grade = if(score==100) “A” else if(score in 90 until 100) “B” else “C”

var grade = if(score==60) “ABCD”.get(2) //해당 식과 같이 최종반환값을 메서드로 표현 가능(B)

//(자바의 삼항식과 같은 표현은 사용불가 // int a = (2>1) ? 100 : 200

// (if표현식으로 비슷하게 표현 할 수 있다.)
// (특징은 변수 값 = if ( ) { } , 변수 값에 if문을 넣는다? 되게 특이한 표현 방식인데 깔끔)

```

- when-case
  "조건식 -> 일치할 경우 실행할 명령어"

```kotlin
   when(num) {
      (1\*3) -> { print(“num값은 3!”) print(“두 명령어 묶을때는 { }")

      (2,3,4,5,6,7) -> print(num값은 2,3,4,5,6,7 중 하나입니다)

      in 90 .. 100 -> “A” //식과 같이 범위 표현도 가능

      else -> println(“예외”) // 어떠한 조건에도 일치하지 않는다면 else

   }

   var x : Any = “StringValue”

   when(x) {
      is String -> print(string형 자료) //is 연산자를 통해 타입확인도 가능
      is Int -> print(Int형 자료)
      else -> …
   }

   var temp = when {
      (socre == 100) -> “A”
      (score % 3 == 0) -> “3의배수”)
   }   //변수의 값 지정도 when 사용 가능


   (when은 마치 case와 같은 느낌!)

   (특정 값을 when인자에 넣고 해당 값과 일치 할 때 구문을 실행)

   (if표현과 같이 변수값 = when() { } …형태로 사용 가능

   (when의 인자를 생략 할 경우 조건식을 직접 입력하는 형태로도 사용 가능)

```
