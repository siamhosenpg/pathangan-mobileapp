import { baseApi } from "../baseApi";
export type ReportTargetType = "post" | "user" | "answer" | "comment";

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "misinformation"
  | "inappropriate_content"
  | "violence"
  | "copyright"
  | "self_harm"
  | "impersonation"
  | "other";

interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

interface CreateReportResponse {
  success: boolean;
  message: string;
}

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation<CreateReportResponse, CreateReportPayload>({
      query: (body) => ({
        url: "/moderation/report",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateReportMutation } = reportApi;
