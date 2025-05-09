import { Post } from '@/frontend/models/Post'
import { BlockRendererClient } from '@/frontend/components/common/renderers'

export type Attribute = Post
export const AttributesViewer = ({
  attributes,
  type,
}: {
  attributes: Attribute[]
  type: 'post'
}) => {
  const renderAttributesContent = (attr: Attribute) => {
    switch (type) {
      case 'post': {
        const post = attr as Post

        return <BlockRendererClient content={post.content} />
      }
      default:
        return null
    }
  }

  return (
    <div>
      {attributes.map((attr, index) => {
        return <div key={'resources_attrs_' + index}>{renderAttributesContent(attr)}</div>
      })}
    </div>
  )
}
