---
title: TOAST UI - 이미지 다중 업로드 구현
header:
  teaser: https://github.com/teawon/teawon.github.io/assets/78795820/6f8b8ba2-2931-47e4-adfd-d91ecbfa4c4b
categories:
  - Next
tags:
  - TOAST UI
  - S3
toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-11-22
last_modified_at: 2023-11-22
---

## 1. 개요

TOAST UI는 마크다운과 위지윅(WYSIWYG) 에디터를 지원하는 편리한 도구입니다. 이를 통해 사용자는 쉽게 텍스트 정보를 마크다운 형식으로 변환하여 표현할 수 있습니다.

![image](https://github.com/teawon/teawon.github.io/assets/78795820/7d28286e-9485-4463-a20c-b3e0e3f3c24c){: width="500" height="400"}

> [공식 홈페이지](https://ui.toast.com/)

하지만 TOAST UI의 기본 이미지 업로드 기능에는 한계가 있습니다. 이미지가 base64로 인코딩되어 매우 긴 문자열로 변환되는데, 이로 인해 생성되는 방대한 문자열 양은 다른 내용을 작성하는 것을 어렵게 만듭니다.

![image](https://github.com/teawon/teawon.github.io/assets/78795820/0523c2dd-a82c-4f1b-8694-6c71a2ba4cb2){: width="500" height="400"}

> 사용자의 가독성을 떨어뜨림
>
> 불필요하게 긴 문자열을 서버로 보내게되므로 리소스가 낭비

따라서 이 글에서는 TOAST UI의 hooks와 AWS S3를 활용하여, 이미지 업로드 방식을 개선하는 방법을 소개하고자 합니다.

**[결과 미리보기]**

![upload_after](https://github.com/teawon/teawon.github.io/assets/78795820/6f8b8ba2-2931-47e4-adfd-d91ecbfa4c4b){: width="300" height="400"}

## 2. 이미지 업로드 방식

이미지 업로드 과정은 단순하면서도 효과적입니다.

먼저, 프론트엔드에서 별도의 이미지 업로드 API를 서버로 전송합니다. 서버는 이 이미지를 AWS S3에 저장하고, 저장된 이미지의 URL을 프론트엔드로 다시 전달합니다. 프론트엔드는 이 URL을 받아 화면에 이미지를 표시합니다.

![image](https://github.com/teawon/teawon.github.io/assets/78795820/b91b84e3-59c7-4b95-9be4-297cbd518ba0)

> 전체 흐름도

<br>

이를 위해, TOAST UI 에디터는 addImageBlobHook을 제공합니다.

이는 이미지가 업로드될 때 실행되는 훅(hook)을 사용자가 커스터마이즈할 수 있게 해주는 기능입니다. 이를 통해 사용자는 업로드된 이미지를 자유롭게 관리하고 조작할 수 있습니다.

| Name       | Type     | Description                                           |
| ---------- | -------- | ----------------------------------------------------- |
| fileOrBlob | FileBlob | 업로드된 이미지 blob                                  |
| callback   | callback | 이미지 업로드 후 호출되는 콜백 함수                   |
| source     | string   | 이벤트 소스 ('paste', 'drop', 'ui')를 나타내는 문자열 |

> [출처](https://nhn.github.io/tui.editor/1.4.10/addImageBlobHook)

<br>

이를 기반으로 개선한 코드는 다음과 같습니다

```javascript
import { Editor } from "@toast-ui/react-editor";

  const onUploadImage = async (
    blob: File,
    callback: (imageUrl: string, fileName: string) => void,
  ) => {
    uploadImageMutation(blob, {
      onSuccess: (data) => {
        callback(data.imageUrl, blob.name);
      },
    });
    return false;
  };


  return (
    <>
         { ... }
            <Editor
              ref={editorRef}
              hooks={{
                addImageBlobHook: onUploadImage,
              }}
              onChange={handleEditorChange}
              previewStyle="tab"
              height="100%"
              initialEditType="markdown"
              usageStatistics={false}
            />
    </>
  );
};

```

- `onUploadImage` 함수는 이미지가 업로드되면 실행됩
- 서버에 이미지를 전송하고, 반환된 S3 URL을 통해 이미지를 화면에 표시

<br>

```javascript
export const uploadImage = async (file: File) => {
  const endpoint = `boards/image`;

  const formData = new FormData();
  formData.append("file", file);

  const data = await csrFetch(endpoint, {
    method: "POST",
    body: formData,
  });

  return data;
};

export const useUploadImageMutation = () => {
  return useMutation(uploadImage);
};

const {
  mutate: uploadImageMutation,
  isLoading: isImageUploading,
  isError: isImageUploadError,
} = useUploadImageMutation();
```

- api 호출에 대한 정보

또한 이미지가 업로드 중일때 상태를 표현해주기 위해, mutate의 `isLoading` 정보를 활용해 메세지를 표현해주도록 합시다.

```javascript
  return (
    <>
          { ... }
            <Editor
              ref={editorRef}
              hooks={{
                addImageBlobHook: onUploadImage,
              }}
              onChange={handleEditorChange}
              previewStyle="tab"
              height="100%"
              initialEditType="markdown"
              usageStatistics={false}
            />

        <div className={styles.content__editor__message}>
          {isImageUploading && (
            <span className={styles.content__editor__message__loading}>
              이미지 업로드 중...
            </span>
          )}
        </div>


```

<br>

![first_image](https://github.com/teawon/teawon.github.io/assets/78795820/fdd5b46c-7f41-4ef7-a324-9b21f241165c)

> 결과: 이전에 비해 짧은 이미지 url정보가 반환된다

## 2. 다중 업로드 처리

앞서 소개한 이미지 업로드 방식은 효율적이지만, 한 가지 제한이 있습니다 이미지를 하나씩 사용자가 올려야한다는 부분입니다.

만약 사용자가 여러 파일을 동시에 업로드하고 싶어한다면 어떻게 해야 할까요?

이 문제를 해결하기 위해, TOAST UI 에디터를 외부 컴포넌트로 감싸고, 드롭다운 이벤트를 감지해서, 각 파일에 대해 순차적으로 업로드를 처리한다면 사용자는 여러 이미지를 한꺼번에 업로드할 수 있습니다.

![image](https://github.com/teawon/teawon.github.io/assets/78795820/ececeaad-66f9-4ff4-a9c8-64cb1cdca734)

### 2.1 드롭다운 이벤트

```javascript
const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {

  const files = Array.from(event.dataTransfer.files);
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      await new Promise<void>((resolve, reject) => {
       // 이미지 업로드 로직 처리
      });
    }
  }
};

<div onDrop={handleDrop}>
    <Editor
      ref={editorRef}
      hooks={{
        addImageBlobHook: onUploadImage,
      }}
      onChange={handleEditorChange}
      previewStyle="tab"
      height="100%"
      initialEditType="markdown"
      usageStatistics={false}
  />
</div>
```

이를 위해 Editor를 감싸는 `div`요소에 onDrop 이벤트를 감지하고 로직을 처리하는 함수를 생성합니다.

그러나, 실제 파일을 드래그래서 올려보면 div요소의 onDrop함수가 아니라 Editor내부의 `onUploadImage`메서드가 먼저 실행됩니다.

<u>이는 DOM의 이벤트 라이프사이클, 특히 이벤트 전파(Event Propagation) 메커니즘 때문입니다. </u>

<br>

DOM의 이벤트 전파는 크게 <u>캡처 단계(capture phase)</u>와 <u>버블 단계(bubble phase)</u>으로 나뉩니다. (target phase개념도 있긴 합니다)

캡처 단계에서는 이벤트가 상위 요소에서 하위 요소로 전달됩니다. 반면, 버블링 단계에서는 이벤트가 하위 요소에서 상위 요소로 전파됩니다.

Editor 내부의 onUploadImage 메서드가 먼저 실행되는 이유는, 이벤트가 버블링 단계에서 Editor로 전파되기 때문입니다. 이를 해결하기 위해 캡처링을 사용하면 이벤트가 상위 요소(여기서는 div)에서 먼저 감지되므로, 원하는 로직을 먼저 실행할 수 있습니다.

React에서는 onDrop를 캡처링 단계에서 실행하는 `onDropCapture`메서드를 제공하고 있으므로, 이를 통해 코드를 수정합니다

```javascript
const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {

    event.preventDefault(); // 기본 동작 X
    event.stopPropagation(); // 이벤트 전파 중치

  const files = Array.from(event.dataTransfer.files);
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      await new Promise<void>((resolve, reject) => {
       // 이미지 업로드 로직 처리
      });
    }
  }
};


<div onDropCapture={handleDrop}>
  <Editor
    ref={editorRef}
    hooks={{
      addImageBlobHook: onUploadImage,
    }}
    onChange={handleEditorChange}
    previewStyle="tab"
    height="100%"
    initialEditType="markdown"
    usageStatistics={false}
  />
</div>
```

또한 preventDefault 메서드를 사용하여 기본 드롭 동작을 방지하고, stopPropagation을 통해 불필요한 중첩 업로드가 발생하지 않도록 이벤트 전파를 중지합니다.

### 2.2 업데이트

```javascript
const updateEditorContent = (newContent: string) => {
  const currentContent = editorRef?.current?.getInstance().getMarkdown();

  editorRef?.current
    ?.getInstance()
    .setMarkdown(`${currentContent}\n${newContent}`);
};
```

editorRef를 사용하면 현재 에디터의 내용을 쉽게 가져오고, 필요한 부분을 추가하여 업데이트할 수 있습니다.

따라서 별도의 업데이트 함수를 생성 후 이를 활용해 받아온 이미지를 순차적으로 에디터에 추가하는 전체 코드는 아래와 같습니다

```javascript

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        await new Promise<void>((resolve, reject) => {
          uploadImageMutation(file, {
            onSuccess: (data) => {
              const markdownImageLink = `![${file.name}](${data.imageUrl})`;
              updateEditorContent(markdownImageLink);
              resolve();
            },
            onError: (error) => {
              console.log(error);
              updateEditorContent("이미지 업로드에 실패했습니다.");
              reject();
            },
          });
        });
      }
    }
  };

  { ... }

  <div onDropCapture={handleDrop}>
      <Editor
          ref={editorRef}
          onChange={handleEditorChange}
          previewStyle="tab"
          height="100%"
          initialEditType="markdown"
          usageStatistics={false}
      />
  </div>
```

> [github](https://github.com/techeer-sv/Mindspace/blob/develop/Mindspace_front_next/app/map/components/WriteModal/components/WriteEditor/index.tsx)

## 3. 결과

![upload_after](https://github.com/teawon/teawon.github.io/assets/78795820/6f8b8ba2-2931-47e4-adfd-d91ecbfa4c4b)

위 이미지는 구현한 다중 이미지 업로드 기능의 최종 결과를 보여줍니다. 사용자가 여러 이미지를 드래그 앤 드롭하여 쉽게 업로드할 수 있으며, 업로드된 이미지들은 자동으로 TOAST UI Editor에 순차적으로 추가됩니다.

만약 직접 만든 컴포넌트였다면, 내부 Editor에서 event요소에 접근 후 ` event.preventDefault();` 메서드를 호출하는 방향으로 처리했을 것 같은데 접근 방법을 찾지 못해 캡처 단계를 활용하여 이벤트를 처리했습니다.

그러나 시스템이 만약 복잡해진다면 이 처리방식이 다른 요소에 영향을 미칠 수 있는 가능성도 고려해야 한다고 생각합니다. 조금 찝찝하지만, 더 나은 해결책이 있는지 모색해보고 싶네요.

## 4. 트러블 슈팅

초기 이미지 업로드 시도에서, 서버로부터 다음과 같은 에러 메시지를 받았습니다:

```
{
    "message": "Unexpected token - in JSON at position 0",
    "error": "Bad Request",
    "statusCode": 400
}
```

**[1차 시도]**

이 에러는 FormData를 사용하여 이미지 데이터를 전송하면서 발생했습니다.

문제의 해결을 위해, 요청의 헤더에 "Content-Type": "multipart/form-data"를 추가하는 방식으로 수정했습니다.

```javascript
export const uploadImage = async (file: File) => {
  const endpoint = `boards/image`;

  const formData = new FormData();
  formData.append("file", file);

  const data = await csrFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data", // 해당 설정 추가
    },
    body: formData,
  });

  return data;
};
```

```
{
    "message": "Multipart: Boundary not found",
    "error": "Bad Request",
    "statusCode": 400
}
```

> > 그런데 이어서 에러 발생.. Boundary가 없다고 표현

Boundary란 multipart/form-data는 여러 부분으로 나누어진 데이터를 전송할 때 사용하는 인코딩 방식인데, 각 부분은 boundary라는 특정 문자열로 구분되기때문에 이때 해당 값이 꼭 필요하다고 합니다.

<br>

**[2차시도 - 해결]**

props에 따라 Header정보를 default로 넣지 않도록 코드를 추가하여 이를 해결했습니다.

즉 Fetch API를 사용할 때 FormData 객체가 있을 경우 기본 헤더를 덮어쓰지 않도록 코드를 수정했습니다. 이렇게 함으로써, Fetch API가 자동으로 'boundary' 값을 설정할 수 있도록 했습니다.

```javascript
export const baseFetch = async <T = any>(
  endpoint: string,
  headers: HeadersInit,
  options?: RequestInit,
  skipDefaultHeaders?: boolean
): Promise<T> => {
  const response = await fetch(`${BASEURL}${endpoint}`, {
    ...options,
    headers: new Headers({
      ...(skipDefaultHeaders ? {} : defaultHeaders),
      ...headers,
      ...options?.headers,
    }),
  });

  return handleResponse < T > response;
};

export const csrFetch = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const accessToken = Cookies.get("accessToken");
  const authHeader: Record<string, string> = {};

  if (accessToken) {
    authHeader.user_id = `${accessToken}`;
  }

  let headers: Record<string, any> = {
    ...authHeader,
    ...options?.headers,
  };

  const skipDefaultHeaders = options?.body instanceof FormData;

  return baseFetch < T > (endpoint, headers, options, skipDefaultHeaders);
};
```

[https://bobbyhadz.com/blog/error-multipart-boundary-not-found-in-express-js](https://bobbyhadz.com/blog/error-multipart-boundary-not-found-in-express-js)

[https://velog.io/@cxxxtxxyxx/Multipart-Boundary-not-found-Error](https://velog.io/@cxxxtxxyxx/Multipart-Boundary-not-found-Error)

## 5. 참고자료

[https://react.dev/learn/responding-to-events#capture-phase-events](https://react.dev/learn/responding-to-events#capture-phase-events)

[https://iamiet.tistory.com/entry/t](https://iamiet.tistory.com/entry/toast-ui-editor-v3-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%97%85%EB%A1%9C%EB%93%9C-%EC%B5%9C%EC%A0%81%ED%99%94%EC%BB%A4%EC%8A%A4%ED%84%B0%EB%A7%88%EC%9D%B4%EC%A7%95%ED%95%98%EA%B8%B0)

[https://leego.tistory.com/entry/Toast-UI-Editor-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%B2%A8%EB%B6%80%ED%95%98%EA%B8%B0](https://leego.tistory.com/entry/Toast-UI-Editor-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%B2%A8%EB%B6%80%ED%95%98%EA%B8%B0)

[https://nhn.github.io/tui.editor/latest/ToastUIEditorCore](https://nhn.github.io/tui.editor/latest/ToastUIEditorCore)

```;

```
