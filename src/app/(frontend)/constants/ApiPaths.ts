export const CMS_BASE_URL = "http://localhost:1337/api";

export const CMS_API_PATHS = {
	POSTS: {
		GET_ALL: `/posts`,
		GET_BY_ID: (id: string) => `/posts/${id}`,
	},
};
