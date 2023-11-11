---
title: "내 코드가 그렇게 이상한가요?"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-11-12
last_modified_at: 2023-11-12
---

![image](https://github.com/teawon/teawon.github.io/assets/78795820/0a7af37d-7ba2-4b0c-a290-82b3f59f3382){: .center}

> 내 코드가 그렇게 이상한가요 독서 및 공부내용 정리

# 1. 잘못된 구조의 문제 깨닫기

```java
class Class001 {
	void method001();
  void method002();
}
```

- 기술 중심 명명 및 일련번호 명명을 피하자
  - 기술 중심 명명 : 기술을 기반으로 이름 붙이기
  - 일련번호 명명 : 메서드에 번호를 붙이는 것

# 2. 설계 첫 걸음

- 목적별로 변수를 따로 만들어 사용하는게 좋다.
  - 계산의 중간결과를 동일한 변수에 계속 대입하는 **재할당**은 버그와 가독성을 떨어뜨린다.
- 단순 나열보다는, 의미있는 것을 모아 메서드로 만들기
- 변수와, 변수를 조작하는 로직이 이곳저곳에 만들어져있다면?
  - 클래스를 통해 데이터를 인스턴스 변수로 두고, 이를 조작하는 메서드로 묶어두자.

# 3. 클래스 설계

## 3.1) 클래스의 구성요소

- **도메인에 대한 예외처리는 클래스에서하기**

  1.  디폴트 생성자를 통한 초기값 생성
  2.  **가드**를 사용하자
      - 생성자처럼 처리 범위를 벗어나는 조건을 메서드 가자 앞 부분에서 배치
  3.  ex) 우테코 프리코스의 자동차 이름 검증 - 입력 vs 도메인

  - 만약 다른클래스에서 검증을 한다면… 항상 안전하고 정상적인 인스턴스가 존재함을 보장할 수 없다.

2. 데이터와 데이터를 조작하는 로직은 하나의 클래스에서
   - 이를 응집도가 높다고 표현한다.
3. 불변 변수

   1. 변수의 값을 함부로 바꿔, “**예상치 못한 부수효과**”의 발생을 막아야한다.
   2. 인스턴스 변수를 불변으로 만들면, 생성자 이후 재할당이 불가능하다.

4. 변경을 할 때에는 새로운 인스턴스를 사용하자

   1. 이렇게 하면 불변을 유지하며 값을 변경할 수 있다.

   ```java
   Money add(int other){
   	int added = amount + other;
   	return new Money(added, currency);
   }
   ```

   ```java
   class Money {
     constructor(amount, currency) {
       this.amount = amount;
       this.currency = currency;
       Object.freeze(this); // 객체를 불변하게 만듭니다.
     }

     add(other) {
       if (this.currency !== other.currency) {
         throw new Error("Currency mismatch");
       }
       const newAmount = this.amount + other.amount;
       return new Money(newAmount, this.currency);
     }
   }
   const money1 = new Money(100, "USD");
   const money2 = new Money(200, "USD");
   const money3 = money1.add(money2); // 새로운 Money 객체를 반환합니다.
   console.log(money3.amount); // 300
   console.log(money3.currency); // USD
   ```

5. 매개변수도 재할당 할 수 없도록 처리하기

   ```java
   void something(final int temp){
   value = 100
   }

   // 매개변수는 바꿀일이 없으므로..
   // 단 JS에는 이런 문법 없음
   ```

6. 기본 자료형이 아니라, 클래스타입을 지정해 엉뚱한 값 전달을 막기

   ```java

   Money add(Money other){
     int added = amount + other;
     return new Money(added, currency);
   }

   // 실수로 티켓개수를 넣는다면? 같은 int형이라 오류가 나지않는다.
   // 보다 안정성을 추구하기 위해 독자적인 자료형을 사용하자.
   ```

7. 의미없는 메서드 ㄴㄴ

   - 금액을 곱하는 일이 있을까?.. 선의로 추측해서 사용할 값을 예상하지말라. 불필요함

   ⇒ 클래스 설계란, 인스턴스 변수가 잘못된 상태에 빠지지 않도록 하기 위한 구조를 만드는것!

   - 캡슐화와 응집도를 높이자.

디자인 패턴으로 아래와 같이 정리할 수 있다

