---
title: "내 코드가 그렇게 이상한가요?"

categories:
  - Book

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-11-12
last_modified_at: 2023-11-22
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

```java
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
```

```java
float hitPointRate = member.hitPoint / member.maxHitPoint;

if (hitPointRate == 0) return HealthCondition.dead;
if (hitPointRate < 0.3) return HealthCondition.danger;
if (hitPointRate < 0.5) return HealthCondition.caution;

return HealthCondition.fine;
```

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

# 9. 설계의 건전성을 해치는 여러 악마

## 9.1 데드 코드

- 데드코드 : 절대로 실해오디지 않는 조건 내부의 코드
  - 가독성을 낮추며 언젠가 버그가 될 가능성이 있음
  - IDE의 정적 분석 도구를 활용하면 데드 코드를 쉽게 확인할 수 있다

## 9.2 YAGNI원칙

- “지금 필요없는 기능을 만들지 말라”는 원칙
  - 예측해서 코드를 만들어도 결국 시간낭비

## 9.3 매직넘버

- 설명이 없는 숫자를 의미
- 의미를 알아보기 힘들고, 수정을 할 때 하나하나 다 고쳐야한다
- 상수를 활용하자!

```java
class ReadingPoint {
	private static final int MIN = 0;
  private static final int TRIAL_READING_POINT = 60

  ...
}
```

## 9.4 String 집착

```java
String title = "타이틀,255,250,240,62"
// 문자열과 표시색, 최대 문자수를 저장하고 있는 변수
```

- 의미를 알아보기 힘들고 각각의 다른 값은 분리해서 변수에 저장하는 것이 좋다

## 9.5 전역변수

- 여러 로직에서 전역변수를 참조하고 값을 변경한다면, 변경 시점과 위치 파악이 어렵디
- 동기화가 필요한 경우에도 문제가 발생한다
  - 하나의 변수에 대해 참조가 일어나면 락을 걸어야하는데 대기시간이 길어진다
  - 문제가 생기면 데드락 상태에 빠질 수 있다
  - 거대 데이터 클래스도 사실 전역변수와 같은맥락의 문제점을 가짐
- 영향 범위는 가능한 좁게 설계해야한다
- 최대한 한정된 클래스에서 접근할 수 있도록 설계하자

## 9.6 null문제

```java
class Member {
  ...
	// 모든 방어구 해제
	void takeOffAllEquipments() {
	head = null
  body = null
  arm  = null
	}

	// 만약 total+= body.defence + head.defence ... 계산을 하면?? NULL Exception발생
}
```

- 위 코드와 같이 null값에 의해 에러가 발생한다면 어떻게 해결해야할까?
  - 모든 곳에서 null체크를 하면 가독성과 실수는 곧 버그로 이어진다.
  - 애초에 null을 리턴하거나 전달하지 않도록 설계해야한다!!
- “무언가를 갖고 있지 않은 상태, 설정되지 않은 상태” 자체로 의미가 있는 값

```java
static final Equipment EMPTY = new Equipment("장비없음 ,0,0,0);

// 이제 장비하지 않는 상태값을 별도의 인스턴스 변수로 표현했으므로 NULL체크가 필요없다
```

- null 안전 자료형을 사용하자
  - null값이 들어가면 에러가 발생하도록 코틀린의 ‘val’ 표현이 있다

## 9.7 예외처리

```java
try{
   reservations.add(product);
}
catch (Exception e) {
} // 에러가 발생해도 아무것도 하지 않음..
```

- 예외처리를 적절히 하지 않으면 원인분석을 어렵게 만든다
- 예외가 발생했다면 적어도 로그로 기록하고, 상위 클래스로 오류를 통지하자

```java
catch (IllegalArgumentException e){
	//오류 보고, 로그기록
	reportError(e);
	// 상위 레이어에 오류 통지
	requestNotifiyError("예약할 수 없는 상품입니다")
}
```

## 9.8 메타 프로그래밍

- 메타 프로그래밍 : 구조를 제어하는 프로그램을 의미
- 자바의 리플렉션 API가 하나의 사례이다
  - 임의의 클래스에 접근할 수 있는 그냉으로, 멤버이름, 타입, 메서드 등을 가져올 수 있다
  - 자바스크립트에서는 없음

