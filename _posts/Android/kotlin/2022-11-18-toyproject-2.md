---
title: 토이프로젝트(최저가 쇼핑몰 리스트) - 2

categories:
  - Kotlin
tags:
  - Ktor
  - Coroutine
  - Jetpack Compose

toc: true
toc_sticky: true
toc_label: "목차"

date: 2022-11-18 +0900
last_modified_at: 2022-11-18 +0900
---

### 3. 상품 상세 페이지

```kotlin
//HomeScreen.kt

val context = LocalContext.current
Card(
 modifier = Modifier
            .padding(4.dp)
            .fillMaxWidth()
            .height(320.dp)
            .clickable {
                context.startActivity(
                    Intent(context, DetailActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        putExtra("url", item.url)
                    }
                )
            },
    ...
```

기존의 HomeScreen의 ItemRow에서 clickable에 다음 코드를 추가합니다.

여기서 context란 Activity와 어플리케이션의 정보를 얻기 위해 사용되며 상품 상세페이지에 해당하는 DetailActivity에 접근하기 위해 사용하며 Intent에 호출할 객체를 지정합니다.

특히 저는 상품상세페이지의 데이터를 불러오는 api에서 식별자로 url을 사용해서 해당 값을 파라메터로 넘겨주었습니다.

(사실 이부분은 아직 개념이 미흡합니다😢.. 피드백 & 지적주시면 감사하겠습니다!)

---

```kotlin
class DetailActivity : ComponentActivity() {
    val viewModel by viewModels<DetailViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val url = intent.getStringExtra("url")

        setContent {
            if (url != null) {
                DetailScreen(viewModel, url) { finishActivity() }
            }
        }
    }

    private fun finishActivity() {
        finish()
    }
}
```

Activity입니다. 파라메터로 넘겨받은 url을 변수로 선언하였으며 해당값이 있다면 Screen을 호출합니다.

특히 이전버튼을 눌렀을 때 해당 화면을 종료해야 하므로 이를 함수로 선언하며 파라메터로 넘겨주었습니다.

---

```kotlin
@kotlinx.serialization.Serializable
data class DetailDto(
    val image: String,
    val mallInfoDto: List<MallInfoDto>,
    val minimumPrice: Int,
    val title: String,
    val url: String
)

@kotlinx.serialization.Serializable
data class MallInfoDto(
    val delivery: Int,
    val interestFree: String,
    val link: String,
    val name: String,
    val paymentOption: String,
    val price: Int
)
```

```kotlin
interface ProductRepository {
    suspend fun fetchProductList(keyword: String): ProductListDto
    suspend fun fetchProductDetail(url: String): DetailDto //추가
}
```

```kotlin
class ProductRepositoryImpl(private val client: HttpClient): ProductRepository {
    override suspend fun fetchProductList(keyword: String): ProductListDto =
        client.get("...")

    override suspend fun fetchProductDetail(url: String): DetailDto =
        client.get("...}") //추가
}
```

상품 상세페이지에 필요한 데이터타입을 정의하고 도메인에 해당 api와 메소드를 추가합니다.

각 코드는 이전 포스팅에서 작성했던 내용과 유사합니다.

---

```kotlin

class DetailViewModel(private val productRepository: ProductRepository = DataModule.productRepository) : ViewModel() {
    private val _detailInfo: MutableState<DetailDto> = mutableStateOf<DetailDto>(
        DetailDto(
            "",
            listOf(), 0, "", ""
        )
    )
    val detailInfo: MutableState<DetailDto> = _detailInfo; //화면에 표현될 list

    private val _isLoading: MutableState<Boolean> = mutableStateOf(value = false)
    val isLoading: State<Boolean> = _isLoading

    suspend fun getDetailInfo(url: String) {
        withContext(Dispatchers.IO) {
            _isLoading.value = true
            kotlin.runCatching {
                productRepository.fetchProductDetail(url)
            }.onSuccess {
                _detailInfo.value = it //성공시 데이터 갱신
                _isLoading.value = false
            }
        }
    }
}
```

DetailViewModel에서는 DetailView에서 사용된 변수들을 선언하고 관리합니다.

DetailDto의 초기값으로 현재는 생성자를 통해 빈 값을 넣었지만 사실 초기값은 <span style="color:red">Null</span>값으로 선언 후 해당 값이 내용에 따라 로직을 처리하는게 더 좋은 방식이라고 멘토님께서 말씀해주셨습니다.

마찬가지로 로딩화면구현을 위해 해당 변수를 추가하였고 위의 Model로부터 api를 호출받아 값을 갱신합니다.

---