1. 완전 생성자
   1. 잘못된 상태값으로부터 클래스를 보호하기 위한 디자인패턴
   2. 인스턴스 변수를 초기화하고, 가드를 사용해 잘못된값을 막고, 인스턴스 변수에 final붙이기
2. 값 객체
   1. 값을 클래스(자료형)으로 표현하는 방법
   2. int 대신 Money를 사용하는것과 같은 예시가 있다.

# 4. 불변 활용하기

## 4.1 재할당

- 앞에서도 언급했지만 변수에 값을 다시 할당하는 하는 것은 지양해야한다
- 이를 위해 **불변 변수**를 사용하자
- 불변 변수를 사용하면, 해당 변수는 어처피 변경할 수 없기 때문에 컴파일 단계에서 에러가 발생한다

  ```java
  void addPrice(final int productPrice) {
  final int increasedTotalPrice = totalPrice + productPrice;
  }
  ```

## 4.2 가변으로 인해 발생하는 부작용

- 부수효과 : 함수가 매개변수를 전달받고 값을 리턴하는 것 외에 외부 상태(인스턴스) 변수를 바꾸는 것
- 가변 인스턴스를 통해 재활용하는 로직이 있다면 의도치 않은 영향을 미칠 수 있다

  ```java
  AttackPower a = new AttackPower(20);
  AttackPower b = new AttackPower(20);

  Weapon c = new Weapon(a);
  Weapon bad = new Weapon(a);
  c.attacPower.value+=5.      // 이 코드는 의도치않게 bad인스턴스에게도 영향을 미친다.

  Weapon good. = new Weapon(b); // 따로 만들어라
  ```

- 인스턴스 변수를 불변으로 만들고, 새로운 인스턴스를 생성해서 반환하자

  ```java
  class AttackPower {

      void reinforce(int increment) {
        value += increment;
      }
      void disable() {
        value = MIN;
      }
  }

  AttackPower attackPower = new AttackPower(20);
  attackPower.reinforce(15);
  attackPower.disable();

  // 이 코드는 순서에 따라 다른 결과를 가져온다.
  // 만약 다른스레드에서 disabled()를 호출했다면 값자기 값이 변경되는 일이 발생하는 것
  ```

  ```java
  class AttackPower {
    static final int MIN = 0;
      final int value;

      AttackPower reinforce(final AttackPower increment) {
        return new AttackPower(this.value + increment.value);
      }
      AttackPower disable() {
        return new AttackPower(MIN);
      }
  }

  // 이제는 새로 인스턴스를 생성하고 반환하기 때문에 서로 영향을 주지 않는다.
  ```

## 4.3 불변 vs 가변

- 불변으로 만들었을 때 장점
  - 혼란을 줄일 수 있음 (변수의 의미 불변)
  - 결과의 예측이 쉬워지며 동작이 안정적
  - 유지보수 편리
  - 그런데, 새로 인스턴스를 매번 만드는게 좋을까..? 아닌 경우도 있다!
- 가변이 필요한 경우
  - 성능이 중요한 경우에는 가변이 용이하다
    - 대량의 데이터를 빠르게 처리하거나, 이미지, 리소스 제약이 큰 임베디드의 경우
  - 인스턴스를 매번 생성할 때 크기가 크면 그만큼 비효율적이기 때문
  - ex) 반복 카운터 스코프

# 5. 응집도

## 5.1 static 메서드 오용

    ```java
    class OrderManager {
      static int add (int moneyAmount1, int moneyAmount2) {
          return moneyAmount1 + moneyAmount2;
        }
    }

    moneyData1.amount = OrderManager.add(moneyData1.amount, moneyData2.amount);
    ```

- 데이터는 MoneyData에 있고 로직은 OrderManager에 있다. (응집도가 떨어짐)
- 클래스에서 데이터와 로직을 모아 응집도가 높은 구조를 만드는 것은 객체 지향 설계의 기본이다.
- 인스턴스 변수와 인스턴스 변수를 사용하는 로직은 클래스로
- 그럼 static은 언제사용??
  - 로그 출력, 포맷 변환, 팩토리 메서드 등 응집도와 관계없는 기능

## 5.2 초기화 로직 분산

    ```java
    GiftPoint standardMembershipPoint = new GiftPoint(3000); // 표준회원
    GiftPoint standardMembershipPoint = new GiftPoint(10000); // 프리미엄 회원
    ```