### 9.8.1 어떤 위험성이 있는가?

```java
class Level {
	private static final int MIN = 1;
  private static final int MAX = 99;
	final int value;

    private Level(final int value) {...}
    static level initialize() {...}
    Level increase() {...}

}
Level level = Level.initialize();
Field field = Level.class.getDeclaredField('value');
field.setInt(999);
```

- 외부에서 접근하지 못하게 만든 변수에도 접근할 수 있다

```java
static Object generateInstance(String packageName, String className) throw Exception {
	Class klass = Class.forName(packageName + '.' + className);
    Constructor constructor = klass.getDeclaredConstructor();
}

// 패키지의 이름과 클래스 이름을 문자열 props로 넘기면 인스턴스를 생성하는 메서드 예제
Employee user = (Employee)generateInstance("customer", "User");
```

- 클래스 이름과 메서드 이름을 한번에 변경해주는 기능이 있을때, 단순 문자열이라 변경되지 않는다
- 개발 도구의 지원을 받기 어려움

### 9.8.2 그럼 언제?

- 시스템 분석 용도 및 작은 용도 내에서 사용하는게 좋다.
  - 플러그인 시스템이나 애플리케이션에서 동적으로 클래스를 로드
  - 디버깅 및 테스트 (private메서드에 접근할 때 등등..)

## 9.9 기술 중심 패키징

```java
ProjectRoot
│
├── UseCases
│   ├── 재고_유스케이스.java
│   ├── 주문_유스케이스.java
│   └── 지불_유스케이스.java
│
├── Entities
│   ├── 입고_엔티티.java
│   ├── 출고_엔티티.java
│   ├── 장바구니_엔티티.java
│   ├── 주문_엔티티.java
│   ├── 발주_엔티티.java
│   └── 청구_엔티티.java
│
└── ValueObjects
    ├── 안전_재고량.java
    ├── 재고_회전_기간.java
    ├── 발주_금액.java
    ├── 주문처.java
    ├── 청구_금액.java
    ├── 할인_포인트.java
    └── 신용카드_번호.java
// 디자인 패턴에 따라 분류한 패키지 구조
```

- 어떤 것이 어떤 종류와 관련되었는지 구분하기가 힘들다
  - 발주 엔티티는 사실 주문과 관련있어보이지만 사실 재고와 관련이 있었다.
  - 즉 원래 용도와 다른 로직이 섞이며 복잡하고 혼동의 가능성이 생김
  - 프레임워크의 표준구조가 기술중심 패키징이므로, 이런 구성이 쉽게 발생할 수 있다
- ⇒ 비즈니스 클래스는 비즈니스 개념을 기준으로 폴더를 구분하는 것 이 좋다

```java
ProjectRoot
│
├── 재고
│   ├── 재고_유스케이스.java
│   ├── 발주_엔티티.java
│   ├── 입고_엔티티.java
│   └── 출고_엔티티.java
│
├── 안전_재고량
│   └── 안전_재고량.java
│
├── 재고_회전_기간
│   ├── 재고_회전_기간.java
│   └── 발주_금액.java
│
├── 주문
│   ├── 주문_유스케이스.java
│   ├── 장바구니_엔티티.java
│   └── 주문_엔티티.java
│   └── 주문처.java
│
└── 결제
    ├── 지불_유스케이스.java
    ├── 청구_엔티티.java
    ├── 청구_금액.java
    ├── 할인_포인트.java
    └── 신용카드_번호.java
```

## 9.10 샘플 코드

- 샘플 코드는 사용 예시를 제안하기 위함이지, 좋은 구조가 아니기 쉽다
- 복붙하지말자!

## 9.11 은탄환

- 자신이 알고 있는 편리한 기술을 그냥 활용해버린다면 오히려 심각해질 수 있다
  - 새로운 디자인 패턴을 적용해 보고 싶어서 이유없이 적용한다?
  - 저자는 GoF디자인 패턴의 일부를 무리하게 적용했다가 오히려 확장성이 떨어진 적이 있음
