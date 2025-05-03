"use client";

import {
	BlocksRenderer,
	type BlocksContent,
} from "@strapi/blocks-react-renderer";
import Link from "next/link";
import { type ReactNode } from "react";
import { CodeBlockRenderer, SupportedLanguage } from "./CodeBlockRenderer";
import { ImageInfo, PkmImageViewer } from "./ImageGallery";

// Define heading styles configuration
const HEADING_STYLES = {
	1: "text-4xl font-bold mb-4",
	2: "text-3xl font-semibold mb-3",
	3: "text-2xl font-medium mb-2",
	4: "text-xl font-medium mb-2",
	5: "text-lg font-medium mb-1",
	6: "text-base font-medium mb-1",
} as const;

type HeadingLevel = keyof typeof HEADING_STYLES;

// Component blocks configuration
const BLOCKS_CONFIG = {
	paragraph: ({ children }: { children?: ReactNode }) => {
		if (Array.isArray(children)) {
			return (
				<p>
					{children.map((child, index) => {
						if (child.props.code) {
							return (
								<code key={index} className='bg-amber-100 px-1 rounded-md py-1'>
									{child}
								</code>
							);
						}
						return child;
					})}
				</p>
			);
		}
		return <p>{children}</p>;
	},
	heading: ({
		children,
		level,
	}: {
		children?: ReactNode;
		level: HeadingLevel;
	}) => {
		const className = HEADING_STYLES[level] || HEADING_STYLES[1];
		const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
		return <HeadingTag className={className}>{children}</HeadingTag>;
	},
	link: ({ children, url }: { children?: ReactNode; url: string }) => (
		<Link href={url}>{children}</Link>
	),
	code: ({
		children,
		language,
	}: {
		children?: ReactNode;
		language?: SupportedLanguage;
	}) => <CodeBlockRenderer language={language}>{children}</CodeBlockRenderer>,
	quote: ({ children }: { children?: ReactNode }) => {
		if (Array.isArray(children)) {
			return (
				<div className='relative pl-6 border-l-4 border-amber-300 my-4 inline-block'>
					{children.map((child, index) => (
						<div key={index} className='relative'>
							<span className='absolute -left-4 -top-2 text-4xl text-amber-300'>
								&quot;
							</span>
							<div className='bg-amber-50/50 p-4'>
								<p className='text-amber-700 font-serif text-lg italic'>
									{child}
								</p>
							</div>
						</div>
					))}
				</div>
			);
		}
	},
	image: ({ children, image }: { children?: ReactNode; image?: any }) => {
		return (
			<PkmImageViewer
				info={{
					...(image as ImageInfo),
				}}
				src={image?.url ?? ""}
				maxSize={{
					x: image?.height ?? 1024,
					y: image?.width ?? 768,
				}}
			/>
		);
	},
};

// Component modifiers configuration
const MODIFIERS_CONFIG = {
	bold: ({ children }: { children: ReactNode }) => <strong>{children}</strong>,
	italic: ({ children }: { children: ReactNode }) => (
		<span className='italic'>{children}</span>
	),
	strikethrough: ({ children }: { children: ReactNode }) => (
		<span className='pixel-strikethrough'>{children}</span>
	),
	underline: ({ children }: { children: ReactNode }) => (
		<span className='pixel-underline'>{children}</span>
	),
};

interface BlockRendererClientProps {
	readonly content: BlocksContent;
}

export const BlockRendererClient = ({ content }: BlockRendererClientProps) => {
	if (!content) return null;

	return (
		<BlocksRenderer
			content={content}
			blocks={BLOCKS_CONFIG}
			modifiers={MODIFIERS_CONFIG}
		/>
	);
};