- 생성자를 public으로 만들면 관련된 로직이 분산된다
  - 만약 표준회원이 3000이 아니라면 다 바꿔야하기때문
  - 이를 어떻게 개선할 수 있을까?

### 5.2.1 팩토리 메서드

    ```java
    class GiftPoint {
      private static final int STANDARD_MEMBERSHIP_POINT = 3000;
      private static final int PREMIUM_MEMBERSHIP_POINT = 10000;
        ...
        static GiftPoint forStandardMembership() {
          return new new GiftPoint(STANDARD_MEMBERSHIP_POINT);
        }

        static GiftPoint forPremiumMembership() {
          return new new GiftPoint(PREMIUM_MEMBERSHIP_POINT);
        }
        ...
    }

    GiftPoint standardMembershipPoint = GiftPoint.forStandardMembership();
    ```

- private 생성자와 static 메서드를 통해 로직을 내부에서 관리하면 응집도가 높아진다
- 너무 생성 로직이 많아진다면 별도의 생성 전용 팩토리 클래스를 분리해보는 것도 좋음

## 5.3 범용 클래스(Util)

- 꼭 필요한 경우가 아니라면 범용 처리 클래스는 지향하자 (static 기반의 utilsClass)
- 횡단 관심사 : 다양한 상황에서 넓게 사용되는 기능의 경우 범용 처리 클래스를 두자
  - 로그, 오류, 디버깅, 예외처리, 캐시, 동기화, 분산처리 등등

## 5.4 결과 리턴 매개변수 X

    ```java
    class ActorManager {
      void shift(Location location, int shiftX, int shiftY) {
          location.x += shiftX;
          location.y += shiftY;
      }
    }
    // Location의 데이터를 조작하는데, 굳이 다른 클래스를 사용할 필요가 있을까..?
    ```

- 매개변수는 입력으로 전달하는 것이 일반적이다.
  - 출력이 섞이면 내용을 하나하나 확인해야하며 가독성과 통일성이 떨어짐
- 데이터와 데이터를 조작하는 논리는 하나의 클래스에 두자

  ```java
  class Location {
    final int x;
    final int y;

      Location(final int x, final int y) {
        this.x = x;
        this.y = y;
      }

      Location shift(int shiftX, int shiftY) {
        final int nextX = x + shiftX;
        final int nextY = y + shiftY;
          return new Location(nextX, nextY);
    }
  ```

## 5.5 많은 매개변수

    ```java
    int recoverMagicPoint(int currentMagicPoint, it originalMaxMagicPoit,
    List<Integer> maxMagicPointIncrements, int recoveryAmount) {
        // 마나를 회복하는 메서드
        // 현재 마나량, 원래 마나의 최대량, 장비에 의해 증가한 최대량, 회복량,

        return resultMP;
    }

    ```

- 너무 많은 매개변수를 받는다면 실수의 확률도 높아지고 좋지 않은 구조이다
- 매개변수가 많다? → 많은 기능을 처리하고 싶다는 의미
- 기본 자료형 집착
  - 기본 자료형을 남용하고 고집하는 것
- 의미 있는 단위는 모두 클래스로 만들면 관련있는 로직을 하나의 클래스로 응집할 수 있다.

```java
class MasicPoint {
 private int currentAmount;
 private int originalMaxAmount;
 private final List <Integer> maxIncrements;

 // 현재 마나량 return메서드
 // 현재 마나 최대량 return 메서드
 // 마나 화복 메서드
 // 마나 소비 메서드
}
```

## 5.6 메서드 체인

    ```java
    void equiparmor(int memberId, Armor newArmor) {
      if(party.members[memberId].equipments.canChange) {
          party.members[memberId].equipments.armor = newArmor;
        }
    }
    // 파티의 특정 사용자에 대해 장비를 변경시키는 메서드
    ```

- 메서드 체인 : .(점) 으로 여러 메서드를 연결해서 리턴값의 요소에 차례차례 접근하는 방법
- 데메테르의 법칙 : “사용하는 객체 내부를 알아서는 안된다”에 위배되기도한다
- equipments변수명이 바뀌면 다 뜯어 고쳐하는 문제 발생
- 버그가 발생했을 때 어디서 발생했는지도 찾아봐야 한다

  ```java
  class Equipments {
    private boolean canChange;
    private Equipment head;
    private Equipment armor;
    private Equipment arm;

      void equipArmor(final Equipment newArmor){
      is (canChange) {
            armor = newArmor
        }
      }

      void deactivateAll() {
        this.head = Equipment.EMPTY;
        this.armor= Equipment.EMPTY;
      }
  }
  ```

