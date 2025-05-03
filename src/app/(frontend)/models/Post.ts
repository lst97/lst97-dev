import { BlocksContent } from "@strapi/blocks-react-renderer";

export interface Post {
	title: string;
	publishedDate: string;
	documentId: string;
	content: BlocksContent;
	featuredImage?: string;
	views: number;
	likes: number;
	readtime: number;
	categories: string;
	description?: string;
	featuredPost: boolean;
	postStatus: string;
}
