# NPS Today 프런트엔드

React Router, React, TypeScript, Supabase를 사용하는 거래 동향 대시보드입니다.

## 로컬 실행

Node.js 20.19+ 또는 22.12+와 pnpm 10.33.4를 사용합니다.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

`.env.local`에 다음 공개 설정을 지정합니다. 서버용 secret 키를 넣지 마세요.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## 검증

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

`pnpm test`는 집계·페이지 조회 단위 테스트와 Chromium에서 실행하는 비동기 훅 테스트를 포함합니다. 브라우저가 없다면 `pnpm exec playwright install chromium`으로 설치합니다. 테스트는 모의 응답을 사용하며 운영 DB에 접근하지 않습니다.

## 코드 구조

- `app/services`: Supabase 조회, 페이지 순회, 응답 숫자 정규화
- `app/hooks/useAsyncData.ts`: 요청 취소, 이전 응답 무시, 초기 로딩·재조회·오류 상태
- `app/hooks`: 화면별 조회 조합과 검색 상태
- `app/lib/tradeAnalysis.ts`: 거래일별 기록을 확인하는 연속 매매 계산
- `app/components`: 화면 표시와 사용자 입력

기업 목록은 동시에 진행 중인 요청만 공유합니다. 완료 후에는 새 요청으로 다시 조회하므로 영구 캐시가 남지 않습니다. 화면별 요청은 취소 신호를 전달하며, 공유하는 기업 목록 요청은 각 소비자가 이전 응답을 무시합니다.

일별 합계는 기존 DB API를 유지하기 위해 페이지를 순차 조회하며 합산합니다. 중간 페이지가 실패하면 전체 조회를 실패 처리합니다. 데이터 전송량 자체를 줄이려면 추후 DB 집계 RPC 도입이 필요합니다.

## 배포

```sh
pnpm build
pnpm start
```

Dockerfile도 동일한 pnpm 잠금 파일을 사용합니다. Vite 환경변수는 프런트엔드 빌드 시 반영되므로 이미지 빌드 전에 설정 파일을 준비해야 합니다. 프런트엔드 변경에는 Python 수집 코드나 AWS Lambda 재배포가 필요하지 않습니다.