- 어떤 방법이 효과적이고 비용이 더 들지는 않는지 평가하고 판단하는 자세가 중요하다.

# 10. 이름

## 10.1 좋지 않은 이름

- 관심사에 맞는 이름을 붙이고 포괄적인 이름은 혼동을 가져오거나 불분명한 클래스가 생길 수 있다
  - 예약상품, 주문상품, 재고상품, 발송상품.. 각각의 개념이 있다면 비즈니스 목적에 맞게 쪼개자

## 10.2 이름 설계하기

- 목적 중심의 이름 설계 - 비즈니스 목적에 맞게 이름을 붙이자
  - 구체적이고 좁은 의미의 특화된 이름
    - 이름과 관련된 로직 배제가 쉬워진다
    - 클래스가 작아지고 생산성이 높아진다
  - 목적을 기반으로
    - 단순 존재를 나타내는 의미는 혼란의 여지가 있다
    - “청구 금액, 소비세액, 연체 보증료” 등 구체적이고 명확한 목표중심의 이름을 설계하자
  - 관심사 분석하기
    - 비즈니스 목적에 특화된 이름을 만들려면, 어떤 비즈니스를 하는지 모두 파악해야 한다
  - 소리내어 표현하기
    - 고무 오리 디버깅 : 설명 하다보면 스스로 원인을 깨닫고 해결하
    - 한번 읽어보는 것 만으로 일종의 분석행위가 될 수 있음
  - 약관에 표현된 내용을 참고하기
    - 약관에는 비즈니스 측면의 명확한 이름이 사용된다
  - 다름 이름으로 대체할 수 없는지 검토하기
    - 호텔 숙박 시스템의 “고객”은 충분할까?
    - “투숙객” 과 “결제자”로 이름을 변경하고 유의어를 확인해보자
  - 결합이 느슨하고 응집도가 높은 구조인지 검토하기
    - 목적과 관련된 이름을 사용했는데 연관된 클래스 개수가 많다면 의심해보자

## 10.3 설계 주의사항

- 이름에 관심갖기
- 사양 변경 시, 의미 범위 변경 경계하기
  - 이름 설계도 중간중간에 검토해보아야 한다
  - 고객 클래스 내부에 갑자기 법인고객 정보가 섞이면? → 분리!
- 대화에 자주 등장하지만 코드에는 없는 이름 주의하기
- 수식어를 붙여서 구분하는 경우가 있다면 클래스로
  - `int corredtedMaxHitPoint = originalMaxHitPoint + accessory;`
    - 캐릭터의 최대 채력인지, 장비 착용에 의해 높아진 최대체력인지 의미를 수식어로 분리
    - 둘 다 `int` 형이므로 의미차이를 이름으로만 해야한다
  - 값 객체를 통해 아예 두 개념을 클래스로 분리하자

## 10.4 의미를 알 수 없는 클래스

- 기술중심명명은 좋지 않다
  - 단 하드웨어에 가까운 미들웨어 레이어에서는 어쩔 수 없이 사용하는 경우도 있음
- 로직구조를 나타내는 이름
  ```java
  class Magic {
  	boolean isMemberHpMoreThanZeroAndIsMemberCanActAndIsMemberMpMoreThanMagicCostMp(Member member) {...}
    // 생존하고있고, 행동가능하고, 마나가 있으면 마법을 쏜다
  }
  ```
  - 의도와 목적을 알기 쉽게 `canEnchant` 등의 의도를 나타내는 이름을 붙이자
- 놀람 최소화 원칙을 따르자
  ```java
  int count = order.itemCount();
  // 개수만 반환할 것 같은 이름이지만..실상은 아래에서 point도 추가하고있었다
  class Order {
  	...
      int itemCount() {
      	int count = items.count();
          if (10 <= 10) {
          	giftpoint = giftPoint.add(new GiftPoint(100));
          }
          return count;
      }
  }
  ```
  - 예상치 못한 놀라움을 최소화 하도록 설계해야한다

## 10.5 구조에 악 영향을 미치는 이름

### 10.5.1 데이터 클래스?

