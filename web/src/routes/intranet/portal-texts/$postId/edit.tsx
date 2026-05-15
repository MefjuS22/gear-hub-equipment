import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { gearhubApiClientOptions } from "../../../../api/clientOptions";
import { getApiCmspostId } from "../../../../api/generated/client";
import { CmsPostEditorView } from "../../../../ui/intranet/CmsPostEditorView";

export const Route = createFileRoute("/intranet/portal-texts/$postId/edit")({
  loader: async ({ params }) => {
    try {
      const post = await getApiCmspostId(params.postId, {
        ...gearhubApiClientOptions,
      });
      if (post.id == null || post.id === "") {
        throw redirect({ to: "/intranet/portal-texts" });
      }
      return { post };
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: "/intranet/portal-texts" });
    }
  },
  component: EditCmsPostPage,
});

function EditCmsPostPage() {
  const { post } = Route.useLoaderData();
  return <CmsPostEditorView mode="edit" postId={post.id!} post={post} />;
}
