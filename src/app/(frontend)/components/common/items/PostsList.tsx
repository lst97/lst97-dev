import React from 'react'
import { Post } from '@/frontend/models/Post'
import { NoteItem, NoteList } from './Notes'

interface PostsListProps {
  posts: Post[]
  className?: string
}

export const PostsList: React.FC<PostsListProps> = ({ posts, className }) => {
  return (
    <NoteList className={className}>
      {posts.map((post) => (
        <NoteItem
          key={post.documentId}
          title={post.title}
          date={new Date(post.publishedDate).toISOString()}
          href={`/pages/resources/${post.documentId}`}
          description={post.description}
          icon={post.featuredImage}
          categories={[{ name: post.categories, type: 'normal' }]}
          stats={{
            readingTime: post.readtime,
            views: post.views,
            likes: post.likes,
          }}
        />
      ))}
    </NoteList>
  )
}