```java
class ProductInfo {
	int id;
  String name;
  ...
}
```

- Info ~ Data와 같은 클래스는 “데이터만 가지니까 로직을 구현하면 안되는구나” 이미지를 주기 쉽다
- 최대한 Info, Data와 같은 이름은 지양하자
- 단, DTO는 예외
  - 계산과 변경을 동반하지 않고 오직 전송을 위한 디자인 패턴이기때문

## 10.5.2 Manager

- Manager클래스를 잘못 만들면 자칫 클래스가 커지기 쉽다
- 의미가 너무 넓고 단순하게 관련이 있으니 해당 클래스에 구현하게 되는 경우가 많아진다
- Controller도 마찬가지
  - MVC에서 Controller는 전달받은 요청 매개변수를 다른 클래스에 전달하는 책무만 가져야한다. 여기서 계산이나 판단 분기로직이 구현된다면 단일 책임 원칙을 위반하는 것

### 10.5.2 상황에 따라 의미가 달라질 수 있는 이름

- Account는 계좌, 로그인 권한등 의미가 달라질 수 있다

```java
class Car {
 id, 배송지, 배송경로, 판매 가격, 판매옵션 ...
}

// 배송 context : 자동차가 화물로 배송되는 context
// 판매 context : 딜러에 의해 고객에게 판매되는 context
```

- 컨텍스트의 차이를 생각하지 않으면 개념이 섞이고 로직이 서로 강한 결합을 맺는다
- 각 컨텍스트는 서로 다른 패키지로 구현하자

```java
// 배송 패키지
class Car {
 id, 발송지, 배송지, 배송경로 , class 배송지 선택
}

// 판매 패키지
class Car {
 id, 판매가격, 판매옵션 , class 주문
}
```

## 10.5.4 일련번호 명명

- 클래스와 메서드에 번호를 붙여 만들지 말자
- 대규모 개발에 사용되는 방식이며 조직 차원의 논의가 필요

## 10.6 이름만 봤을 때 위치가 부자연스러운 클래스

### 10.6.1 동사 + 목적어 형태의 메서드 주의

```java
class Enemy {
	...
    void escape() {...}

    // Magic Point 소비
    void consmeMagicPoint(int costMagicPoint) {...}

	// 주인공 파티에 아이템 추가
    boolean addItemToParty(list<Item> items) {...}
}
```

- Enemy 클래스의 관심사는 “적”
- `addItemToParty` 메서드는 파티에 대한 관심사를 가지고 있다
- 즉 동사 + 목적어 형태의 이름은 관계없는 책무를 가진 메서드일 가능성이 높다
- 가능하다면 메서드는 동사 하나로 구성되게 해야 좋다
  - 목적어 자체가 클래스를 의미하게

```java
class PartyItems {
    PartyItems add(final Item newItem) {...}
}
```

### 10.6.3 부적절한 위치에 있는 boolean

```java
class Common {
  // 멤버가 혼란상태이면 trueReturn
	static boolean isMemberInConfusion(Member member) {...}
}
```

- 멤서의 상태는 멤버와 관련된 관심사이다
- boolean 자료형의 메서드는 “클래스 is 상태” 형태로 읽혔을때 자연스러운지 의식하자

```java
class Member {
    boolean isInConfusion() {...}
}
```

## 10.7 이름 축약

- 의도를 알 수 없는 축약은 주의하기
- 기본적으로 이름은 축약하지 말기
  - 타이핑이 귀찮더라도 요즘에는 자동완성기능도 있음
  - 단, 통용되는 개념의 경우 축약 허용
- for 반복문의 i,j와 같이 의미가 햇갈릴 여지가 적고 범위가 좁다면 축약 괜찮다
  - 결국 팀이나 회사차원에서 결정해 두는 것이 좋다

## 11. 주석

- 로직을 변경할때에는 주석도 함께 변경하기
  - 실제 로직과의 불일치가 발생하면 혼란이 생긴다
- 로직의 동작을 그대로 설명하는 주석은 낡기 쉽다
  - 로직이 변경되면 매번 업데이트해야하기때문
