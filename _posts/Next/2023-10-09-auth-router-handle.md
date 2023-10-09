---
title: "Next13, middleware 기반의 페이지 접근제한"

categories:
  - Next
tags:

toc: true
toc_sticky: true
toc_label: "목차"

date: 2023-10-10
last_modified_at: 2023-10-10
---

## 1. 개요

프로젝트를 진행하면 때때로 서비스에 따라 로그인 상태에 따라 페이지 접근을 제한하거나, 특정 페이지로 리다이렉트 해야하는 경우가 있습니다.

예를 들면, 현재 작업 중인 프로젝트에서는 다음과 같은 서비스 플로우를 가지고있습니다.

1. 로그인 상태일때, "/signin" , "signup" 페이지에 접속 시 메인 페이지로 강제 이동시킨다.

2. 로그인 상태가 아니라면, "/map" 페이지에 접속 시 로그인 페이지로 강제 이동시킨다.

이 글에서는 React에서 사용한 방식에서 Next로의 마이그레이션 과정에서 이러한 기능을 어떻게 구현했는지, 그리고 구현 과정에서 부딪힌 문제와 해결 방법에 대해 공유하려고 합니다.

## 2. React

React 프로젝트에서는 react-router를 사용해 사용자의 로그인 상태에 따른 페이지 접근 제어를 구현하였습니다.

```javascript
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />

        <Route element={<AuthRoute needLogin={true} />}>
          <Route path="/map" element={<NodeMap />} />
        </Route>

        <Route element={<AuthRoute needLogin={false} />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

const AuthRoute = ({ needLogin }: AuthRouteProps) => {
  const navigate = useNavigate();
  const isLoggedIn = useRecoilValue(isLoggedInAtom);

  useEffect(() => {
    const LoginRoute = () => {
      if (!isLoggedIn) {
        navigate("/signin");
        window.alert("로그인이 필요합니다");
      }
    };

    const NotLoginRoute = () => {
      if (isLoggedIn) {
        navigate("/");
      }
    };

    if (needLogin) {
      LoginRoute();
    } else {
      NotLoginRoute();
    }
  }, [needLogin, isLoggedIn, navigate]);

  return <Outlet />;
};
```

해당 로직은 useEffect 내에서 수행되며, 로그인 상태가 변할 때 마다 반응하여 적절한 리다이렉트를 수행하도록 처리했습니다.

## 3. Next

### 3.1 시행 착오

처음에는 Client-Side Rendering (CSR) 단계에서 로컬 스토리지의 값을 확인하여 라우팅을 처리하려고 시도했습니다.

별도의 클라이언트 컴포넌트를 만들고, 공통 layout을 감싸는 구조인거죠.

```javascript
// bad code

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Recoil>
          <ReactQuery>
            <AuthProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </AuthProvider>
          </ReactQuery>
        </Recoil>
      </body>
    </html>
  );
}
```

```javascript
// bad code

"use client";

const protectedRoutes = ["/map"];
const publicRoutes = ["/signin", "/signup"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.includes(pathname);
}

function isPublicRoute(pathname: string) {
  return publicRoutes.includes(pathname);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useRecoilValue(isLoggedInAtom);

  useEffect(() => {
    if (isLoggedIn && isPublicRoute(pathname)) {
      router.replace("/");
    } else if (!isLoggedIn && isProtectedRoute(pathname)) {
      router.replace("/signin");
    }
  }, [isLoggedIn, pathname]);

  return <>{children}</>;
}
```

<br>
그러나 이 방법으로 처리를 하게된다면, 페이지의 강제 리다이렉트처리가 페이지에 실제 접근 후 이동하게되니 화면상에도 실제 url이 변경되는게 사용자에게도 직접 노출되는 문제가 있었습니다.

