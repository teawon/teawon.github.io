---
title: 코틀린 문법(2)

categories:
  - Kotlin
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-10-15
last_modified_at: 2022-10-15
---

## 함수

- 기본용어

  -프로시저(Procedure) : 반환 값 없는 함수

  -엔트리 포인트 함수 : 처음 시작 시 실행되는 함수(=main함수)

  -빌트인 함수 : 유용한 기능을 수행하도록 미리 정의한 함수 ( println(), readLine() . . . . .)

### 함수의 정의

```kotlin
fun sum( num1 : Int , num2 : Int) : Int {  return num1+ num2 }

fun test( ) : Unit { println(“반환 값 없음”) return}

// 일반적인 형태는 (이름 , 매개변수 , 반환 자료형 , 함수의 내용)

// 매개 변수가 없다면 void를 여기서는 Unit으로 사용하며 생략해도 된다. return도 생략 가능

// 매개변수는 상수로 값을 가져오기 때문에 값 변경 불가, 새로 변수를 만들어서 바꾸어야 한다.)
```

### 함수의 축약

````kotlin
 fun sum(num1 : Int , num2 : Int) = a+b

 ((fun sum(num1:Int,num2:Int) : Int { return a+b } ))

 fun Bigger(num1 : Int, num2 : Int) = if(num1>num2) num1 else num2

 // if의 표현식과 같이 등호(“=”)를 이용해서 반환형태 및 괄호를 생략하고 한 줄로 가독성 향상이 가능

```

````

### 함수의 인자 값

```kotlin
  fun test(a:Int = 1, b:Int = 2) { } // a : Int , b : Int = 3 (가급쪽 오른쪽에 몰리게!)

  test( )

  test(5)

  test(b=5)

  // C++에서와 같이 디폴트 값 설정 및 임의의 매개변수를 “ : “ 표현으로 직접 대입이 가능하다

  // 특별한 이유가 없으면 순서대로 대입되기 때문에 주의해야 한다.
```

### 함수의 가변인자

````kotlin
fun test ( vararg manyNums : Int ) : Int {
    for ( number in manyNums ) {
        //실행 코드
    }
}

test(1,2,3,4,5,6) // test(1,2,3) . . .

// 가변적으로 인자를 입력하고 싶다면 “vararg”키워드를 사용

// listOf , arrayOf( ) 함수도 가변인자를 활용해서 만들었다. – 리스트, 집합 객체 만들 때 유용

// Public fun <T> listOf(vararg element : T) : List<T> (예시)

```

````

### 전개 연산자

– 배열을 가변인자로 전달

```kotlin
val arr = intArrayOF(1, 2, 3)

var sum3 = TempFunction(_arr)

// Spread연산자 “ _ “ 를 이용해서 배열의 모든 인자를 가변인자로써 사용가능

// 단 arrayOf로 만든 객체는 원시 타입의 배열로 만들어서 사용해야한다

// String의 경우 그냥 사용해도 괜찮다
```

### 람다함수

```kotlin
val square : (Int,Int) -> Int = { num : Int, num2 : Int -> num*num2 }

var square = {num:Int,num2:Int -> num * num2} // 두 코드는 같은 내용

val testVoid : ( ) -> Unit = { println(“인자 없음”) }

val testVoid = { println(“인자 없음”) }


// 이름 , 타입 지정(생략 가능) , 인자 값들 , ->반환 값(return)

// 타입이 같은 함수라면 다른 람다 함수를 대입 할 수 있다.

// -int int -> int형태의 +계산기함수를 , 다시 대입해서 -계산기로 바꿀 수 있다는 뜻.
// ex) printHello = { println(“HI”) , printHello = {println(“Not Hi) }

val test : (String -> Unit ) = {println(“Hello $it ) }

val test : (String -> Unit)

test = {name:String -> println(“Hello $name “) } //수정

val test = println(“Hello $it “ )  // ( x ) !!

// 인자 값이 하나라면 it을 이용해 인자 값에 접근 가능 (당연히 직접 명시한 인자 이름도 가능)

// 단 , 함수의 타입을 추론할 수 없게 앞의 타입을 생략했다면 IT사용 불가. 추론이 안되니까..)

```

### 함수의 반환값으로 람다함수 반환