- 애초에 가독성이 높은 메서드명과 코드를 작성하면 주석이 불필요하다
- 가급적 변경에 대한 주의점을 주석으로 달기
  - 유지보수와 사양변경에 도움이 된다
- 또는 문서 주석을 활용하자

```java
ex)
/**
 * a와 b를 더한 결과를 반환
 * @param {number} a 첫번째 숫자
 * @param {number} b 두번째 숫자
 * @returns {number} a와 b를 더한 결과
 */
 function plus(a, b) {
  return a + b;
}
```

# 12. 메서드 : 좋은 클래스에는 좋은 메서드가 있다

## 12.1 현재 클래스의 인스턴스 변수 사용하기

- 메서드는 반드시 현재 클래스의 인스턴스 변수를 사용해야한다
- 다른 클래스의 인스턴스 변수를 변경하는 메서드는 응집도가 낮은 구조가 될 수 있음

## 12.2 불변을 활용해서 예상할 수 있는 메서드 만들기

- 가변 인스턴스 변수를 변경하면 의도치 않은 부수효과를 발생시킬 수 있다
- 불변을 활용하자

## 12.3 묻지 말고 명령하라

- getter, setter는 다른 클래스를 확인하고 조작하는 메서드 구조가 되기 쉽다
- 호출되는 메서드쪽에서 복잡한 작업을 하는게 좋다

## 12.4 커맨드/쿼리 분리

- 상태변경과 추출을 동시에 하고 있다면 분리하자

```java
int gainAndGetPoint() {
	point += 10;
  return point;
}
```

- 커맨드 쿼리 패턴

| 메서드 종류 | 설명                           |
| ----------- | ------------------------------ |
| 커맨드      | 상태를 변경                    |
| 쿼리        | 상태를 리턴                    |
| 모디파이어  | 커맨드와 쿼리를 동시에 하는 것 |

- 모다파이어는 일부 예외를 제외하고는 최대한 피하는 것 이 좋다

```java
void gainPoint() {
	point += 10;
}

int getPoint() {
	return point;
}
```

## 12.5 매개변수

- 불변 매개변수 사용하기
- 플래그 매개변수 쓰지 말기
  - 플래그 개념은 전략 패턴을 쓰거나, 다른 구조로 설계를 개선하자
- null 전달하지 않기
  - null자체에 의미를 부여하지 말자
  - Equipment.EMPY 등을 사용하기
- 출력 매개변수는 사용하지 말자
  - 매개변수는 입력값으로 사용하기
  ```java
  // 이런식으로 이동 대상 인스턴스인 location이 출력 매개변수로 사용되는 것은 지양
  class ActorManager {
  	void shift(Location location, int shiftX, int shiftY) {
      	location.x += shiftX;
          location.y += shiftY;
  	}
  }
  ```
- 매개변수는 최대한 적게 사용하기

## 12.6 리턴값

- 자료형을 사용해 의도를 명확히 나타내자

  ```java
  class Price {
      int add(final Price other) {
      	return amount + other.amount;
      }
  }

  int price = productPrice.add(otherPrice);
  int discountedPrice = calcDiscountedPrice(price);
  ```

  - 어떤 값이 어떤 금액을 나타내는지 알기 힘들다
  - 매개변수를 잘못 전달하는 등의 실수가 발생할 수 있다

- null을 리턴하지 않아야 좋다
- 오류는 바로 리턴값으로 처리하지 말고, 바로 예외를 발생시키자
  ```java
  class Location {
      Location shift(final int shiftX, final int shiftY) {
      	...
          return new Location(-1, -1); // error case
      }
  }
  ```
  - 오류가 있다면 Locaion(-1,-1)이 리턴된다는 사실을 알고있어야한다..
  - 잘못된 상태에는 어떠한 관용도 배풀지 말고, 바로 예외를 발생시키자

# 13장 모델링

## 13.1 설계와 모델링

```java
상품 모델
- ID , 상품명, 원가, 판매 가격, 제조년월, 제조 업체,
- 보증 기간, 대응 통신 규격, 구성 부품, 재료..

```