- 이런식으로 방어구 탈착 로직을 Equipments에 응집시키면 해당 클래스만 변경했을때 수정에 대응 가능하다

# 6. 조건분기

## 6.1 분기 중첩

````java
  float hitPointRate = member.hitPoint / member.maxHitPoint;

  HealthCondition currentHealthCondition;
  if (hitPointRate == 0) {
    currentHealthCondition = HealthCondition.dead;
  }
  else if (hitPointRate < 0.3) {
    currentHealthCondition = HealthCondition.danger;
  }
  else if (hitPointRate < 0.5) {
    currentHealthCondition = HealthCondition.caution;
  else {
    currentHealthCondition = HealthCondition.fine;
  }

  // 가독성이 떨어짐
  ``

  ```java
  float hitPointRate = member.hitPoint / member.maxHitPoint;

  if (hitPointRate == 0) return HealthCondition.dead;
  if (hitPointRate < 0.3) return HealthCondition.danger;
  if (hitPointRate < 0.5) return HealthCondition.caution;

  return HealthCondition.fine;
````

- 조기 리턴 방식을 사용하면 코드의 가독성이 늘어난다
- 조건 확인문을 추가할때에는 앞의 if문, 로직도 뒷 부분에 몰려있으므로 추가와 이해를 높이는데 도움이된다

## 6.2 전략 패턴

    ```java
    switch (magicType) {
      case fire:
        magicPoint = 10;
        break;
      case ligtening:
        magicPoint = 20;
        break;
    }

    switch (magicType) {
      case fire:
        attackPower = 10;
        break;
      case ligtening:
        attackPower = 20;
        break;
    }
    //타입에 따라 처리가 달라지는 부분을 switch문으로 처리하면..?
    ```

- Switch 조건문이 계속해서 중복된다
- 마법 타입이 많아지거나, 새로운 타입이 추가되었을 때 각 switch문에 대해 해당 요소가 누락될 위험성이 높다

```java
switch (magicType) {
  case fire:
    magicPoint = 10;
    attackPower = 10;
    break;
  case ligtening:
    magicPoint = 20;
    attackPower = 20;
    break;
}

// switch 조건문을 하나로 묶어보자 (단일 책임 선택의 원칙)
```

- 한 곳에 구현되어있기 때문에 누락 실수를 줄일 수 있다
- 그럼에도 변경 부분이 많아질 수록 해당 코드가 길어지므로 관심사를 분리할 필요가 있다

  - 여기서 더 개선해보자면, 인터페이스를 사용하자

    ```java
    final Map<MagicType, Magic> magics = new HashMap<>();

    void magicAttack(final MagicType magicType) {
      final Magic usingMagic = magics.get(magicType); // 특정 타입의 마법 인스턴스 가져옴

        showMagicName(usingMagic);
        // 마나 소비 메서드 (usingMasic);
        // 대미지 계산 메서드 (usingMasic); ....
    }

    void showMagicName(final Magic magic) {
      final String name = magic.name();
    }
    ```

- 전략패턴 : 인터페이스를 활용해 처리를 한꺼번에 전환하는 설계
- Map을 사용해 swtich처럼 경우에 따라 처리를 구분한다
- 만약 특정 마법 타입에 대해 메서드가 누락되었다면 컴파일 시점에 에러가 발생한다.
- 마지막으로 값을 객체화하면 실수를 줄이고 보다 안정성을 높일 수 있는 클래스가 완성된다

```java
interface Magic {
 String name();
 MagicPoint costMagicPorint();
 AttackPower attackPower();
 TechnicalPoint costTechnicalPoint();
}
```

⇒ 조건 분기의 경우 인터페이스를 활용해 설게 할 수 있는지 먼저 검토하는 것이 좋다

## 6.3 정책 패턴

- 골드 회원의 경우 A,B,C 조건을 충족해야하고, 실버 회원은 D,E,F… 이런 경우에는?

  ```java
  boolean isSilverCustomer (PurchaseHistory history) {
    if (10 < history. purchaseFrequencyPerMonth) {
    if (history. returnRate « 0.001) {
    return true;
  }

  boolean isGoldCustomer(){
    ...
  }
  // 비슷한 판정로직이 재활용된다면? -> 정책 패턴을 사용하자
  ```

- 정책 패턴 : 조건을 각 부품처럼 만들어 이를 조합해 사용하는 패턴

  ```java
  interface ExcellentCustomerRule {
    boolean ok(finalPurchaseHistory history);
  }

  class GoldCustomerPurchaseAmountRule implements ExcellentCustomerRule {
    public boolean ok (final PurchaseHistory history) {
        return 1000000 <= history.totalAmount;
      }
  }

  class GoldCustomerPolicy {
    private final ExcellentCustomerPolicy policy;

    GoldCustomerPolicy() {
        policy = new ExcellentCustomerPolicy();

        policy.add(new GoldCustomerPurchaseAmountRule());
        policy.add(new PurchaseFrequencyRule());
        policy.add(new ReturnRateRule());
      }

      boolean complyWithAll(final PurchaseHistory history) {
        return policy.complyWithAll(history);
      }
  }
  ```

- 각 회원 조건이 집약되어있고, 조건이 달라질 때 이 부분만 수정하면 된다.

## 6.4 자료형 확인

- 자료형 확인에 조건 분기를 사용하지 말기

```java
  interface HotelRates {
    Money fee();
  }

  class RegularRates implements HotelRates {
    public Money fee() {...}
  }

  class PremiumRates implements HotelRates {
  ...
  }

  // 여기서, 갑자기 성수기 때 일반 및 프리미엄 숙박 요금을 상향시키는 로직을 추가했다고 하자.

  if (hotelRates instanceof RegularRates) {
    busySeasonFee = hotelRates.fee().add(new Money(30000))
  }
  else if (hotelRates instanceof PremiumRates) {
  ...
  }
```

- 인터페이스를 사용했는데 조건 분기가 그대로 있다
- 리스코프 치환 원칙 : “기반 자료형을 하위자료형으로 변경해도, 코드는 문제없이 돌아가야 한다” 위반

  - 즉 hotelRates를 다른 하위 자료형으로 변경하면 로직이 깨짐

    ```java
    interface HotelRates {
      Money fee();
      Money busySeasonFee();
    }

    class RegularRates implements HotelRates {
      public Money fee() {
          return new Money(70000);
        }
        public Money busySeasonFee() {
          return fee().add(new Money(30000));
        }
    }
    ```

- 인터페이스를 변경하고 사용하면 굳이 자료형을 판정하지 않아도 된다
  - 생각해보면 클래스 내부에서 선언한 값을 상속받는 로직을 작성하면되는데 굳이 확안해서 바깥에서 연산하도록 분리한 처음 코드방식은 잘못되었다고 생각함

⇒ <span style="color:red">즉 if + switch 조건문을 보고, 인터페이스와 클래스를 사용할 수 있는지 생각해보는 연습을 가지자</span>

## 6.5 flag 매개변수

```java
  void damage(boolean damageFlag, int damageAmount) {
  if (damageFlag == true) {
    // 물리 대미지(히트포인트 기반 대미지)
    member.hitPoint -= damageAmount; if (0 < member.hitPoint) return;
    member.hitPoint = 0;
    member .addState(StateType. dead) ;
  ｝
    else {
    // 마법 대미지 (매직포인트 기반 대미지)
      member.magicPoint -= damageAmount;
      if (0 < member. magicPoint) return;

      member magicPoint = 0;
    }
  }
```

- 플래그 매개변수 : 메서드 전환 기능을 가진 boolean 타입의 변수
- 예측이 쉽지 않고, 이는 메서드 기능을 분리하라는 신호가 된다

  - 메서드를 쪼개자

    ```java
    void hitPointDamage(){ }
    void magicPointDamage() { }
    ```

- 그런데 요구 사항의 변경으로 두 데미지의 수행 작업이 전환 된다면?
- 전략 패턴을 사용하자. 새로운 종류의 데미지 추가에도 용이하고, 쉽게 대응이 가능하다.

  ```java
  interface Damage {
    void execute(final int damageAmount);
  }

  class HitPointDamage implements Damage {
    ...
  }

  class MagicPointDamage implements Damage {
    ...
  }

  enum DamageType {
    hitPoint,
    magicPoint,
  }

  void applyDamage(final DamageType damageType, final int damageAmount) {
    final Damage damage = damages.get(damageType);
      damage.execute(damageAmount);
  }
  ```

- JS라면?

  ```java
  // MagicPointDamage 클래스
  class MagicPointDamage {
    execute(damageAmount) {
      console.log("MagicPoint Damage: " + damageAmount);
      // 추가 로직
    }
  }

  // DamageType 열거형을 객체로 구현
  const DamageType = {
    hitPoint: new HitPointDamage(),
    magicPoint: new MagicPointDamage(),
  };

  // applyDamage 함수
  function applyDamage(damageType, damageAmount) {
    const damage = DamageType[damageType];
    damage.execute(damageAmount);
  }

  // 사용 예
  applyDamage("hitPoint", 10);
  applyDamage("magicPoint", 5);
  ```

# 7장 컬렉션

## 7.1 라이브러리

- 이미 존재하는 기능을 다시 만들지 말자

```java
boolean hasPrisonKey = false;

for (item each : items) {
	if (each.name.equals('감옥 열쇠')) {
    	hasPrisonKey = true;
        break;
    }
}

// 라이브러리를 사용하면?

boolean hasPrisonKey = items.stream().anyMatch(
	item -> item.name.equals('감옥 열쇠')
);
```

- 표준 라이브러리에 같은 기능을 하는 메서드가 있는지 확인하자.

## 7.2 조건 분기 중첩

- 반복 처리 내부의 조건 분기 중첩에 대한 처리

- 조기 컨티뉴, 조기 브레이크를 활용해 가독성을 높이자

```java
// 독 데미지 계산
for (Member member : members) {
	if (member.hitPoint == 0) continue;
    if (!member.containsState(StateType.poison)) continue;

    member.hitPoint -= 10;

    if (0 < member.hitPoint) continue;

    member.hitPoint = 0;
}

// 연계 공격
int totalDamage = 0;

for (Member member : members) {

if (!member.hasTeamAttackSucceeded()) break;

int damage = (int)(memeber.attack() * 1.1);

if(damage < 30) break;
    ...
}
```

## 7.3 응집도가 낮은 컬렉션 처리

```java
class FieldManager {
	void addMember(List<Member> members, Member newMember) {
    	if (members.size() == MAX_MEMBER_COUNT) ...
        members.add(newMember); // 중복
   	}
}

class SpecialEventManager {
	void addMember(List<Member> members, Member newMember) {
        members.add(newMember); // 중복
   	}
}

// 파티에 멤버를 추가하는 함수.
// 필드 맵에서도 이루어질 수 있고, 혹은 특정 이벤트에서도 추가하는 시점이 있을 수 있는데..?!
```

- 로직은 같은데, 코드가 중복된다. 컬렉션과 관련된 작업을 이곳저곳에서 처리해 응집도가 낮아졌다.
  - 일단 난 Party에 대한 클래스를 따로 분리하는게 좋겠다고 생각..
- 일급 컬렉션

  - 컬렉션에 관련된 로직을 캡슐화 하는 디자인 패턴
  - 기존 클래스가 인스턴스 변수, 메서드가 있었다면
  - 컬렉션 자료형의 인스턴스, 그리고 관련된 메서드로 구성된다
    - 조심해야하는 점
      - jpa entity라면 n+1 // lazy를 일으키는 경우도 있어서 조심해야한다
      - 많은 책들에서 추천하지만 깔끔하게 사용하기는 어렵다고 이야기해주셨다.

  ```java
  class Party {

  	private final List<Member> members;

      Party() {
      	members = new ArrayList<Member>();
      }

  // 이 메서드는 부수효과가 발생한다. members의 요소를 변경했기때문
     void add(final Member newMember) {
      	members.add(newMember)
      }

      Party add(final Member newMember) {
      	List<Member> adding = new ArrayList<>(members);
          adding.add(newMember);
          return new Party(adding);
      }
  }
  ```

- 만약, 파티 구성원에 속하는 member정보를 조회해야하는 경우가 생긴다면..?

```java
class Party {
	List<Mbmer> members() {
    	return members;
    }
}

members = party.members();
members.add(newMember);
members.clear() // -> 외부에서 마음대로 추가하거나 제거해버림
```

- 외부로 전달할 때 컬렉션의 요소를 변경하지 못하도록 unmodifiableList메서드를 사용하자.

```java
class Party {
	List<Member> members() {
    	return members.unmodifiableList();
    }
}
```

# 8. 결합도

## 8.1 결합도와 책무

```java
class DiscountManager {
	List<Product> discountProducts;
	int totalPrice;

  // 상품 추가 메서드
	boolean add(Product product, ProductDiscount productDiscount) {
    	int discountPrice = getDiscountPrice(product.price);
        ...
			 // 가격이 유효한지 체크
			 // 상품명 유효 체크
       // 가격 총합이 상한가를 넘는지 체크
    }

static int getDiscountPrice(int price) {
    	int discountPrice = price - 3000;
				 ...
    }
}

class SummerDiscountManager {
	DiscountManager discountManager;

    boolean add(Product product) {
    	if (product.canDiscount) {
        	tmp = discountManager.totalPrice + discountManager.getDiscountPrice(product.price);
            ...
        }
    }
    ...
}
```

- 문제점 1. getDiscountPrice() 메서드가 변경되면 의도치 않게 SummerDiscountManager에도 영향
  - 할인이라는 개념이 같다고 메서드를 하나만 만들고 재활용했기때문
- 문제점 2. 단일 책임 원칙을 위반
  - Product클래스에서 처리해야할 검증까지 한꺼번에 처리하고있다.
  - 일반 할인가격, 여름 할인 가격등 관련된 내용을 개별적으로 분리하자

```java
class RegularDiscountedPrice {
	private static final int MIN_AMOUNT = 0;
	private static final int DISCOUNT_AMOUNT = 4000;
	final int amount;

	RegularDiscountedPrice(final RegularPrice price) {
		int discountedAmount = price.amount - DISCOUNT_AMOUNT;
		if (discountedAmount < MIN AMOUNT) {
		discountedAmount = MIN_AMOUNT;
		amount = discountedAmount;
	}
}

class SummerDiscountedPrice {
	private static final int MIN_AMOUNT = 0;
	private static final int DISCOUNT_AMOUNT = 3000;
	final int amount;

	SummerDiscountedPrice(final RegularPrice price) {
		int discountedAmount = price.amount - DISCOUNT_AMOUNT;
		if (discountedAmount < MIN_AMOUNT) {
			discountedAmount = MIN_AMOUNT;
		}
		amount = discountedAmount;
	 }
}
```

- 클래스가 두 관심사에 따라 구분되어있고 서로 영향을 주지 않는다
  - 느슨한 결합
- 주의사항
  - 두 계산로직이 사실상 동일한 코드를 쓰고있어서 모듈화를 하는건 어떨까?
    - 안된다. 같은 로직일지라도 개념이 다르기 때문에 분리해야함
    - 만약 여름 할인 가격이 “5% 할인”으로 변경된다면? 개념이 다르다는 것을 인지하기

## 8.2 상속에 의한 결합사례

```java
class PhysicalAttack {
	 int attack() { return 10 }
   int doubleAttack() { return 20 }
}

class FighterPhysicalAttack extends PhysicalAttack {
	@Override
  int attack() { .. }

	@Override
  int doubleAttack() {
		return super.doubleAttac() + 10;
  }
}
```

- 상속은 최대한 권장하지 않는다. 의존성이 생기기 때문(슈퍼 클래스 의존)
  - 부모 클래스의 로직이 바뀌면 하위 클래스에 모두 영향을 미친다
  - 위 예제에서 doubleAttack의 로직이 `attack`()을 두 번 호출하는거라면… 의도치 않게 더 증가
  - 상속을 사용하면 부모클래스의 메서드를 확인해봐야하고 하나의 로직이 결국 분산된다
- 상속 보다는 컴포지션을 사용하자

```java
class FighterPhysicalAttack {
	private final PhysicalAttachk physicalAttack;

    int singleAttackDamage() {
    	return physicalAttack.singleAttackDamage() + 20;
    }
}
```

## 8.3 인스턴스 변수와 클래스 분리

```java
class Util {
	privated int reservationId
  privated ViewSettings viewSettings;
  privated MailMagazine mailMagazine;

	void cancelReservation() {...} //reservationId 이용
  void darkMode() {...} // viewSettings 이용
  void beginSendMail() {...} // mailMagazine 이용
}
```

- 위 코드는 메서드와 인스턴스의 의존관계가 일대일 이므로 아무런 관계가 없다
  - 별도의 클래스로 분리하면 강한 결합 문제가 사라짐

```java
class Reservation {...}

class ViewCustomizing {...}

class MailMagazineService {...}
```

## 8.4 public

- public을 사용하면 영향범위가 확대되고, 강한 결합 구조가 될 가능성이 높아진다
- 외부에 공개할 필요가 있는 클래스에 한해서만 public을 선언하기

## 8.5 많은 private 메서드

```java
class OrderService {
	private int calcDiscountPrice(int price) {...}

  private List<Product> getProductBrowsingHistory(int userId) {...}
}
```

- 가격할인과 최근 본 상품 리스트 확인은 주문과 전혀 다른 책임을 가진다
- private가 너무 많이 사용되었다면 너무 많은 책임을 가진건 아닐지 의심해보자
  - 할인가격과 상품 리스트에 대한 로직을 별도의 클래스로 나눠야함

## 8.6 높은 응집도를 오해해서 생기는 강한 결합

```java
class SellingPrice {
	int calcSellingCommission() {...} // 판매 수수료 계산

  int calcDeliveryCharge() {...} // 배송비 계산

  int calcShoppingPoint() {...} // 추가할 쇼핑 포인트 계산
}
```

- 개념상 판매 가격 클래스에는 맥락이 비슷한 로직을 넣었지만, 사실 역할이 전부 다른 메서드들이다.
- 특정 개념을 사용해서 다른 개념의 값을 계산하고 싶다면 매개변수(`sellingPrice`)로 값을 전달하자

```java
class SellingCommission {

	SellingCommision(final SellingPrice sellingPrice){
			...
	 }
}

class DeliveryCharge {
		DeliveryCharge(final SellingPrice sellingPrice){
			...
	 }
}

class ShoppingPoint {...}
```

## 8.7 Smart UI

- 화면 표시를 담당하는 로직과 관련없는 책무가 구현되어있는 클래스를 의미
  - 화면 표시 및 다른 책무가 섞여있기때문에 변경이 쉽지 않다
  - 다른 클래스로 분리하자
  - (Model자체에서 출력하지 않고 View로 분리한경험이 있는데 이 부분인듯)

## 8.8 거대 데이터 클래스

```java
public class Order {
  // 주문 ID
  // 주문자 ID
  // 주문 내역
  // 주문 일자
  // 주문 상태
   ...
}
```

- 거대 데이터 클래스는 전역 변수와 같은 성질을 띄게된다
  - 여러곳에서 사용되므로
- 적절하게 분리하자

## 8.9 트랜잭션 스크립트 패턴

```java
class OrderTransaction {
    processOrder(order) {
        if (!this.validateOrder(order)) {
            throw new Error('Invalid order');
        }

        this.calculateOrderTotal(order);
        this.updateInventory(order);
        this.sendConfirmationEmail(order);
    }

    validateOrder(order) {
        // 주문 유효성 검증 로직
        return true;
    }

    calculateOrderTotal(order) {
        // 주문 총액 계산 로직
    }

    updateInventory(order) {
        // 재고 업데이트 로직
    }

    sendConfirmationEmail(order) {
        // 주문 확인 이메일 보내기 로직
    }
}
```

- 데이터를 보유하고 있는 클래스와 처리하는 클래스를 나누어 구현할 때 자주 발생
- 응집도가 낮아지고 결합이 높아져 변경이 어려워진다

```java
class EverythingManager {
    // 사용자 관련 기능
    createUser() { /* ... */ }
    deleteUser() { /* ... */ }

    // 주문 관련 기능
    createOrder() { /* ... */ }
    cancelOrder() { /* ... */ }

    // 지불 관련 기능
    processPayment() { /* ... */ }
    refundPayment() { /* ... */ }

    // 보고서 관련 기능
    generateSalesReport() { /* ... */ }
    generateUserActivityReport() { /* ... */ }

    // ... 기타 등등, 모든 기능이 여기에!
}
```

- 하나의 클래스 내부에 너무 많은 로직을 담고 있고 복잡한.. 끔찍한 클래스
- 딱 봐도 문제가 있어보인다. 쪼개고 싶어짐

<span style="color:red">결국 책임별로 클래스를 분리하는게 중요하다. 클래스의 변수가 많아지거나 로직이 길어지면.. 의심하고 또 의심하기</span>