```kotlin
fun makeRamda(uniVal:Char) : (Int,Int)->Int{
      when(uniVal) {
                ('+') -> return { x: Int, y: Int -> x + y }
                ('-') -> return { x , y -> x-y}
                else -> return { x,y -> -1 }
               }
      }
val calPlus=makeRamda('+')
val calMinus=makeRamda('-')
println(calPlus(1,5))
println(calPlus(2,1)


 // “변수 = 람다 함수”를 함수로 구현해서 사용 하는 것.
 // 직접 대입해보면  val calPlus=makeRamda(‘+’)   == val calPlus = {x :Int, y:Int -> x+y} 와 같음
```

### 함수 내 지역변수

```kotlin

fun makeTest() : ()->Unit {
    var count = 1
    return {
        println("함수는 $count 번 출력되었습니다.")
        count++
    }
}

val test1 = makeTest()
val test2 = makeTest()

println("test1을 두 번 출력합니다.")
test1()
test1()

println("test2를 한 번 출력합니다.")
test2()

println("다시 test1을 한 번 출력합니다(3번째)")
test(1)
```

![image](https://user-images.githubusercontent.com/78795820/195671015-b20591b5-7c28-4a5e-8c50-3b3a0010b187.png){: height="500"}{: .center}

> 함수 내 지역변수 count가 메모리에 남아서 계속 값이 유지된다.
>
> 코틀린에서는 바깥 영역의 변수 값을 참조하고 변경하는 작업을 허용한다.

### 함수의 인자로 람다함수를 전달

```kotlin
fun temp(var : (Int, Int) -> Int, x: Int , y : Int ) : Int { return var(x,y) }

      val result = temp( {x,y -> x+y} , 2, 3 )

      // 함수의 인자로 변수가 아니라, 함수의 형태를 선언! (변수의 형태 선언 하듯)

      // 함수의 호출에 함수의 값(=람다 함수)을 넣어 직접 함수를 인자로 전달 한다.

```

### 함수 참조 연산자

```kotlin
  fun sumValue(num : Int, num2:Int) { return num+num2 }
  fun minusValue( num :Int, num2:Int ) { return num2-num }

  var myTemp : (Int) -> Int = :: sumValue

  myTemp  =  ::minusValue

   // 함수도 람다함수와 같이 변수나 상수에 대입 할 수 있다.

  fun reverse(s:String) = println(s.reversed( ))

  listOf(“Hello”,”World”).forEach( :: reverse )   // olleH \n dlroW 출력.

  // 정의한 함수를 “ :: “ 연산자를 통해 지정하여 변수에 대입할 수 있다.

  // forEach메서드는 값을 하나씩 함수의 인자값으로 전달하는데 위와 같이 자주 쓰인다.

  // 변수에서 타입선언은 생략해도 된다.

  // 단 오버로딩된 함수의 경우 모호성이 발생하므로 타입을 꼭 써줘야한다.

  // var test = :: println (X)     => var test : ( ) -> Unit = ::println

```

## Scope함수

1. let

   ```kotlin
   var temp : String? = “Hello”

   temp?.let { println(“NULL이 아닐 때 실행합니다.”) }
   ```

2. with

   ```kotlin
   var temp : “Hello”

   var lower = with(temp) { this.toLowerCAse() }
   ```

3. run

   ```kotlin
   var p1 = Point(1,2)  // 객체 하나 생성

   var pointToPair = p1.run { Pair(x,y) }  // (2,4)가 반환되서 변수에 저장
   ```

4. apply

   ```kotlin
   var p2 = p1.apply { x=100 , y=200 }

   // 대체로 객체의 내용을 초기화하거나 설정값 적용에 사용됩니다.
   ```

5. also

   ```kotlin

   var word = mutableListOf(“Hello” , “World “)

   words.also { println( $it,first() ) }

   // 대체로 객체의 값을 변경하지 않고 내용을 조회 할 때 사용됩니다.
   ```

Q. 왜 Scope함수를 사용하나요?

> 가령 임의의 객체값을 설정하고 싶다고 가정해봅시다. 그럴경우
>
> ```kotlin
> Point p1
> Point p2
> p2.x = p1.x
> p2.y - p1.y
> ```
>
> 다음과 같이 접근을 할 수 있습니다.
>
> 하지만 위와같은 표현식을 사용한다면 <u>임시환경</u>속에서 변수를 만들고 지우고 해도 함수의 지역변수와 같이 <u>일회용 변수</u>를 선언할 수 있습니다.
>
> 즉 깔끔한 코드 및 가독성을 높이는데 도움이 됩니다.

![image](https://user-images.githubusercontent.com/78795820/195675051-4e237732-4c5f-4d5f-96e5-fea2c21e8068.png){: .center}
