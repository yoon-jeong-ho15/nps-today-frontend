import { RecordsTable } from "../RecordsTable";
import type { RecordWithCompany } from "~/types/domain";
export function DayRecordsTable({
  selectedRecords,
}: {
  selectedRecords: RecordWithCompany[];
}) {
  return <RecordsTable records={selectedRecords} />;
}
