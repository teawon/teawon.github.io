---
title: "BufferedReader vs Scanner"

categories:
  - Java
tags:
toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-10-08
last_modified_at: 2022-10-08
---

## 개요

알고리즘 문제를 풀다보면 Scanner를 사용하지 않고 BufferedReader와 StringTokenizer를 사용해 입력데이터를 받아 처리하는 코드를 자주 볼 수 있었습니다.

같은 기능을 수행하는 것 같은데 왜 BufferReader를 사용했을까요? 어떤 차이가 있고 어떤 상황에서 사용하는지

모든 상황에서 BufferReader를 사용해도 괜찮은지 호기심이 생겨 찾아보게되었습니다.

명확한 비교를 위해 다음의 입력 데이터를 받는 문제가 있다는 가정을 전제로 잡고 시작하겠습니다.

```
10  (입력받을 횟수)
1 4 (각각의 데이터)
3 5
0 6
5 7
3 8
5 9
6 10
8 11
8 12
2 13
// 첫째줄에 N의 숫자가 주어지며 2~N+1번째 줄 까지 각 정보가 주어지는 문제.
```

## Scanner

```java
import java.util.*;

Scanner sc = new Scanner(System.in);

int N = sc.nextInt(); //입력 횟수

for(int i=0; i<N; i++){
            int leftArgs = sc.nextInt();
            int rightArgs = sc.nextInt();
        }
```

가장 일반적으로 처음 자바를 접하면 배우는 Scanner클래스 입니다.
특징은 아래와 같습니다.

- java.util에 속한다
- 입력받는 시점에 데이터 타입이 결정되므로 형변환이 필요없다.
- 데이터 입력 시 즉시 사용자에게 전송한다.
- BufferReader에 비해 속도가 느리다.
- 여러 스레드에서 하나의 Scanner인스턴스를 사용할 경우 동기화 문제가 발생할 수 있다.
- 별도의 예외처리를 하지 않아도 된다. (UnChecked Exception)

## BufferedReader && StringTokenizer

```java
import java.util.*;
import java.io.*;

BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
StringTokenizer st;

int N = Integer.parseInt(br.readLine()); // 입력횟수

for(int i=0; i<N; i++){
            st = new StringTokenizer(br.readLine(), " ");
            int leftArgs = Integer.parseInt(st.nextToken());
            int rightArgs =  Integer.parseInt(st.nextToken());

        }
```

- java.io에 속한다.
- 별도의 데이터 타입 파싱을 하지 않기 때문에 형변환이 필요하다. (한 줄씩 문자열을 읽어옴)
- 버퍼에 데이터를 담아 한번에 전송한다.
- Scanner에 비해 속도가 빠르다.
- 멀티스레드 환경에서는 동기화를 지원해주는 BufferReader를 사용해야한다.
- 별도의 예외처리가 필요하다. (Checked Exception)

![image](https://user-images.githubusercontent.com/78795820/194544875-fe9fc78c-9784-4790-8382-c5a401e46dcb.png){: .center}{: width="500" height="800"}

> > 화면과 같이 예외처리 필요

StringTokenizer의 경우 BufferedReader의 `readLine()`함수를 통해 읽어온 String문자열을 토큰으로 나눠주는 역할을 수행합니다.

위 문제와 같이 한 줄에 두 숫자를 식별하는 구분자가 공백이기때문에 구분기호를 " "으로 명시한 후
`nextToken()`함수를 통해 각 토큰을 읽어옵니다.

## 속도 차이의 이유

가장 큰 이유는 버퍼의 사용 여부의 차이입니다.

Scanner의 경우 1KB의 버퍼크기를 가져 입력 즉시 데이터가 전달되지만 BufferReader의 경우 8KB크기의 버퍼를 가지고 있기 때문에 버퍼가 가득차거나 개행문자가 나타날 때 한번에 데이터를 전달합니다.

또한 Scanner의 경우 읽는 과정에서 정규표현식 및 파싱과정을 거치기 때문에 더 오랜 시간이 걸립니다.

> Scanner : nextInt(), nextLong(), nextDouble()를 통해 파싱 필요 X

> BufferedReader : readLine()을 사용해 오직 String값을 읽음

![image](https://user-images.githubusercontent.com/78795820/194546620-bccaa468-834c-477f-8e3b-0a207721b611.png){: .center}{: width="500" height="800"}

(같은 코드를 두 방법으로 돌렸을 때 결과입니다. 상단의 BufferedReader를 사용한 방법의 속도가 훨씬 효과적입니다.)

## 요약 및 정리

1. Scanner를 사용하는 것 보다 BufferedReader를 사용해 값을 읽는 방법이 더 빠르다.
2. BufferedReader를 사용한다면 별도의 예외처리가 필요하다.

![image](https://user-images.githubusercontent.com/78795820/194548938-ce942a91-eb6a-474e-beea-0e44c6463a16.png){: .center}{: width="500" height="800"}

BufferedReader을 사용했을 때 단점이 따로있을까? 하고 찾아보았으나 복잡하다는 점과
읽으려는 내용이 매우 크다면 OutOfMemoryErrors가 발생할 수 있다고는 하지만 알고리즘 문제에서 이런경우는 많지 않을 것 같았습니다.

개인적으로 앞으로의 모든 문제는 Scanner보다 BufferedReader를 사용하지 않을까 싶네요

## 참고자료

[https://www.developer.com/...](https://www.developer.com/java/read-files-java-bufferedreader/)

[https://carpediem0212.tistory.com/11](https://carpediem0212.tistory.com/11)

[https://lasbe.tistory.com/48](https://lasbe.tistory.com/48)