```kotlin
//ui/component/CommonComponent
    @Composable
    fun LoadingSpinner() {
        Column(
            Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally


        ) {

            CircularProgressIndicator(
                modifier = Modifier.drawBehind {
                    drawCircle(
                        Color.Blue,
                        radius = size.width / 2 - 5.dp.toPx() / 2,
                        style = Stroke(5.dp.toPx())
                    )
                }, color = Color.LightGray, strokeWidth = 5.dp
            )

            Text(modifier = Modifier.padding(8.dp), text = "데이터를 불러오는 중 입니다")

        }

    }
}
```

로딩화면입니다. 해당 컴포넌트는 여러 화면에서 공통으로 사용하기때문에 따로 CommonComponent로 분리하여 코드를 작성하였습니다.

```kotlin
@Composable
fun DetailScreen(viewModel: DetailViewModel, url: String, back:() -> Unit) {

    val coroutineScope = rememberCoroutineScope() //코루틴 생성
    val isLoading by viewModel.isLoading //로딩 확인

    LaunchedEffect(true){
        coroutineScope.launch{viewModel.getDetailInfo(url)}
    }

    if(isLoading) {
        CommonComponent.LoadingSpinner()
    }
    else{
        DetailComponent(back, itemList = viewModel.detailInfo.value)
    }
}
```

이어서 Screen에서는 로딩상태에 따라 상품상세피이지 또는 로딩화면을 화면에 표현합니다.

앞과 마찬가지로 코루틴을 생성해 api를 호출합니다,

```kotlin
@Composable
private fun DetailComponent(
    back: () -> Unit,
    itemList: DetailDto,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(imageVector = Icons.Default.ArrowBack,
                contentDescription = "back",
                modifier = Modifier.clickable {
                    back()
                })
            Text(
                text = itemList.title, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center , style = MaterialTheme.typography.h5
            )
        }

            AsyncImage(
                model = itemList.image, //
                contentDescription = "image",
                modifier = Modifier.fillMaxWidth()
            )

                Text(
            text = "쇼핑몰 정보", modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.h5

        )
        LazyColumn{
            items(items = itemList.mallInfoDto){
                MallList(item = it)
            }
        }
    }
}
```

특정 상품을 눌렀을 때 나오는 화면요소입니다.

이전 버튼을 누르면 종료하도록 Acitivty에서 선언한 finish()함수를 호출합니다.

특정 상품마다 가지는 쇼핑몰정보또한 여러 개를 가지므로 LazyColumn을 사용했습니다.

```kotlin
@Composable
fun MallList(item: MallInfoDto) { //각 상품에 대한 설명
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .padding(4.dp)
            .fillMaxWidth()
            .height(60.dp)
            .clickable {
                context.startActivity(
                    Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse(item.link)
                    )
                )
            }
    ) {

            Column(modifier = Modifier.padding(2.dp), verticalArrangement = Arrangement.Center) {
                Row( modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(
                        text = item.name,
                        style = MaterialTheme.typography.h6
                    )
                    Text(
                        text = UnitHelper.getStringFromMoneyInteger(item.price),
                        style = MaterialTheme.typography.h6,
                        color = Color.Blue

                    )
                }
            }
    }
}
```

마지막으로 해당 상품의 쇼핑몰 리스트입니다.