![problem_1](https://github.com/teawon/teawon/assets/78795820/4d244b76-733e-46a1-843d-ce1091c4e96a)

> map페이지에 들어가기 전에 이동하는게 아니라, 이동 후 이동한다
>
> map페이지에서 호출하는 api(임시로 찍은 콘솔)도 전부 실행, 리소스 낭비가 발생

즉, **서버 사이드 렌더링 (SSR) 시점에 로그인 상태를 판별하고 이에 따라 적절한 페이지 렌더링 또는 리다이렉트 처리**를 해야 했습니다.

서버 사이드에서의 렌더링 단계에서 로그인 상태를 확인하면, 클라이언트에서 페이지를 받기 전에 이미 필요한 처리가 완료되기 때문에 사용자에게는 중간 페이지 전환이나 불필요한 API 호출이 눈에 띄지 않게 되겠죠.

### 3.2 middleware

여기서 저는 Next13의 middleware를 사용했습니다.

middleware란 요청이 완료되기 전에 코드를 실행할 수 있게 해주는 기능으로 들어오는 요청을 기반으로 응답을 수정하거나, 리다이렉트, 요청 또는 응답 헤더 수정, 직접 응답을 제공할 수 있습니다.

[공식 문서](https://nextjs.org/docs/app/building-your-application/routing/middleware)

1. config

   ```javascript
   export const config = {
     matcher: [
       "/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)",
     ],
   };
   ```

   middleware는 기본적으로 프로젝트의 모든 라우트에 적용됩니다. 따라서 필요한 경로만 특정하여 적용하기 위해 정규식을 사용했습니다.

   위의 설정은 api, \_next/static, \_next/image, favicon.ico, fonts, images를 포함하지 않는 모든 경로에 미들웨어가 적용되도록 지정하였습니다.

2. url 설정 처리

   ```javascript
   const url = request.nextUrl.clone();
   url.pathname = "/signin";
   return NextResponse.redirect(url);

   // return NextResponse.redirect("/signin"); 이전 코드
   ```

Next.js 13 버전부터는 상대 URL을 직접 전달하는 것이 허용되지 않습니다.

따라서 요청의 URL을 복제한 후 해당 URL의 경로를 변경하여 절대 URL을 생성하였습니다.

[공식 문서](https://nextjs.org/docs/messages/middleware-relative-urls)

3. localstore대신 쿠키 활용

   ```javascript
   const token = getTokenFromCookies(request);

   function getTokenFromCookies(request: NextRequest) {
     const cookiesHeader = request.headers.get("cookie");
     if (!cookiesHeader) return null;

     const cookiesArray: [string, string][] = cookiesHeader
       .split("; ")
       .map((cookie) => {
         const [key, value] = cookie.split("=");
         return [key, value];
       });

     const cookies = new Map(cookiesArray);
     return cookies.get("accessToken");
   }
   ```

   middleware 환경에서는 클라이언트 사이드의 localstorage에 직접 접근할 수 없습니다. 따라서 사용자 인증 정보를 저장하는 방식을 localstorage에서 쿠키로 변경하였습니다.

### 3.3 수정 및 결과

```javascript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts|images).*)"],
};

const protectedRoutes = ["/map"]; // 로그인이 필요한 페이지 목록
const publicRoutes = ["/signin", "/signup"]; // 로그인이 되면 접근할 수 없는 페이지 목록

export function middleware(request: NextRequest) {
  const token = getTokenFromCookies(request);
  const currentPath = request.nextUrl.pathname;

  if (!token && protectedRoutes.includes(currentPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if (token && publicRoutes.includes(currentPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function getTokenFromCookies(request: NextRequest) {
  const cookiesHeader = request.headers.get("cookie");
  if (!cookiesHeader) return null;

  const cookiesArray: [string, string][] = cookiesHeader
    .split("; ")
    .map((cookie) => {
      const [key, value] = cookie.split("=");
      return [key, value];
    });

  const cookies = new Map(cookiesArray);
  return cookies.get("accessToken");
}
```

![solve](https://github.com/teawon/teawon/assets/78795820/4b7ffc51-612a-489c-bd0a-26cd5f21bf2c)

> 결과적으로, 기존에 비해 불필요한 리소스의 낭비를 크게 줄이면서, 서버 사이드에서 페이지 라우팅 처리를 효과적으로 수행

## 4. 기타(Cookie)

그런데, 토큰 정보를 LocalStorage가 아닌 cookie로 저장해도 괜찮을까요?

사실 습관처럼 항상 토큰정보는 LocalStorage에 저장하고 있었기 때문에 별도의 문제점은 없는지 궁금했습니다.

아래는 두 저장소의 특징을 찾아 표로 나타낸 것 입니다.

| 항목          | LocalStorage                      | Cookie                                              |
| ------------- | --------------------------------- | --------------------------------------------------- |
| 사용의 간편성 | 간단한 key-value 저장 방식        | 모든 HTTP 요청에 자동으로 첨부                      |
| 데이터 수명   | 직접 지우지 않는 한 지속          | 만료일 설정 가능                                    |
| 저장 공간     | 대략 5~10MB                       | 약 4KB (토큰이 너무 크면 못 담는다.)                |
| XSS 공격      | 취약. JS로 접근 가능              | 안전. JS로 접근불가                                 |
| CSRF 공격     | 안전. JS코드에 의해 Header에 담김 | 취약. 하지만 적절한 CSRF 토큰 및 정책으로 방지 가능 |

여기서, 실제 사용중인 토큰의 길이를 계산해보니 전체 1,343자로, ASCII기준 약 1.3KB를 차지하고 있었기때문에 사용하는데 큰 문제는 없다고 판단했습니다.

(유저 뿐 아니라 회사및 기타 복합적인 정보를 많이 담고 있는 서비스였기때문에, 현 프로젝트에서는 더 적은 길이를 가지게되겠네요)

또한 보안적인 이슈에서 쿠키를 사용했을때 XSS공격에서 안정적이고 사용하는데 문제가 없다고 생각해 괜찮은 수정방안이라고 결정 지었습니다.

> 추가로, AccessToken은 메모리에 저장하고 RefreshToken은 쿠키에 저장하는 방식을 사용하면 JWT 토큰의 크기 제한 문제와 공격자에 의한 데이터 탈취 위험을 최소화 할 수 있다고 한다.

> 왜냐하면, CSRF에 의해 RefreshToken이 사용되어도 실제로 필요한 AccessToken정보는 알 수 없기 때문

> 새로고침 등의 휘발성에 대해서는 쿠키의 RefreshToken을 사용해 다시 AccessToken을 발급받으면 된다

## 5. 참고자료

[https://nextjs.org/docs/app/building-your-application/routing/middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

[https://medium.com/@zachshallbetter/protecting-routes-in-next-js-with-app-router-53c3409c0655](https://medium.com/@zachshallbetter/protecting-routes-in-next-js-with-app-router-53c3409c0655)

[https://hshine1226.medium.com/localstorage-vs-cookies-jwt-%ED%86%A0%ED%81%B0%EC%9D%84-%EC%95%88%EC%A0%84%ED%95%98%EA%B2%8C-%EC%A0%80%EC%9E%A5%ED%95%98%EA%B8%B0-%EC%9C%84%ED%95%B4-%EC%95%8C%EC%95%84%EC%95%BC%ED%95%A0-%EB%AA%A8%EB%93%A0%EA%B2%83-4fb7fb41327c](https://hshine1226.medium.com/localstorage-vs-cookies-jwt-%ED%86%A0%ED%81%B0%EC%9D%84-%EC%95%88%EC%A0%84%ED%95%98%EA%B2%8C-%EC%A0%80%EC%9E%A5%ED%95%98%EA%B8%B0-%EC%9C%84%ED%95%B4-%EC%95%8C%EC%95%84%EC%95%BC%ED%95%A0-%EB%AA%A8%EB%93%A0%EA%B2%83-4fb7fb41327c)

[https://jjunn93.com/entry/JWT-%EC%A0%80%EC%9E%A5-localStorage-vs-Cookie](https://jjunn93.com/entry/JWT-%EC%A0%80%EC%9E%A5-localStorage-vs-Cookie)
