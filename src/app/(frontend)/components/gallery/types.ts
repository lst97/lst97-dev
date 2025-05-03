export interface ImageInfo {
	caption?: string;
	alternativeText?: string;
	createdAt?: string;
	ext?: string;
	hash?: string;
	height?: number;
	mime?: string;
	name?: string;
	previewUrl?: string;
	provider?: string;
	provider_metadata?: string;
	size?: number;
	updatedAt?: string;
	url?: string;
	width?: number;
}

export interface ImageViewerProps {
	src: string;
	open?: boolean;
	info?: ImageInfo;
	action?: React.ReactNode;
	maxSize: { x: number; y: number };
	onClose?: () => void;
	stayOnTop?: boolean;
}

export interface GalleryProps {
	srcs: string[];
	onChange?: (idx: number) => void;
	onClose?: () => void;
}
