'use client'

import React from 'react'
import { LexicalNode } from '../types'
import { TextFormat } from './TextFormat'
import { Link } from './Link'

interface NodeRendererProps {
  node: LexicalNode | null
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ node }) => {
  if (!node) return null

  if (node.text) {
    return <TextFormat node={node} index={0} />
  }

  if (node.children && node.children.length > 0) {
    return (
      <>
        {node.children.map((childNode, index) => {
          // Special handling for link nodes
          if (
            childNode.type === 'link' ||
            (childNode.fields && childNode.fields.url) ||
            childNode.url
          ) {
            return <Link key={index} node={childNode} index={index} />
          }

          return <NodeRenderer key={index} node={childNode} />
        })}
      </>
    )
  }

  return null
}
