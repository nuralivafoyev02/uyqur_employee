import { SuggestionsContent } from "@/components/suggestions/suggestions-content";
import { requireViewer } from "@/lib/auth";
import {
  saveSuggestionAction,
  updateSuggestionStatusAction,
} from "@/lib/actions/suggestions";
import { getSuggestionsPageData } from "@/lib/queries/suggestions";

type SuggestionsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    employeeId?: string;
    page?: string;
  }>;
};

export default async function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const data = await getSuggestionsPageData(viewer, filters);

  return (
    <SuggestionsContent
      data={data}
      saveAction={saveSuggestionAction}
      updateStatusAction={updateSuggestionStatusAction}
    />
  );
}
