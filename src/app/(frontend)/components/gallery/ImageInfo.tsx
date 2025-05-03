"use client";

import React, { memo } from "react";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { ImageInfo } from "./types";

export const ImageEmbeddedInfo = memo(
	({
		info,
	}: Readonly<{
		info: ImageInfo;
	}>) => {
		return (
			<div className='flex flex-col'>
				<div className='text-lg font-bold'>{info.name}</div>
				<div className='text-sm'>{info.caption}</div>
			</div>
		);
	}
);

ImageEmbeddedInfo.displayName = "ImageEmbeddedInfo";

export const ImageInfoAction = memo(
	({
		action,
	}: Readonly<{
		action: React.ReactNode;
	}>) => {
		const [open, setOpen] = React.useState(false);

		const handleOpen = React.useCallback(() => {
			setOpen(true);
		}, []);

		const handleClose = React.useCallback(() => {
			setOpen(false);
		}, []);

		return (
			<>
				<InformationCircleIcon
					onClick={handleOpen}
					className='max-h-8 max-w-8 hover:cursor-pointer hover:fill-amber-200 hover:bg-black hover:rounded-2xl'
				/>

				{open && (
					<div
						className='fixed inset-0 hover:cursor-pointer bg-amber-100 bg-opacity-80 backdrop-blur-md'
						onClick={handleClose}
					>
						<div className='flex justify-center items-center h-screen'>
							{action}
						</div>
					</div>
				)}
			</>
		);
	}
);

ImageInfoAction.displayName = "ImageInfoAction";
