---
title: 토이프로젝트(최저가 쇼핑몰 리스트) - 1

categories:
  - Kotlin
tags:
  - Ktor

toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-11-13 +0900
last_modified_at: 2022-11-13 +0900
---

## 결과물 미리보기

![미리보기](https://user-images.githubusercontent.com/78795820/202793347-7250c905-24ea-4169-891a-833b1dfb91a2.gif){: width="300" height="400"}{: .center}

## 개요

해당 프로젝트는 GDSC에서 11/1부터 약 2주간 진행했던 개인 프로젝트 내용입니다.

xml이 아닌 <u>Jetpack Compose</u>를 사용하였고 api통신은 <u>ktor</u>을 사용하였습니다.

많이 미숙하지만 스스로 공부한 내용을 정리하고 복습하고자 글을 작성하려합니다.

## 디렉토리 구조

디렉토리의 경우 MVVM패턴을 사용하려고 했습니다. (완벽한 MVVM패턴은 아니라고합니다..!)

```
├── MainActivity.kt
├── data
│   └── product
│     ├── detail
│     │   ├── DetailDto.kt
│     │   └── MallDtoInfo.kt
│     └── list
│          ├── GetSearchList.kt
│          └── ProductListDto.kt
├── di
│   └── DataModule.kt
├── domain
│   ├── product
│       ├── ProductRepository.kt
│       ├── ProductRepositoryImpl.kt
├── scenarios
│   ├── detail
│   │   ├── DetailActivity.kt
│   │   ├── DetailScreen.kt
│   │   └── DetailViewModel.kt
│   └── home
│   ├── HomeActivity.kt
│   ├── HomeScreen.kt
│   ├── HomeViewModel.kt
├── ui
   ├── component
    └── CommonComponent.kt
```

- data : Spring에서는 Entitiy의 같은 느낌으로 사용하는 데이터의 타입을 표현합니다.

- domain : api를 통해 실제 data에 해당하는 객체값을 가져오는 함수가 정의되어있습니다.

- scenarios : 화면에 표현할 내용을 시나리오단위로 분리합니다.

  - Activity

  - Screen : 화면에 보여줄 요소를 정의합니다. 데이터는 ViewModel을 통해 가져옵니다.

  - ViewModel : 데이터 처리와 관련된 로직을 처리합니다. 특히 api를 통해 객체값을 가져올 때 domain의 정의된 함수를 불러옵니다.

이와 같이 화면에 보여지는 부분과 데이터의 처리부분을 분리하면

<span style="color:red">각 역할을 명확하게 분리하고 코드의 종속성을 줄일 수 있으며 확장성을 쉽게 고려할 수 있다</span>는 장점이 있습니다.

### 1. 검색창

현재 페이지는 상품을 검색하는 페이지 HomeView와 검색된 상품을 클릭했을 때 나타나는 DetailView로 분리되어있습니다.

그 중 상품 검색 페이지 부분의 코드입니다.

[Activity]

```kotlin
// HomeActivity
class HomeActivity : ComponentActivity()  {
    val viewModel by viewModels<HomeViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HomeScreen(viewModel)
        }
    }
}
```

상품 검색페이지를 나타내는 액티비티 입니다.

View에서 사용하기 위한 ViewModel을 다음과 같이 변수로 선언 후 파라메터로 넘겨줍니다.

---

[ViewModel]

```kotlin

//HomeViewModel
class HomeViewModel(private val productRepository: ProductRepository = DataModule.productRepository) : ViewModel() {
    private  val _isLoading: MutableState<Boolean> = mutableStateOf(value = false)
    val isLoading : State<Boolean> = _isLoading

    private val _searchWidgetState: MutableState<Boolean> = //검색창 활성화 여부
        mutableStateOf(value = false)
    val searchWidgetState: State<Boolean> = _searchWidgetState

    private val _searchTextState: MutableState<String> = //검색 텍스트 값
        mutableStateOf(value = "")
    val searchTextState: State<String> = _searchTextState

    private val _itemList : MutableState<List<ProductListDto>> = mutableStateOf(listOf())
    val itemList:State<List<ProductListDto>> =_itemList; //화면에 표현될 list

    fun updateSearchWidgetState(newState: Boolean) { //활성화 여부 변경 함수
        _searchWidgetState.value = newState
    }

    fun updateSearchTextState(newValue: String) { //검색 텍스트 값 변경 함수
        _searchTextState.value = newValue
    }


```

ViewModel에서는 Screen에서 사용할 변수를 관리하고 갱신하는 함수를 정의합니다.

> Q. private을 선언하고 이를 그대로 public변수에 넣는 이유는 무엇인가요?
>
> "private을 사용하는 이유는 은닉화를 위해서이다. 외부 노출 및 변형을 방지할 수 있다" - by멘토님

---

[Screen]

```kotlin
@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    Search(viewModel) {
        Column(modifier = Modifier.fillMaxSize()) {
            ItemContent(modifier = Modifier.weight(1f), itemList = viewModel.itemList.value)
            CommonComponent.ButtomNavbar()
        }
    }
}
```

HomeScreen에서는 앞서 넘겨준 ViewModel을 파라메터로 입력받습니다.

추가로 화면에서 보여줄 itemList변수를 viewModel로부터 가져오고있는데 이 부분은 향후 api통신과 관련해서 다시 정리하도록 하겠습니다.

```kotlin
@Composable
private fun Search(viewModel: HomeViewModel, content: @Composable () -> Unit) {
    val searchWidgetState by viewModel.searchWidgetState //활성화 여부
    val searchTextState by viewModel.searchTextState // 검색 변수
    val isLoading by viewModel.isLoading //로딩 함수
    val coroutineScope = rememberCoroutineScope() //코루틴 생성

    Scaffold(
        topBar = {
            SearchBar(
                searchWidgetState = searchWidgetState,
                searchTextState = searchTextState,
                onTextChange = {
                    viewModel.updateSearchTextState(newValue = it) //텍스트 값이 바뀌면 해당 텍스트로 변수 업데이트
                },
                onCloseClicked = {
                    viewModel.updateSearchWidgetState(newState = false) // 버튼이 눌리면 Search영역 비활성화

                },
                onSearchClicked = {
                    coroutineScope.launch { viewModel.searchApi(it) } //코루틴에서 Ktor-api호출
                },
                onSearchTriggered = {
                    viewModel.updateSearchWidgetState(newState = true) //Search영역이 클릭되면 Search영역 활성화
                    viewModel.updateSearchTextState("")
                }
            )
        }
    ) {
        if (isLoading) {
            CommonComponent.LoadingSpinner()
        } else {
            content()
        }
    }
}
```

search컴포넌트는 ViewModel로부터 각 변수값을 읽어옵니다.

상단의 검색창과 클릭 처리를 다음과 같이 Scaffold내부에서 처리하도록 구현하였습니다.

이후 로딩상태에 따라 content()호출을 통해 파라메터로 넘어온 상품 리스트 부분에 대한 컴포넌트를 불러옵니다.

```kotlin
@Composable
fun SearchBar(
    searchWidgetState: Boolean,
    searchTextState: String,
    onTextChange: (String) -> Unit,
    onCloseClicked: () -> Unit,
    onSearchClicked: (String) -> Unit,
    onSearchTriggered: () -> Unit
) {
    when (searchWidgetState) {
        false -> {
            DefaultAppBar(
                onSearchClicked = onSearchTriggered, //영역이 비활성화라면 초기에 보여줄 컴포넌트로 보여주기
                text = searchTextState
            )
        }
        true -> {
            SearchAppBar(
                text = searchTextState,
                onTextChange = onTextChange,
                onCloseClicked = onCloseClicked,
                onSearchClicked = onSearchClicked
            )
        }
    }
}
```

상단에서 호출한 SearchBar컴포넌트 입니다.

현재 검색버튼을 눌렀는지 여부에 따라 (searchWidgetState 변수) 각자 다른 디자인의 검색창 화면을 보여줍니다.

```kotlin
@Composable
fun SearchAppBar(
    text: String,
    onTextChange: (String) -> Unit,
    onCloseClicked: () -> Unit,
    onSearchClicked: (String) -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        elevation = AppBarDefaults.TopAppBarElevation,
        color = MaterialTheme.colors.primary
    ) {
        TextField(modifier = Modifier
            .fillMaxWidth(),
            value = text,
            onValueChange = {
                onTextChange(it)
            },
            placeholder = {
                Text(
                    modifier = Modifier
                        .alpha(ContentAlpha.medium),
                    text = "검색하기...",
                    color = Color.White
                )
            },
            textStyle = TextStyle(
                fontSize = MaterialTheme.typography.subtitle1.fontSize
            ),
            singleLine = true,
            leadingIcon = {
                IconButton(
                    modifier = Modifier
                        .alpha(ContentAlpha.medium),
                    onClick = {}
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search Icon",
                        tint = Color.White
                    )
                }
            },
            trailingIcon = {
                IconButton(
                    onClick = {
                        onCloseClicked() //취소 버튼 누르면 closeClick()
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close Icon",
                        tint = Color.White
                    )
                }
            },
            keyboardOptions = KeyboardOptions(
                imeAction = ImeAction.Search
            ),
            keyboardActions = KeyboardActions(
                onSearch = {
                    onSearchClicked(text)
                    onCloseClicked()
                }
            ),
            colors = TextFieldDefaults.textFieldColors(
                backgroundColor = Color.Transparent,
                cursorColor = Color.White.copy(alpha = ContentAlpha.medium)
            ))
    }
}

```

SearchAppBar에서는 "상품 검색 버튼을 눌러 활성화 되었을 때" 나타나는 화면입니다.

반대로 검색창을 닫거나 검색을 눌렀다면 default인 DeefaultAppBar 컴포넌트를 호출합니다.

![디폴트](https://user-images.githubusercontent.com/78795820/202801474-4b818c1b-bd52-4f16-aa04-afcaf5d923da.png) (DefaultAppBar)

![검색](https://user-images.githubusercontent.com/78795820/202802118-d2cea387-2955-495e-8df1-765219a79b37.png) (SearchAppBar)

### 2. 검색 리스트

검색창에 특정 키워드를 입력하면 해당키워드에 대한 결과리스트를 api통신을 통해 가져와 화면에 보여주어야 합니다.

api는 예전 프로젝트에서 사용했던 api를 그대로 재사용했으며 통신을 위해서는 ktor을 사용했습니다.

```kotlin

//data/product/searchList/ProductListDto

@kotlinx.serialization.Serializable
data class ProductListDto(
    val productListDtoList: List<ProductInfoDto>,
    val totalNumber: Int
)
```

```kotlin

//data/product/searhList/ProductInfoDto

@kotlinx.serialization.Serializable
data class ProductInfoDto(
    val imageUrl: String,
    val minimumPrice: Int,
    val title: String,
    val url: String
)

```

검색된 리스트에 대한 데이터타입을 정의한 클래스입니다.

ProductListDto에서 입력된 상품의 개수와 정보리스트를 변수로 가져오고 ProductInfoDto에서 이미지, 최소가격, 이름, url등을 변수로 정의합니다.

또한 api통신의 결과값으로 받아오는 Json형태의 데이터를 객체로 <u>역직렬화</u> 하거나 객체의 데이터를 Json으로 <u>직렬화</u> 하기 위해 <span style="color:red">@kotlinx.serialization.Serializable</span> 애노테이션을 붙여야합니다.

해당 라이브러리 사용을 위해

`implementation "org.jetbrains.kotlinx:kotlinx-serialization-json:1.0.1" ` 의존성을 설정해야합니다.

---

이어서 Domain입니다. MVVM의 Model부분에 해당하는 코드입니다.

```kotlin
//di/DataModule
object DataModule {
    private val client: HttpClient = HttpClient(CIO) {
        install(JsonFeature) {
            serializer = KotlinxSerializer(
                kotlinx.serialization.json.Json {
                    prettyPrint = true
                    isLenient = true
                    ignoreUnknownKeys = true
                }
            )
        }
    }

    val productRepository: ProductRepository = ProductRepositoryImpl(client)

```

우선 DataModule의 경우 Http통신을 위한 client객체를 생성합니다.

Ktor을 사용하기 때문에 다음과 같은 의존성을 추가합니다.

```
    implementation("io.ktor:ktor-client-core:1.6.7")
    implementation("io.ktor:ktor-client-cio:1.6.7")
    implementation("io.ktor:ktor-client-android:1.6.0")
    implementation("io.ktor:ktor-client-serialization:1.4.0")
    implementation "org.jetbrains.kotlinx:kotlinx-serialization-json:1.0.1"
```

또한 <u>Coroutine I/O</u>를 클라이언트로 엔진으로 사용하기 때문에 파라메터로 CIO를 넘겨줍니다.

이후 15번째 줄에서 해당 클라이언트를 사용하는 ProductRepository를 만듭니다.

이런 방식으로 Client를 모듈로 관리하고 의존성 주입방식으로 도메인객체를 사용하는 <span style="color:red">DI방식</span>을 취해야합니다.

> Q. DI란?
>
> > 의존성 주입을 의미. client는 모든 api에서 사용되기 때문에 하나의 모듈로 선언해 보일러플레이트 문제를 방지 할 수 있다.

> > 만약 DB를 바꾸게된다면 각각의 종속적인 DB에 대해 접근하는 메소드를 따로 다 만들어야한다.
> > 하지만 15번째 줄과 같이 이미 구현한 도메인에 대해 사용하려는 도메인만 바꿔주면 전체 코드를 뜯어고치지 않고 쉽게 코드를 수정하고 유지보수 할 수 있다.

---

```kotlin
//domain/product/ProductRepository
interface ProductRepository {
    suspend fun fetchProductList(keyword: String): ProductListDto
}

```

```kotlin
//domain/product/ProductRepositoryImpl
class ProductRepositoryImpl(private val client: HttpClient): ProductRepository {
    override suspend fun fetchProductList(keyword: String): ProductListDto =
        client.get(" ... ")
}
```

각 데이터를 가져오는 api에 대한 메소드를 인터페이스로 선언합니다.

그 후 이를 상속받아 데이터를 가져올 수 있도록 내부 메소드를 구체적으로 구현합니다.

---

```kotlin
//HomeViewModel
suspend fun searchApi(keyword:String) {
        _isLoading.value = true
        withContext(Dispatchers.IO) {
             kotlin.runCatching {
                productRepository.fetchProductList(keyword)
            }.onSuccess {
                 _isLoading.value = false
                 _itemList.value = it.productListDtoList //성공시 데이터 갱신
                 LogHelper.print("succses: ${it.productListDtoList.size}")
             }.onFailure {
                 LogHelper.print("Failure: $it")
             }
        }
    }
```

```kotlin
// HomeScreen
val coroutineScope = rememberCoroutineScope() //코루틴 생성
coroutineScope.launch { viewModel.searchApi(it) } //api호출

```

이어서 ViewModel에서는 api를 호출해 선언한 변수에 값을 저장합니다.

추가로 api통신이 이루어지는 동안 로딩화면을 띄위기 위해 추가적으로 isLoading변수에 값을 넣어 통신이 완료되는지 확인하였습니다.

api통신은 비동기로 처리되어야 하므로 코루틴 기반의 API사용을 위해<u> suspend </u>를 사용합니다.

---

```kotlin
//HomeScreen.kt
@Composable
fun ItemContent(modifier: Modifier = Modifier, itemList: List<ProductInfoDto>) {
    Column(
        modifier = modifier
            .padding(12.dp)
    ) {
        LazyColumn {
            items(items = itemList) {
                ItemRow(item = it)
            }
        }
    }
}
```

각각의 상품리스트를 보여줄 ItemContent입니다.

한 페이지에 다수의 요소를 보여줘야하므로 <u>LazyColumn</u>을 사용해 내부 컴포넌트를 호출합니다.

> LazyColumn이란?
>
> > 화면에 보이는 컴포저블만을 표시하는 Column입니다. 만약 수백개의 데이터가 한 화면을 다 구성하게 된다면 로딩시간이 많이 걸리게 되므로 많은 아이템이 표현될 때 사용해야한다.

```kotlin
@Composable
fun ItemRow(item: ProductInfoDto) { //각 상품에 대한 설명
    val context = LocalContext.current

        Card(
        modifier = Modifier
            .padding(4.dp)
            .fillMaxWidth()
            .height(320.dp),
        shape = RoundedCornerShape(corner = CornerSize(14.dp)),
        elevation = 5.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(230.dp)
            ) {
                AsyncImage(
                    modifier = Modifier
                        .fillMaxWidth(),
                    model = item.imageUrl,
                    contentDescription = "image"
                )
            }
            Column(modifier = Modifier.fillMaxSize(),    verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.h5,
                    overflow = TextOverflow.Ellipsis,
                    maxLines = 1
                )
                Text(
                    text = UnitHelper.getStringFromMoneyInteger(item.minimumPrice),
                    style = MaterialTheme.typography.h6
                )
            }
        }
    }
```

구체적인 화면을 나타내는 컴포넌트입니다.

![image](https://user-images.githubusercontent.com/78795820/202841314-6eb7c9ad-6fed-44ea-a32e-7cf5c908e2ea.png)

이어서 다음부터는 각 상품을 클릭했을 때 구체적인 상품정보를 나타낼 수 있도록 구현해보겠습니다.

## 참고링크

[Stevdza-San-youtube](https://www.youtube.com/watch?v=3oXBnM6fZj0)

[Medium](https://medium.com/hongbeomi-dev/suspend-%ED%95%9C%EC%A0%95%EC%9E%90-%EB%82%B4%EB%B6%80-%EB%8F%99%EC%9E%91-55d2dc819044)
