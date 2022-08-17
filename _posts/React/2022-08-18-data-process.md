---
title: "Data 파싱? 어디서 해요?"

categories:
  - React
tags:

toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-08-18
last_modified_at: 2022-08-18
---

## 개요

<span style="font-size:130%; text-align:center;">
"혹시 이 api의 Response형태를 바꿔주실 수 있을까요?"
</span>{: .center}

코드를 작성하며 때때로 머릿속을 지나쳤던 생각 입니다. 아니 솔직히 말하면 꽤나 자주요

생각보다 복잡한 구조의 객체 데이터를 가져와 사용하고 있었기 때문에 초보자 입장에서 각 리스트를 순회하며 값을 파싱하는 것은 생각보다 어려웠고 비효율적이라고 생각했습니다.

백엔드에서는 몇 줄 바꾸면 쉽게 수정할 수 있지만 프론트엔드에서 값을 받아다가 원하는 대로 사용하자니 코드도 길어지고 불필요한 반복문을 사용하는 건 아닐까 생각했기 때문입니다.

```typescript
.then(function (response) {
          let initialData = [];
          //초기 설정값
          response.data.data.forEach((imgList) => {
            //바깥 반복문의 리스트 및 이름 정의
            let imgListBlock = {
              whitelistFaceName: imgList.whitelistFaceName,
              whitelistFaceId: imgList.whitelistFaceId,
              whitelistFaceImages: [],
            };

            imgList.whitelistFaceImages.forEach((image) => {
              //내부 이미지 리스트의 각 내용 정의
              let imgData = {
                url: image.url,
                id: image.id,
              };

              imgListBlock.whitelistFaceImages =
                imgListBlock.whitelistFaceImages.concat(imgData);
            });
            initialData = initialData.concat(imgListBlock);
          });
          setTotalList(initialData); //가져온 데이터의 가공한 최종 리스트를 totalList에 저장

// 당시 구현했던 코드
// 내부 리스트까지 각각 값을 순회하여 원하는 변수명에 맞춰서 데이터를 파싱하였다.

```

## 결론 및 이유

프론트에서 내부의 반복문도 줄일 수 있고, 백엔드의 Response값을 그대로 받아다가 사용한다면 구현 난이도 면에서도 훨씬 좋지 않을까요?

그러나 결과적으로는 데이터 파싱은 프론트에서 하는 게 맞다고 이해했습니다.

그 이유는 다음과 같습니다.

1.  **프론트엔드에서만 사용하는 변수가 존재**
    ![데이터1](https://user-images.githubusercontent.com/78795820/185152827-af711ef6-a6af-44cd-a55d-27af52ded40d.png){: .center}

    위 사진은 당시에 프론트엔드에서 다루던 데이터 포맷입니다.

    기존의 DB에서 가져온 사진과 사용자가 새로 입력한 데이터를 구분 짓기 위해 new라는 변수를 두고 사용하고 있었지만

    백엔드에서 api를 넘겨줄 때는 이런 값들을 추가로 넣어 보내주는건 의미상 전혀 불필요한 데이터들이기 때문에 해당 값까지 보내주는건 맥락상 맞지 않았습니다.

2.  **변경에 대한 유연한 대처**

    사실 프로젝트를 진행하며 스키마 설계를 뒤엎고, 에러 처리를 위한 데이터의 구조를 2~3차례 변경하는 일이 있었습니다. 😥

    여기서 직접 체감하며 느꼈는데 기존에 이미 리스트 형태로 데이터를 가공해서 값을 가져오고 있었기 때문에 수정된 사항을 반영하기 위해서는
    단순히 리스트의 데이터 형태를 바꾸거나 유동적으로 커스터마이징하여 쉽게 대처할 수 있었습니다.

3.  **서버의 도메인 단위의 코드 관리**

    해당 내용은 [jjunyjjuny님께서 작성하신 글](https://velog.io/@jjunyjjuny/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EA%B0%80%EA%B3%B5%ED%95%98%EB%9D%BC#%EA%B7%B8%EB%9E%98%EC%84%9C-%EC%9D%B4-%EB%AC%B8%EC%A0%9C%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%95%B4%EA%B2%B0%ED%95%98%EB%82%98)을 보고 정리해보았습니다.

    단순 팀프로젝트가 아니라 프로젝트 단위가 커지게 된다면 서버에서는 특정 도메인에 맞춘 설계가 아닌 각 도메인에서 모두 사용할 수 있는 포괄적이고 유동적인 구조로 Response값을 설계해야합니다. 오히려 각각의 도메인에서 값을 받아 필요에 맞는 데이터의 처리를 해야 하는 거죠.

## 마치며

코드를 다시 보니 잘 짜인 내용은 아닌 것 같아 부끄럽습니다. 향후 시간이 된다면 **Class Instance** 을 이용한 응집성 있는 코드 구현에 신경 써보고 싶네요.

![데이터2](https://user-images.githubusercontent.com/78795820/185152842-9166b393-2af1-4694-9c1c-7bcfeae3b5a0.png){: width="600" height="400"}{: .center}
<span style="font-size:60%; color:gray; text-align:center;">
당시의 소통 중 일부
</span>{: .center}

당시 코드를 작성할 때도 느꼈지만 결국 프론트엔드와 백엔드 간의 소통이 가장 중요한 것 같습니다.

Swagger를 통해 api의 응답값을 어떻게 받을 지 전부 명시는 되어있었지만 구현하는데 필요한 부분이나 설계상 발견하지 못했던 문제점을 찾아 이야기를 나누고 보다 효율적인 방안을 찾아 나가는 과정이 생각보다 많았습니다.

결과적으로 수정한 부분도 많았던 건 사실이지만 그만큼 배워가는 부분도 많았고 덕분에 이런 고민 또한 해보게 되었던 것 같네요 ㅎㅎ

## 참고 자료

[https://velog.io/@jjunyjjuny/...](https://velog.io/@jjunyjjuny/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EA%B0%80%EA%B3%B5%ED%95%98%EB%9D%BC#%EA%B7%B8%EB%9E%98%EC%84%9C-%EC%9D%B4-%EB%AC%B8%EC%A0%9C%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%95%B4%EA%B2%B0%ED%95%98%EB%82%98)