- 모델은 특정 목적 달성을 위해 최소한으로 필요 요소를 갖춘 것
- 만약 하나의 모델에서 너무 많은 정보를 관리하게된다면 문제가 발생한다

  - 생년월일 : 개인 프로필과 관련된 요소
  - 법인 등록번호 : 법인 정보
  - 이메일 주소와 비밀번호 : 로그인 인증과 관련된 요소
  - 즉, 위 상품모델은 “여러 목적”에 무리하게 사용되고있다.

- 사용자를 표현하는 수단은 목적에 따라 이름과 형태가 다름
  - 목적중심으로 이름을 잘 설계하면, 적절한 모델을 설계할 수 있다
- 특정 목적에 특화된 설계가, 변경하기 쉬운 고품질 구조를 갖게 해준다
- 모델을 다시 확인하는 방법

## 13.2 가능성을 좌우하는 모델링

![image](https://github.com/teawon/teawon.github.io/assets/78795820/e07b799b-7d7a-45f2-9d6c-3998f934031e){: width="500" height="400"}

- 만약 여기서, 돼지가 추가된다면?

![image](https://github.com/teawon/teawon.github.io/assets/78795820/f20c0f69-2d0b-49ef-b6c3-c7f4c287e284){: width="500" height="400"}

- 이와 같은 추상화는, 각 모델의 역할을 이해하기 쉽지 않다는 문제점이 있다.
- 이를 “영양 섭취 수단”이라고 해석한다면 확장성이 훨씬 커진다

![image](https://github.com/teawon/teawon.github.io/assets/78795820/b51526f6-2c89-42f2-ad07-29072bf76b00){: width="500" height="400"}

- 목적 달성 수단으로 모델을 해석했을 때, 확장성이 커진다
- 도메인 주소 설계에서는 이를 깊은 모델이라고 표현한다

# 14. 리팩터링

## 14.1 리팩터링의 흐름

- 중첩을 제거하여 보기 좋게 만들기
  - 조기 리턴
- 의미 단위로 로직을 분리하기

  - 조건 확인과 값 대입 로직을 각각 분리해서 정리하기

  ```java
  PurchasePointPayment(Customer customer, Comic comic){
  	if(계정 유효성 검증)
  	if(만화 구매 가능성 검증)
  	if(포인트 확인)

  	구매 로직()
  }
  ```

- 조건을 읽게 쉽게 하기
  - 논리 부정 연산자 “!”는 한번 더 생각해야하므로 가독성이 떨어진다
  ```java
  if(!custom.isEnabled()) { ~ } // ! 연산자는 가독성 하락
  if(custom.isDisabled()) { ~ }
  ```
- 목적을 나타내는 메서드로 바꾸기
  ```java
  isShortOfPoint(){
   return possessionPoint.amount < comic.currentPurchasePoint.amout
  }
  // 로직을 "isShortOfPoint" 메서드로 묶고 사용하기
  ```

## 14.2 단위 테스트

- 리팩터링과 단위 테스트는 항상 세트
- 이상적인 리팩터링 흐름
  - 이상적 구조의 클래스 기본형태 설계
  - 테스트 코드 작성
  - 테스트 실패
  - 테스트 성공을 위한 기반 틀 잡기
  - 리팩터링 대상 코드를 하나씩 호출하며, 이상적인 구조로 하나씩 수정

## 14.3 불확실한 사양

- 만약 사양을 잘 모른다면, 리팩터링을 위한 테스트 코드를 짜기 힘들 때도 있다
- 문서화 테스트

  - 분석하고 싶은 메서드의 테스트를 통해 동작을 확인하는 방법
  - 특정 메서드의 기능을 모를 때, 매개변수값을 넣어가며 결과값을 확인
  - “아 이건 대략적으로 세율 10%를 포함하는 금액 계산을 실행하는 메서드구나”

| 매개변수 a | 매개변수 b | 리턴 값 |
| ---------- | ---------- | ------- |
| 1000       | false      | 1000    |
| 2000       | false      | 200     |

- 스크래치 리펙터링
  - 별도의 브랜치를 파고 코드를 먼저 리팩토링한다
  - 이 과정에서 코드의 가독성이 올라가고 분석 결과를 기반으로 목표 정의

## 14.4 IDE

- 이름 변경, 메서드 추출등 여러 기능을 잘 활용하기

## 14.5 주의사항

- 기능 추가와 리팩터링은 동시에 하지 않기
  - 분석이 힘들어짐, commit에 내용이 섞인다
- 작은 단계로 실시하기
  - 이름변경과 로직변경이 있다면 따로따로
- 불필요한 사양은 제거 고려
  - 이익에 거의 기여하지않는 코드는 굳이 시간을 넣어도 개발 생산성 향상에 도움 적다

# 15. 설계의 의의와 대처방법

## 15.1 설계와 개발 생산성

- 설계의 저하 요소
  - 응집도가 낮은 구조 → 수정 누락
  - 잘못된 값 → 버그 가능성 높음
  - 코드 이해 어려움 → 실수 와 버그 발생
- 가독성이 낮은 구조
  - 이해 오래걸림
  - 관련된 로직 찾는데 시간걸림
  - 출처 추적 힘들다
- 즉, 복잡하고 이해하기 어려운 로직이 있다면 더 복잡한 로직이 만들어진다
- 레거시 코드는 발전과 고품질설계의 경험을 막는다
  - “사수가 이렇게 했으니까 이게 맞겠지~~” → X

## 15.2 코드의 좋고 나쁨 지표

- 실행되는 코드의 줄 수
  - 메서드 : 10줄 이내
  - 클래스 : 100줄 이내
- 순환 복잡도
  - 조건분기, 반복처리, 중첩이 많아지면 복잡도가 커짐
  - 10이하가 가장 이상적, 30이상부터 구조적 리스크 존재
- 응집도
  - 인스턴스 변수와, 그 인스턴스 변수를 사용하는 로직이 같은 클래스에 구현되어있어야 높다
- 결합도
  - 어떤 클래스가 호출하는 다른 클래스의 수
  - 너무 많다면, 해당 클래스의 역할이 너무 많을 가능성이 있다
- 청크
  - 클래스에서 다루는 개념이 4~5개일때, 한 눈에 이해하기 적합하다
  - 더 크다면, 작은 클래스로 분할하는게 좋다

# 16장 설계를 방해하는 개발프로세스와의 싸움

## 16.1 커뮤니케이션

- 콘웨이 법칙 : 시스템의 구조는 그것을 설계하는 조직의 구조를 닮아간다

  - 시스템 구조를 제대로 잡기 어려워짐

- 심리적 안정성 : "어떤 발언을 했을 때, 부끄럽거나 거절 당하지 않을 것이라는 확신을 느끼는 심리상태"
  - 커뮤니케이션에 문제가 있다면, 심리적 안정성 향상에 힘쓰기

## 16.2 설계

- 나쁜 코드를 작성하는것이 오히려 더 오래 걸린다

  - TDD를 사용하는 편이 더 빠르다는 결론의 클린아키텍처 내용이 있었다

- 한 번에 하는게 아니라, 사이클 돌리기

- 클래스가 많아지면 비용이 발생하는 것은 맞지만, 대부분 무시해도 되는 경량

  - 인스턴스 생성 비용이 상대적으로 낮아지고 있기 때문

- 다수결 보다는, 역량이 뛰어난 팀원을 중심으로 규칙 만들기

## 16.3 구현

- 앵커링 효과 : 처음 제시한 정보를 기준으로, 이후 판단을 왜곡하는 경향
- 기존의 코드를 맹신하지 않도록 주의하자

- 코딩 규칙, 컨벤션 적절히 활용하기

## 16.4 리뷰

- 리뷰는 코딩 스타일, 기능 요건 위주가 아니라, "설계적 타당성"을 중심으로 리뷰하기

- 기술적 올바름을 두고 공격적인 리뷰 X

## 16.5 팀

- 영향력을 갖는 규모의 동료를 모으자
  - 협력해야 영향력이 생기고, 바꿀 수 있다.
  - 설계 스터디를 진행해도 좋다
  - 실제 코드 개선 경험이 책만 보는 것보다 중요!
