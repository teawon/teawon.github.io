---
title: 코틀린이란?

categories:
  - Kotlin
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-10-12
last_modified_at: 2022-10-12
---

## 개요

최근 안드로이드 분야에 관심이 생겨 공부를 시작하게 되었습니다.

흔히 안드로이드를 개발할 때 사용하는 언어로 Java , Kotlin이 있고 최근에는 Kotlin을 많이 사용한다고 알고있었는데요

공부를 시작하기 전 정확히 어떤 장점이 있어서 Kotlin를 사용하고 그 특징은 무엇인지 알아보고자 하였습니다.

## Kotlin이란?

Kotlin이란 2011년 JetBrains에서 공개한 JVM기반의 오픈 소스 프로그래밍 언어 입니다.

특히 Java와의 상호 운용이 100% 지원된다는 특징을 가지고 있습니다.

2017년에는 구글이 안드로이드의 공식 언어로 Kotiln을 추가하였으며 점차 사용비율은 증가하고 있는 추세를 보이고 있습니다.

실질적으로 자바를 대체할 수 있어 단순히 안드로이드외에 서버, DB, 웹까지 전반적으로 사용할 수 있다고 합니다.

![image](https://user-images.githubusercontent.com/78795820/195390198-9f623755-bcc9-4f2c-9f91-049384b9cfdb.png){: height="500"}{: .center}

> pypl 인기 프로그래밍 언어랭킹 12위 (2022 4월 기준)

## Kotlin의 특징

1. Null 타입의 지원

   ```java
   //Java
   String str = null //일반적으로 프로그래밍언어에서는 null값 대입을 허용한다.
   if(num != null) {
     System.out.println(str.length)
   }
   ```

   ```kotlin
   //Kotlin
   var str : String? = null //코틀린에서는 null값을 사용하려면 다음과 같이 "?" 키워드로 타입을 지정해야 한다
   println(str?.length) //null값이 들어가 있다면 바로 null을 반환

   ```

2. 정적 타입 지정 언어

   - 코틀린은 자바와 다르게 변수의 타입을 지정하지 않고 <u>var , val</u>타입을 사용하더라도 타입추론이 지원됩니다.

   - 코드가 그만큼 간결해지고 컴파일러에 의해 정확성이 검증되 오류의 가능성이 적어집니다.

   - 실행 시점에 사용되는 메소드의 탐색 시간이 없어 더 빠릅니다.

3. 함수형 프로그래밍 지원

   - 함수를 다른 함수의 매개변수로 사용할 수 있습니다.

   - 인터페이스 내부에 메소드 구현이 가능합니다.

   - 함수를 객체처럼 사용해 메모리 오버헤드를 개선할 수 있습니다.

   - 불변 데이터 구조를 사용하고 순수 함수를 적용함으로써 다중 스레드를 사용해도 안정성이 높습니다.

4. 간결하다

   - 자바와 다르게 세미콜론이 필요하지 않으며 결과적으로 코드의 길이가 자바에 간결화 됩니다.

   이는 가독성을 증진 시킬 수 있습니다.

## 참고 자료

[https://pearlluck.tistory.com/701](https://pearlluck.tistory.com/701)

[https://velog.io/@kjy991/Kotlin..](https://velog.io/@kjy991/Kotlin-%EC%9D%98-%EC%9E%A5%EC%A0%90-%EB%B0%8F-%EB%8B%A8%EC%A0%90)
