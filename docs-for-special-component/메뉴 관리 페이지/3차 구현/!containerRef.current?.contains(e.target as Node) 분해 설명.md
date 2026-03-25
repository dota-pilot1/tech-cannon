!containerRef.current?.contains(e.target as Node) 분해 설명
1. containerRef.current
const containerRef = useRef<HTMLDivElement>(null)

<div ref={containerRef}>  // ← 이 div 요소를 가리킴
  <input />
</div>
파란색 박스 전체 영역을 가리키는 참조
2. .contains(e.target as Node)
containerRef.current.contains(e.target)
contains() 메서드:
DOM API 메서드
"이 요소 안에 클릭된 요소가 포함되어 있니?"
반환값: true (내부) 또는 false (외부)
예시:
// 사용자가 input을 클릭
containerRef.current.contains(input 요소)
→ true (input은 container 안에 있음)

// 사용자가 트리의 다른 메뉴를 클릭
containerRef.current.contains(다른 메뉴 요소)
→ false (다른 메뉴는 container 밖에 있음)
3. e.target as Node
e.target as Node
e.target: 실제로 클릭된 DOM 요소
as Node: TypeScript 타입 캐스팅 (contains는 Node 타입을 받음)
4. ?. (Optional Chaining)
containerRef.current?.contains(...)
containerRef.current가 null일 수도 있음
null이면 undefined 반환 (에러 발생 안 함)
null이 아니면 .contains() 실행
5. ! (Not 연산자)
!containerRef.current?.contains(e.target)
결과를 반대로 뒤집음
true → false, false → true
전체 로직 흐름
// 클릭 이벤트 발생
const handleClickOutside = (e: MouseEvent) => {
  if (!containerRef.current?.contains(e.target as Node)) {
    onCancel()
  }
}
경우의 수:
클릭 위치	contains 결과	! 적용 후	동작
input 내부	true	false	onCancel 실행 안 함 ✅
파란 박스 내부	true	false	onCancel 실행 안 함 ✅
외부 (다른 메뉴)	false	true	onCancel 실행 ✓
외부 (빈 공간)	false	true	onCancel 실행 ✓
시각적 예시
┌─────────────────────── 화면 ─────────────────────┐
│                                                   │
│  📁 유저 관리                                     │
│    ┌──────────────────────────────┐ ← container  │
│    │ 📄 [권한 관리___________]    │              │
│    │         ↑                    │              │
│    │      input 영역              │              │
│    └──────────────────────────────┘              │
│                                                   │
│  📁 시스템 관리  ← 여기 클릭하면?                │
│                                                   │
└───────────────────────────────────────────────────┘

시나리오 1: input 내부 클릭
→ contains = true
→ !true = false
→ if (false) { onCancel() } ← 실행 안 됨

시나리오 2: "시스템 관리" 클릭 (외부)
→ contains = false
→ !false = true
→ if (true) { onCancel() } ← 실행됨!
좀 더 직관적으로 풀어쓰면:
// 원본 코드
if (!containerRef.current?.contains(e.target as Node)) {
  onCancel()
}

// 같은 의미 (더 읽기 쉽게)
const isClickedInside = containerRef.current?.contains(e.target as Node)
const isClickedOutside = !isClickedInside

if (isClickedOutside) {
  onCancel()
}

// 또는
if (containerRef.current?.contains(e.target as Node)) {
  // 내부 클릭: 아무것도 안 함
} else {
  // 외부 클릭: 취소
  onCancel()
}