---
title: "github 프로필에 최근 블로그 글 올리기"

categories:
  - Blog

toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-08-13
last_modified_at: 2022-08-13
---

## 개요

깃허브 프로필을 보다보면 "Latest Blog Post" 의 목록 하에 최근에 올라온 블로그 글을 소개하는 경우를 종종 보곤 했습니다.

사실 처음 블로그를 만들기 전부터 꼭 넣어보고 싶은 기능중 하나였고 바로 적용시키고자 하였습니다!

> 근데 Velog , tstory블로그와 다르게 깃블로그도 마찬가지로 적용시킬 수 있을까..?

기본 원리 자체는 어떤 블로그의 형태든 같았기 때문에

다른분들이 작성해주신 자료를 참고로 구현하는게 어렵지 않았습니다.

## 구현과정

### 1. 자신이 구현한 블로그의 RSS 찾기

#### RSS란?

"Real Simple Syndication"의 약자로 특정 사이트에 대한 제목, 혹은 기사에 대한 데이터 뽑아 사용자에게 쉽게 제공하기 위해 만들어진 데이터 형식 입니다.

여기서 저희가 필요한 내용은 특정 블로그에서 업로드한 게시글의 정보를 포괄하는 모든 데이터를 의미하겠죠?

각 블로그마다 RSS의 경로는 다 다르지만 minimal-mistakes테마를 사용하는 git-blog의 경우 하단 url을 통해 RSS에 접근할 수 있습니다.

`https://"자신의 git 주소"/feed`

이 사이트의 경우 https://teawon.github.io/feed 경로가 되겠죠.

### 2. python파일 만들기

이어서 해당 url에 대한 정보를 찾았다면 해당 RSS로부터 필요한 데이터를 파싱합니다.
![blog-1](https://user-images.githubusercontent.com/78795820/184503564-e4e545c2-bcea-4bb6-81ae-fd8948c92dbe.png){: .center}{: width="500" height="800"}

저 같은경우 게시글의 제목 , 날짜 정보를 올리고자 하였기 때문에 다음과 같이 코드를 작성했습니다.

```python
## update_blogPost.py
import feedparser

blog_url = "https://teawon.github.io/feed.xml"
rss_feed = feedparser.parse(blog_url)

MAX_NUM = 5

latest_posts = ""

for idx, entrie in enumerate(rss_feed['entries']):
  if idx > MAX_NUM:
     break;
  feed_date = entrie['published_parsed']
  latest_posts += f" - [{feed_date.tm_mon}/{feed_date.tm_mday} - {entrie['title']}]({entrie['link']})\n"

preREADME = """
## 기존의 README.md 내용
"""

resultREADME = f"{preREADME}{latest_posts}"

with open("README.md", "w", encoding='utf-8') as f :
  f.write(resultREADME)
```

- [4-15]

  여기서 **published_parsed**의 경우 Date정보를 처리하기 쉬운 객체의 형태로 받아온 값입니다.
  즉 .tm_mom & .tm_mday를 통해 특정 날짜 정보만을 가져옵니다

  결국 업데이트 할 README.md파일은 마크다운문법으로 표현하기때문에 각 for문에서는 다음과 같은 형태의 문자열을 만듭니다.

  `- [시간/분 - 블로그 제목](링크) `

- [17-24]

  특정 블로그글에 대한 정보를 업데이트하는 위의 로직과 더해 결과적으로 기존에 작성된 README.MD파일에 추가해야하므로 기존의 내용과 새롭게 추가된 리스트 문자열을 더해 README.MD파일에 업데이트합니다.

### 3. 해당 파일 추가하기

![blog-2](https://user-images.githubusercontent.com/78795820/184504262-1c3aad6f-a0f9-4be3-9635-148e2726afa7.png)
Add file을 눌러 깃 프로필이 작성된 Repository에 위에서 작성한 코드를 추가합니다.

### 4. git Action에 등록하기

#### gitAction이란?

github에서 제공하고있는 서비스입니다.

특히 특정 이벤트 & 일정 시간마다 반복적인 작업을 가능하도록 할 수 있게 도와줍니다.

예를 들어 배포용 브랜치에 새로운 내용이 merge되는 시점에 AWS의 배포서버 내용을 업데이트 한다거나 하는 식으로 사용할 수 있습니다.

여기서 저희는 "일정 시간"마다 위의 업데이트 코드를 실행시켜 최신 글 목록을 가져오는데 사용할 예정입니다!

![blog-3](https://user-images.githubusercontent.com/78795820/184504339-bf855b14-e18d-46d6-94c3-2a0c63ff2288.png)

```python
# This workflow will install Python dependencies, run tests and lint with a single version of Python
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-python-with-github-actions

name: Python application

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
   - cron: "0 0 */1 * *"
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up Python 3.9
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install feedparser
    - name: Run Update Python Script
      run: |
        python update_blogPost.py ## 실행시킬 .py이름
    - name: Update README.md file
      run: |
        git pull
        git add .
        git diff
        git config --local user.email "your gitEmail"
        git config --local user.name "you gitName"
        git commit -m "commit Message"
        git push
```

코드 자체는 다른 분들이 작성해주신 내용을 참고했습니다.
내용을 기입 후 "Start Commit"버튼을 누르면 동작합니다.

특히 11-12번째의 `cron: "0 0 */1 * *"` 부분은 코드의 실행 주기를 의미합니다.

각 필드마다 **분 , 시 , 일, 월, 요일** 등의 정보를 나타내며 위 코드상에서는 매일 (1일 단위 - "\*/1") 0시 00분에 코드 실행함을 의미합니다.

# 마치며

![blog-4](https://user-images.githubusercontent.com/78795820/184505224-95ce324a-3b55-476b-91a8-9ad6c542ee15.png)

완성입니다!
글 자체가 적어 두 개밖에 올라왔지 않지만

언젠가 if문에 걸려 모든 글이 다 올라오지 않을 때 까지 열심히 글을 올려야겠습니다😄
