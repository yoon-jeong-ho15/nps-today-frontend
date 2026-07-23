import type { Route } from "./+types/date-detail";
import { useParams, useNavigate } from "react-router";
import DayDashboard from "../components/dashboard/day";
import { useDateDetailData } from "~/hooks/useDateDetailData";

export function meta({ params }: Route.MetaArgs) {
  const dateStr = params.date || "";
  let formattedDate = dateStr;
  if (dateStr.length === 8) {
    formattedDate = `${dateStr.substring(0, 4)}년 ${parseInt(dateStr.substring(4, 6), 10)}월 ${parseInt(dateStr.substring(6, 8), 10)}일`;
  }
  return [
    { title: `NPS today - ${formattedDate} 거래 동향` },
    {
      name: "description",
      content: `국민연금공단(NPS) 코스피 주식 ${formattedDate} 일별 동향 대시보드`,
    },
  ];
}

export default function DateDetailRoute() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();

  const {
    data,
    companies,
    selectedDate,
    todayDate,
    initialLoading,
    dataLoading,
    error,
  } = useDateDetailData(routeDate);

  const handleDateChange = (newDate: string) => {
    navigate(`/date/${newDate}`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            대시보드 초기화 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            대시보드 로드 오류
          </h3>
          <p className="text-muted-foreground text-sm mt-2 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500 active:bg-yellow-600 dark:active:bg-yellow-750 text-white dark:text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased selection:bg-emerald-500/30 transition-colors">
      <DayDashboard
        data={data}
        companies={companies}
        selectedDate={selectedDate}
        onChangeDate={handleDateChange}
        todayDate={todayDate}
        dataLoading={dataLoading}
      />
    </div>
  );
}
