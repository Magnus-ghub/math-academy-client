import { ReportReason, ReportType } from "@/lib/enums/report.enum";

export interface ReportInput {
  reportType: ReportType;
  reportReason: ReportReason;
  reportText?: string;
  questionId?: string;
  testId?: string;
}