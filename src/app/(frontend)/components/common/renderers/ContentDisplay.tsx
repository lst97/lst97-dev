import { Attribute, AttributesViewer } from "../attribute/AttributeViewer";

export const ContentDisplay = ({
	attributes,
	type,
}: {
	attributes: Attribute[];
	type: "post";
}) => {
	return <AttributesViewer attributes={attributes} type={type} />;
};
