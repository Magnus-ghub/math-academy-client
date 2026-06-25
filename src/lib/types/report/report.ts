import { ReportReason, ReportStatus, ReportType } from "@/lib/enums/report.enum";

export interface Report {
  id: string;
  reportType: ReportType;
  reportStatus: ReportStatus;
  reportReason: ReportReason;
  reportText?: string;
  userId: string;
  questionId?: string;
  testId?: string;
  testTitle?: string;
  questionOrder?: number;
  createdAt: string;
}