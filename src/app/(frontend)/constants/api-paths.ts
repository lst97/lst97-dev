export const CMS_BASE_URL = `/api`

export const CMS_API_PATHS = {
  POSTS: {
    GET_ALL: `${CMS_BASE_URL}/custom/posts`,
    GET_BY_ID: (id: string) => `${CMS_BASE_URL}/custom/posts/${id}`,
    GET_BY_SLUG: (slug: string) =>
      `${CMS_BASE_URL}/custom/posts/by-slug?slug=${encodeURIComponent(slug)}`,
  },
}
