export interface CVLeftSideItem {
	id: string;
	text: string;
	link?: string;
	progress?: number;
}

export interface CVLeftSideSection {
	id: string;
	title: string;
	items: CVLeftSideItem[];
}

export interface CVProjectBulletPoint {
	id: string;
	text: string;
}

export interface CVSectionAction {
	title: string;
	link: string;
}

export interface CVSectionItem {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	bulletPoints: CVProjectBulletPoint[];
	icon?: string;
	action?: CVSectionAction;
}

export interface CVRightSideSection {
	id: string;
	title: string;
	description?: string;
	items: CVSectionItem[];
	icon?: string;
	action?: CVSectionAction;
}

export interface CVPage {
	leftSections: CVLeftSideSection[];
	rightSections: CVRightSideSection[];
	header?: {
		name: string;
		jobTitle: string;
		location: string;
		phone: string;
		email: string;
		imageUrl: string;
	};
}

export interface CVData {
	pages: CVPage[];
}
