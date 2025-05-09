'use client'

import React from 'react'
import { LexicalNode } from '../../types'
import { ListItem } from './ListItem'

interface ListProps {
  node: LexicalNode
  index: number
}

export const List: React.FC<ListProps> = ({ node, index }) => {
  if (!node.children) return null

  const listType = node.listType || 'bullet'

  switch (listType) {
    case 'number':
      return (
        <ol key={`ol-${index}`} className="list-none mb-4 pl-8 counter-reset-[pixel-counter]">
          {node.children.map((item, i) => (
            <ListItem key={i} node={item} index={i} listType="number" />
          ))}
        </ol>
      )
    case 'check':
      return (
        <ul key={`ul-check-${index}`} className="list-none mb-4 pl-8">
          {node.children.map((item, i) => (
            <ListItem key={i} node={item} index={i} isCheckList />
          ))}
        </ul>
      )
    case 'bullet':
    default:
      return (
        <ul key={`ul-${index}`} className="list-none mb-4 pl-8">
          {node.children.map((item, i) => (
            <ListItem key={i} node={item} index={i} listType="bullet" />
          ))}
        </ul>
      )
  }
}