![detailView](https://user-images.githubusercontent.com/78795820/202844361-9fb9d2d3-1659-42e8-8f2d-1d63d69158e3.png){: .center}

### 애니메이션 효과 넣기

대체로 많은 앱에서는 상단의 검색창 부분이 스크롤을 내리면 사라지고 다시 올리면 나타나는 효과를 넣고 있었습니다.

저 또한 이런 기능을 넣어보고자 하였고 프로젝트에 적용해보았습니다.

---

```kotlin
    //HomeViewModel
    private var lastScrollIndex = 0
    private val _scrollUp = MutableLiveData(false)
    val scrollUp: LiveData<Boolean>
        get() = _scrollUp

    fun updateScrollPosition(newScrollIndex: Int) {
        if (newScrollIndex == lastScrollIndex) return
        _scrollUp.value = newScrollIndex > lastScrollIndex
        lastScrollIndex = newScrollIndex
    }
```

검색화면의 ViewModel인 HomeViewModel에 다음과 같이 관리할 변수를 추가합니다.

scrollUp변수는 검색창을 나타내거나 숨길지 의미하는 boolean변수이며

마지막 스크롤위치인 LastScrollIndex값을 통해 scrollUp변수를 갱신합니다.

만약 이전값보다 값이 높다면 (= 스크롤을 올리면) 검색 창을 띄우며 그렇지 않다면 숨깁니다.

---

```kotlin
@Composable
fun HomeScreen(viewModel: HomeViewModel) {

    val scrollState = rememberLazyListState()
    val scrollUpState = viewModel.scrollUp.observeAsState()
    viewModel.updateScrollPosition(scrollState.firstVisibleItemIndex)

    Search(viewModel,scrollUpState) {
        Column(modifier = Modifier.fillMaxSize()) {
            ItemContent(modifier = Modifier.weight(1f), itemList = viewModel.itemList.value, scrollState=scrollState)
            CommonComponent.ButtomNavbar()
        }
    }
}

```

이어서 HomeScreen에 현재 스크롤 위치를 의미하는 scrollState와 화면에 나타낼 지 의미하는 scrollState변수를 모델로부터 가져옵니다.

또한 현재 위치에 해당하는 스크롤위치를 갱신합니다.

```kotlin
@Composable
fun ItemContent(modifier: Modifier = Modifier, itemList: List<ProductInfoDto>, scrollState:LazyListState) {
    Column(
        modifier = modifier
            .padding(12.dp)
    ) {
        LazyColumn(state = scrollState) {
            items(items = itemList) {
                ItemRow(item = it)
            }
        }
    }
}
```

실제 스크롤값을 읽기 위해 상품 리스트부분을 호출하는 LazyColumn의 state에 scrollState값을 지정합니다.

```kotlin
@Composable
fun SearchBar(
    searchWidgetState: Boolean,
    searchTextState: String,
    onTextChange: (String) -> Unit,
    onCloseClicked: () -> Unit,
    onSearchClicked: (String) -> Unit,
    onSearchTriggered: () -> Unit,
    scrollUpState : State<Boolean?>

    ) {

    val position by animateFloatAsState(if (scrollUpState.value == true) -150f else 0f)
    val height = if(scrollUpState.value == true) 0 else 50

    when (searchWidgetState) {
        false -> {
            DefaultAppBar(
                onSearchClicked = onSearchTriggered, //영역이 비활성화라면 초기에 보여줄 컴포넌트로 보여주기
                text = searchTextState,
                position = position,
                height = height
            )
        }
        true -> {
            SearchAppBar(
                text = searchTextState,
                onTextChange = onTextChange,
                onCloseClicked = onCloseClicked,
                onSearchClicked = onSearchClicked,
                position = position,
                height = height
            )
        }
    }
}
```

```kotlin
// SearchAppBar Component
Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(height.dp)
            .graphicsLayer { translationY = (position) },
        elevation = AppBarDefaults.TopAppBarElevation,
        color = MaterialTheme.colors.primary
    )
```

scrollUpState에 따라 position과 높이를 변수로 지정 후

검색창을 보여줄 때 해당 변수값을 넣어 스크롤에 따른 애니메이션 효과를 넣었습니다.

### 마치며

Kotiln 사용은 이번이 처음이였고 개념도 많이 부족해서 걱정이 많았습니다.

사실 모든 이론을 다 이해하고 실제 코드 작성으로 들어간다면 좋겠지만 시간문제도 있고 원래 공부스타일이 무작정 코드를 따라해보며 결과물을 먼저 만든 후 개념을 이해했기 때문에 이번에도 비슷하게 스터디를 진행했던 것 같습니다.

특히 공부 중 모르는 부분이나 방향성 자체를 잡는데 GDSC활동이 정말 큰 도움이 되었습니다.

스터디의 가장 큰 이점은 질의응답을 빠르고 의견공유를 활발하게 할 수 있다는 점 같아요.

회사에서 현업자로 일하시고계시는 팀원분이 코어멤버로 계셨는데 핵심만 딱 짚고 배워야할 기술을 잘 정리해주셔서 너무 좋았습니다 ㅎㅎㅎ (실명까고 칭송하고싶지만 참겠습니다.. )

![image](https://user-images.githubusercontent.com/78795820/202846032-ae80258c-6af3-44fb-bde5-9565bfb944e6.png){: width="600" height="800"}{: .center}

특히 Spring에서 배웠던 개념이나 디자인패턴들이 이곳에서도 사용된다는 부분을 많이 느꼈고 자신이 선호하는 분야 외에도 열린사고로 다양한 언어나 개발공부를 배운다면 결국 언젠가는 도움이 되겠다고 다시한번 확신할 수 있었습니다.

많이 미흡한건 맞지만 이번기회로 안드로이드쪽 공부도 더 깊게 진행해보고 싶네요. 😄

### 참고자료

[https://proandroiddev.com...](https://proandroiddev.com/scrollable-topappbar-with-jetpack-compose-bf22ca900cfe)
